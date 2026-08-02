import { expect, test, type Page } from "@playwright/test";

const route = "/projects/learn/cell-architecture";
const modelUrls = {
  animal: "/models/cell-architecture-studio/animal-cell-nih.glb",
  neuron: "/models/cell-architecture-studio/neuron-nih.glb",
  bacteriaWall: "/models/cell-architecture-studio/bacteria-wall-nih.glb",
} as const;

async function getTransferredBytes(page: Page) {
  return page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;
    const resources = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];

    return (
      (navigation?.transferSize ?? 0) +
      resources.reduce((total, resource) => total + resource.transferSize, 0)
    );
  });
}

test("FAIL-001: JavaScript 关闭后仍有完整 2D 内容", async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:3100",
    javaScriptEnabled: false,
  });
  const page = await context.newPage();

  await page.goto(route);

  await expect(page.getByRole("heading", { level: 1 })).toContainText("看见一颗细胞");
  await expect(page.locator('[data-fact-id="CELL-MEMBRANE-001"]')).toContainText("细胞膜");
  await expect(page.locator('[data-fact-id="CELL-NUCLEUS-001"]')).toContainText("细胞核");
  await expect(page.locator('[data-fact-id="CELL-MITO-001"]')).toContainText("线粒体");
  await expect(page.getByText("当前浏览器关闭了 JavaScript")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);

  await context.close();
});

test("UI-001/UI-004: 外部按钮支持鼠标和键盘并同步稳定 ID", async ({ page }) => {
  await page.goto(route);

  const nucleusButton = page.getByRole("button", { name: /细胞核/ });
  await nucleusButton.click();
  await expect(nucleusButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-selected-structure="nucleus"]')).toContainText(
    "保存细胞的大部分遗传物质",
  );

  const mitochondrionButton = page.getByRole("button", { name: /线粒体/ });
  await mitochondrionButton.focus();
  await mitochondrionButton.press("Enter");
  await expect(mitochondrionButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-selected-structure="mitochondrion"]')).toContainText(
    "ATP",
  );
});

test("OBS-001: 三道观察题支持作答、反馈和订正到 3/3", async ({ page }) => {
  await page.goto(route);

  const challenge = page.getByTestId("cell-observation-challenge");
  const membraneQuestion = challenge.locator(
    '[data-question-id="cell-membrane"]',
  );
  const nucleusQuestion = challenge.locator('[data-question-id="nucleus"]');
  const mitochondrionQuestion = challenge.locator(
    '[data-question-id="mitochondrion"]',
  );
  const checkButton = challenge.getByRole("button", { name: "检查答案" });

  await expect(challenge).toContainText("已作答 0/3");
  await expect(checkButton).toBeDisabled();

  const wrongMembraneAnswer = membraneQuestion.getByRole("radio", {
    name: /细胞核/,
  });
  await wrongMembraneAnswer.focus();
  await wrongMembraneAnswer.press("Space");
  await nucleusQuestion.getByRole("radio", { name: /细胞核/ }).check();
  await mitochondrionQuestion
    .getByRole("radio", { name: /线粒体/ })
    .check();

  await expect(challenge).toContainText("已作答 3/3");
  await expect(checkButton).toBeEnabled();
  await checkButton.click();

  await expect(challenge).toHaveAttribute("data-score", "2/3");
  await expect(challenge).toContainText("第 1 次检查：2/3");
  await expect(membraneQuestion).toContainText("正确答案是“细胞膜”");

  await membraneQuestion.getByRole("radio", { name: /细胞膜/ }).check();
  await challenge.getByRole("button", { name: "检查答案" }).click();

  await expect(challenge).toHaveAttribute("data-score", "3/3");
  await expect(challenge).toContainText("挑战完成：3/3");

  await challenge.getByRole("button", { name: "重新挑战" }).click();
  await expect(challenge).toHaveAttribute("data-score", "pending");
  await expect(challenge).toContainText("已作答 0/3");
  await expect(challenge.getByRole("radio", { checked: true })).toHaveCount(0);
});

