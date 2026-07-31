import { expect, test, type Page } from "@playwright/test";

const route = "/projects/learn/cell-architecture";

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

test("UI-002/PERF-001: Three.js 只在主动启动后加载并可确定性复位", async ({ page }, testInfo) => {
  const scriptRequests = new Set<string>();
  page.on("request", (request) => {
    if (request.resourceType() === "script") scriptRequests.add(request.url());
  });

  await page.goto(route);
  await page.waitForLoadState("networkidle");
  const initialScripts = new Set(scriptRequests);
  const initialTransferBytes = await getTransferredBytes(page);
  await expect(page.locator("canvas")).toHaveCount(0);

  await page.getByRole("button", { name: "启动 3D" }).click();
  await expect(page.locator('[data-view="3d"]')).toBeVisible({ timeout: 15_000 });
  await page.waitForLoadState("networkidle");

  const sceneStats = page.locator('[data-testid="scene-stats"]');
  const sceneStatsText = (await sceneStats.textContent()) ?? "";
  const sceneStatsMatch = sceneStatsText.match(
    /([\d,]+) draw calls · ([\d,]+) triangles/u,
  );
  expect(sceneStatsMatch).not.toBeNull();
  if (!sceneStatsMatch) throw new Error("Unable to parse Three.js scene stats.");

  const drawCalls = Number(sceneStatsMatch[1].replaceAll(",", ""));
  const triangles = Number(sceneStatsMatch[2].replaceAll(",", ""));
  const totalTransferBytes = await getTransferredBytes(page);
  const threeAdditionalTransferBytes = totalTransferBytes - initialTransferBytes;

  expect(drawCalls).toBeLessThanOrEqual(30);
  expect(triangles).toBeLessThanOrEqual(50_000);
  expect(threeAdditionalTransferBytes).toBeLessThanOrEqual(5_000_000);
  await expect(page.locator("canvas")).toHaveCount(1);

  await testInfo.attach("PERF-001-browser-baseline.json", {
    body: JSON.stringify(
      {
        initialTransferBytes,
        threeAdditionalTransferBytes,
        drawCalls,
        triangles,
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

  await page.getByRole("button", { name: /线粒体/ }).click();
  await page.getByRole("button", { name: "复位视角" }).click();
  await expect(page.getByRole("button", { name: /细胞膜/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
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
  await page.getByRole("button", { name: "启动 3D" }).click();

  await expect(page.locator('[data-error-reason="webgl2-unavailable"]')).toBeVisible();
  await expect(page.locator('[data-fact-id="CELL-MEMBRANE-001"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "重新尝试 3D" })).toBeVisible();
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
  await page.getByRole("button", { name: "启动 3D" }).click();
  await lazyScriptStarted;
  await page.clock.fastForward(12_001);

  await expect(page.locator('[data-error-reason="scene-load-timeout"]')).toBeVisible();
  await expect(page.locator('[data-fact-id="CELL-MITO-001"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "重新尝试 3D" })).toBeVisible();

  releaseLazyScript();
  await page.unrouteAll({ behavior: "wait" });
});

test("FAIL-005: WebGL 上下文丢失后保留 2D", async ({ page }) => {
  await page.goto(route);
  await page.getByRole("button", { name: "启动 3D" }).click();
  await expect(page.locator('[data-view="3d"]')).toBeVisible({ timeout: 15_000 });

  await page.locator('[data-testid="cell-3d-canvas"]').dispatchEvent(
    "webglcontextlost",
    { cancelable: true },
  );

  await expect(page.locator('[data-error-reason="context-lost"]')).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator('[data-fact-id="CELL-NUCLEUS-001"]')).toBeVisible();
});

test("FAIL-010: 核心页面运行期间不请求境外域名", async ({ page }) => {
  const unexpectedDomains = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1") unexpectedDomains.add(url.hostname);
  });

  await page.goto(route);
  await page.getByRole("button", { name: /细胞核/ }).click();
  await expect(page.locator('[data-selected-structure="nucleus"]')).toBeVisible();

  expect([...unexpectedDomains]).toEqual([]);
});