test("UI-002/PERF-001: 精细 GLB 只在主动启动后加载并可确定性复位", async ({ page }, testInfo) => {
  const scriptRequests = new Set<string>();
  const modelRequests = new Set<string>();
  page.on("request", (request) => {
    if (request.resourceType() === "script") scriptRequests.add(request.url());
    if (request.url().endsWith(".glb")) {
      modelRequests.add(request.url());
    }
  });

  await page.goto(route);
  await page.waitForLoadState("networkidle");
  const initialScripts = new Set(scriptRequests);
  const initialTransferBytes = await getTransferredBytes(page);
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(modelRequests.size).toBe(0);

  await page.getByRole("button", { name: "启动动物细胞 3D" }).click();
  await expect(page.locator('[data-view="3d"]')).toBeVisible({ timeout: 15_000 });
  await page.waitForLoadState("networkidle");

  const sceneStats = page.locator('[data-testid="scene-stats"]');
  const sceneStatsText = (await sceneStats.textContent()) ?? "";
  const sceneStatsMatch = sceneStatsText.match(
    /([\d,]+) draw calls · ([\d,]+) triangles/u,
  );
  expect(sceneStatsMatch).not.toBeNull();
  if (!sceneStatsMatch) throw new Error("Unable to parse Three.js scene stats.");

  const initialDrawCalls = Number(sceneStatsMatch[1].replaceAll(",", ""));
  const initialTriangles = Number(sceneStatsMatch[2].replaceAll(",", ""));
  const totalTransferBytes = await getTransferredBytes(page);
  const threeAdditionalTransferBytes = totalTransferBytes - initialTransferBytes;

  expect(threeAdditionalTransferBytes).toBeLessThanOrEqual(5_000_000);
  expect([...modelRequests]).toEqual([
    `http://127.0.0.1:3100${modelUrls.animal}`,
  ]);
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.getByText("3D 视图")).toBeVisible();
  await expect(page.getByText("白色光环表示当前选择")).toBeVisible();

  await page.getByRole("button", { name: /线粒体/ }).click();
  const mitochondrionStatsText = (await sceneStats.textContent()) ?? "";
  const mitochondrionStatsMatch = mitochondrionStatsText.match(
    /([\d,]+) draw calls · ([\d,]+) triangles/u,
  );
  expect(mitochondrionStatsMatch).not.toBeNull();
  if (!mitochondrionStatsMatch) {
    throw new Error("Unable to parse selected mitochondrion scene stats.");
  }

  const mitochondrionDrawCalls = Number(
    mitochondrionStatsMatch[1].replaceAll(",", ""),
  );
  const mitochondrionTriangles = Number(
    mitochondrionStatsMatch[2].replaceAll(",", ""),
  );
  const peakDrawCalls = Math.max(initialDrawCalls, mitochondrionDrawCalls);
  const peakTriangles = Math.max(initialTriangles, mitochondrionTriangles);

  expect(peakDrawCalls).toBeGreaterThanOrEqual(1);
  expect(peakDrawCalls).toBeLessThanOrEqual(12);
  expect(peakTriangles).toBeGreaterThanOrEqual(84_000);
  expect(peakTriangles).toBeLessThanOrEqual(100_000);

  await testInfo.attach("PERF-001-browser-baseline.json", {
    body: JSON.stringify(
      {
        initialTransferBytes,
        threeAdditionalTransferBytes,
        statsBySelection: {
          "cell-membrane": {
            drawCalls: initialDrawCalls,
            triangles: initialTriangles,
          },
          mitochondrion: {
            drawCalls: mitochondrionDrawCalls,
            triangles: mitochondrionTriangles,
          },
        },
        peakDrawCalls,
        peakTriangles,
        evidenceBoundary:
          "Automated desktop Chromium baseline; not a real-device performance claim.",
      },
      null,
      2,
    ),
    contentType: "application/json",
  });

  const lazyScripts = [...scriptRequests].filter((url) => !initialScripts.has(url));
  expect(lazyScripts.length).toBeGreaterThan(0);

  await page.getByRole("button", { name: /细胞核/ }).click();
  const canvas = page.getByTestId("cell-3d-canvas");
  await canvas.scrollIntoViewIfNeeded();
  const canvasBounds = await canvas.boundingBox();
  expect(canvasBounds).not.toBeNull();
  if (!canvasBounds) throw new Error("Unable to measure the 3D canvas.");
  await page.mouse.click(
    canvasBounds.x + canvasBounds.width * 0.5,
    canvasBounds.y + canvasBounds.height * 0.56,
  );
  await expect(page.locator('[data-selected-structure="nucleus"]')).toBeVisible();

  await page.mouse.click(
    canvasBounds.x + canvasBounds.width * 0.65,
    canvasBounds.y + canvasBounds.height * 0.3,
  );
  await expect(
    page.locator('[data-selected-structure="mitochondrion"]'),
  ).toBeVisible();

  await page.mouse.click(
    canvasBounds.x + canvasBounds.width * 0.05,
    canvasBounds.y + canvasBounds.height * 0.05,
  );
  await expect(page.locator('[data-selected-structure="none"]')).toBeVisible();

  await page.getByRole("button", { name: "复位视角" }).click();
  await expect(page.getByRole("button", { name: /细胞膜/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(sceneStats).toHaveText(sceneStatsText);
});

test("UI-005/PERF-002: 五个模型先显示独立 2D，再按需启动 3D", async ({
  page,
}) => {
  const requestedModels = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.endsWith(".glb")) requestedModels.add(url.pathname);
  });

  await page.goto(route);
  await page.waitForLoadState("networkidle");

  for (const selector of [
    "html",
    "body",
    ".documentation-layout",
    ".left-sidebar",
    ".right-sidebar",
    ".content-column",
  ]) {
    await expect(page.locator(selector)).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)",
    );
  }

  const models = [
    { id: "animal-cell", name: "动物细胞" },
    { id: "plant-cell", name: "植物细胞" },
    { id: "muscle-cell", name: "肌肉细胞" },
    { id: "neuron", name: "神经元" },
    { id: "bacteria-wall", name: "细菌细胞壁" },
  ] as const;
  const animalStructureControls = page.getByRole("group", {
    name: "选择动物细胞结构",
  });
  const sceneStats = page.getByTestId("scene-stats");

  for (const model of models) {
    const button = page.getByRole("button", {
      name: model.name,
      exact: true,
    });
    await button.click();
    await expect(
      page.locator(
        `[data-model-id="${model.id}"][data-view="2d"]`,
      ),
    ).toBeVisible();
    await expect(
      page.locator(`[data-diagram-model="${model.id}"]`),
    ).toBeVisible();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    expect([...requestedModels]).toEqual([]);
  }

  await page.getByRole("button", { name: "植物细胞", exact: true }).click();
  await expect(page.getByText("并非所有植物细胞都有叶绿体")).toBeVisible();
  await page.getByRole("button", { name: "启动植物细胞 3D" }).click();
  await expect(
    page.locator('[data-model-id="plant-cell"][data-view="3d"]'),
  ).toBeVisible({ timeout: 15_000 });
  await expect(sceneStats).toContainText(
    "12 draw calls · 14,100 triangles",
  );
  expect([...requestedModels]).toEqual([]);
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.getByRole("button", { name: "返回植物细胞 2D" }).click();
  await expect(page.locator('[data-diagram-model="plant-cell"]')).toBeVisible();

  await page.getByRole("button", { name: "肌肉细胞", exact: true }).click();
  await expect(page.getByText("不能代表心肌或平滑肌")).toBeVisible();
  await page.getByRole("button", { name: "启动肌肉细胞 3D" }).click();
  await expect(
    page.locator('[data-model-id="muscle-cell"][data-view="3d"]'),
  ).toBeVisible({ timeout: 15_000 });
  await expect(sceneStats).toContainText(
    "12 draw calls · 3,864 triangles",
  );
  expect([...requestedModels]).toEqual([]);
  await page.getByRole("button", { name: "返回肌肉细胞 2D" }).click();

  const glbModels = [
    {
      id: "animal-cell",
      name: "动物细胞",
      url: modelUrls.animal,
      triangles: "86,346 triangles",
    },
    {
      id: "neuron",
      name: "神经元",
      url: modelUrls.neuron,
      triangles: "160,256 triangles",
    },
    {
      id: "bacteria-wall",
      name: "细菌细胞壁",
      url: modelUrls.bacteriaWall,
      triangles: "25,542 triangles",
    },
  ] as const;

  for (const model of glbModels) {
    await page
      .getByRole("button", { name: model.name, exact: true })
      .click();
    await expect(
      page.locator(`[data-diagram-model="${model.id}"]`),
    ).toBeVisible();
    await page
      .getByRole("button", { name: `启动${model.name} 3D` })
      .click();
    await expect(
      page.locator(
        `[data-model-id="${model.id}"][data-view="3d"]`,
      ),
    ).toBeVisible({ timeout: 15_000 });
    await expect.poll(() => [...requestedModels]).toContain(model.url);
    await expect(sceneStats).toContainText(model.triangles);
    await page
      .getByRole("button", { name: `返回${model.name} 2D` })
      .click();
  }

  expect([...requestedModels]).toEqual([
    modelUrls.animal,
    modelUrls.neuron,
    modelUrls.bacteriaWall,
  ]);
  await page.getByRole("button", { name: "动物细胞", exact: true }).click();
  await expect(animalStructureControls).toBeVisible();
});

test("FAIL-011: 快速切换会中止旧模型且不回写过期场景", async ({ page }) => {
  let neuronRequestSeen = false;
  let releaseNeuronRequest = () => {};
  const neuronRequestRelease = new Promise<void>((resolve) => {
    releaseNeuronRequest = resolve;
  });

  await page.route(`**${modelUrls.neuron}`, async (interceptedRoute) => {
    neuronRequestSeen = true;
    await neuronRequestRelease;
    try {
      await interceptedRoute.continue();
    } catch {
      // The expected AbortController cancellation may close this intercepted request.
    }
  });

  try {
    await page.goto(route);
    await page.getByRole("button", { name: "神经元", exact: true }).click();
    await page.getByRole("button", { name: "启动神经元 3D" }).click();
    await expect.poll(() => neuronRequestSeen).toBe(true);

    await page
      .getByRole("button", { name: "细菌细胞壁", exact: true })
      .click();
    await page
      .getByRole("button", { name: "启动细菌细胞壁 3D" })
      .click();
    await expect(
      page.locator('[data-model-id="bacteria-wall"][data-view="3d"]'),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("canvas")).toHaveCount(1);
    await expect(page.getByTestId("scene-stats")).toContainText(
      "25,542 triangles",
    );

    releaseNeuronRequest();
    await page.unrouteAll({ behavior: "wait" });
    await page.waitForTimeout(200);

    await expect(
      page.locator('[data-model-id="bacteria-wall"][data-view="3d"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-model-id="neuron"][data-view="3d"]'),
    ).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { level: 2, name: "细菌细胞壁截面" }),
    ).toBeVisible();
  } finally {
    releaseNeuronRequest();
    await page.unrouteAll({ behavior: "ignoreErrors" });
  }
});

test("FAIL-002: WebGL2 创建失败时明确回到 2D", async ({ page }) => {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(
      this: HTMLCanvasElement,
      contextId: string,
      options?: unknown,
    ) {
      if (contextId === "webgl2") return null;
      return originalGetContext.call(this, contextId, options);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });

  await page.goto(route);
  await page.getByRole("button", { name: "启动动物细胞 3D" }).click();

  await expect(page.locator('[data-error-reason="webgl2-unavailable"]')).toBeVisible();
  await expect(page.locator('[data-fact-id="CELL-MEMBRANE-001"]')).toBeVisible();
  await expect(
    page.getByRole("button", { name: "重试动物细胞 3D" }),
  ).toBeVisible();
});

test("FAIL-003: 3D 组件加载超时后可重试并保留 2D", async ({ page }) => {
  let holdLazyScript = false;
  let releaseLazyScript = () => {};
  let markLazyScriptStarted = () => {};
  const lazyScriptStarted = new Promise<void>((resolve) => {
    markLazyScriptStarted = resolve;
  });
  const lazyScriptRelease = new Promise<void>((resolve) => {
    releaseLazyScript = resolve;
  });

  await page.route("**/*", async (route) => {
    if (holdLazyScript && route.request().resourceType() === "script") {
      markLazyScriptStarted();
      await lazyScriptRelease;
    }
    await route.continue();
  });
  await page.clock.install();
  await page.goto(route);
  await page.waitForLoadState("networkidle");

  holdLazyScript = true;
  await page.getByRole("button", { name: "启动动物细胞 3D" }).click();
  await lazyScriptStarted;
  await page.clock.fastForward(12_001);

  await expect(page.locator('[data-error-reason="scene-load-timeout"]')).toBeVisible();
  await expect(page.locator('[data-fact-id="CELL-MITO-001"]')).toBeVisible();
  await expect(
    page.getByRole("button", { name: "重试动物细胞 3D" }),
  ).toBeVisible();

  releaseLazyScript();
  await page.unrouteAll({ behavior: "wait" });
});

test("FAIL-003B: 精细模型加载失败后可重试并保留 2D", async ({ page }) => {
  await page.route("**/animal-cell-nih.glb", async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "text/plain",
      body: "model unavailable",
    });
  });

  await page.goto(route);
  await page.getByRole("button", { name: "启动动物细胞 3D" }).click();

  await expect(
    page.locator('[data-error-reason="model-load-failed"]'),
  ).toBeVisible();
  await expect(page.locator('[data-fact-id="CELL-NUCLEUS-001"]')).toBeVisible();
  await expect(
    page.getByRole("button", { name: "重试动物细胞 3D" }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("FAIL-005: WebGL 上下文丢失后保留 2D", async ({ page }) => {
  await page.goto(route);
  await page.getByRole("button", { name: "启动动物细胞 3D" }).click();
  await expect(page.locator('[data-view="3d"]')).toBeVisible({ timeout: 15_000 });

  await page.locator('[data-testid="cell-3d-canvas"]').dispatchEvent(
    "webglcontextlost",
    { cancelable: true },
  );

  await expect(page.locator('[data-error-reason="context-lost"]')).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator('[data-fact-id="CELL-NUCLEUS-001"]')).toBeVisible();
});

test("FAIL-010: 核心页面和详细 3D 运行期间不请求境外域名", async ({ page }) => {
  const unexpectedDomains = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1") unexpectedDomains.add(url.hostname);
  });

  await page.goto(route);
  await page.getByRole("button", { name: /细胞核/ }).click();
  await expect(page.locator('[data-selected-structure="nucleus"]')).toBeVisible();
  await page.getByRole("button", { name: "启动动物细胞 3D" }).click();
  await expect(page.getByText("3D 视图")).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("button", { name: "神经元", exact: true }).click();
  await page.getByRole("button", { name: "启动神经元 3D" }).click();
  await expect(
    page.locator('[data-model-id="neuron"][data-view="3d"]'),
  ).toBeVisible({ timeout: 15_000 });

  await page
    .getByRole("button", { name: "细菌细胞壁", exact: true })
    .click();
  await page
    .getByRole("button", { name: "启动细菌细胞壁 3D" })
    .click();
  await expect(
    page.locator('[data-model-id="bacteria-wall"][data-view="3d"]'),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "植物细胞", exact: true }).click();
  await page.getByRole("button", { name: "启动植物细胞 3D" }).click();
  await expect(
    page.locator('[data-model-id="plant-cell"][data-view="3d"]'),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "肌肉细胞", exact: true }).click();
  await page.getByRole("button", { name: "启动肌肉细胞 3D" }).click();
  await expect(
    page.locator('[data-model-id="muscle-cell"][data-view="3d"]'),
  ).toBeVisible({ timeout: 15_000 });

  expect([...unexpectedDomains]).toEqual([]);
});
