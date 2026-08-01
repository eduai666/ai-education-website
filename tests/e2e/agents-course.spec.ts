import { expect, test } from "@playwright/test";

const lessons = [
  ["introduction", "什么是智能体：单元导读", 0, 1],
  ["from-answers-to-tasks", "从回答问题到完成任务", 0, 1],
  ["agent-components", "智能体由什么组成", 1, 1],
  ["agent-action-loop", "智能体怎样一步步行动", 1, 1],
  ["agent-task-walkthrough", "跟着智能体完成一次任务", 0, 1],
  ["agents-vs-fixed-workflows", "智能体和固定工作流有什么不同", 0, 1],
  ["when-agents-should-stop", "什么时候应该让智能体停下来", 0, 1],
] as const;

const aiBasicsLessons = [
  "ai-around-us",
  "how-ai-systems-learn",
  "how-language-models-generate",
  "context-and-memory",
  "model-tool-use",
  "agent-multi-step-tasks",
  "responsible-ai-use",
  "choosing-ai-coding-tools",
  "cli-vs-desktop-clients",
  "claude-code-desktop-api",
  "codex-desktop-api",
] as const;

test("AGENT-001: 七节课程、目录、图片和内部链接完整", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  for (const [slug, title, expectedFigureCount, expectedAnswerCount] of lessons) {
    const response = await page.goto(`/courses/agents/${slug}`);

    expect(response?.ok(), `${slug} should return a successful response`).toBe(true);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.locator(".left-sidebar a[aria-current='page']")).toHaveCount(1);
    await expect(page.getByText("建议年龄 10—14 岁", { exact: true })).toBeVisible();
    await expect(page.locator(".lesson-article > .reading-time-note")).toHaveCount(1);
    await expect(page.locator(".lesson-header .reading-time-note")).toHaveCount(0);
    await expect(page.locator(".markdown-document a[href$='.md']")).toHaveCount(0);

    const sectionIds = await page.locator(".right-sidebar a[href^='#']").evaluateAll(
      (links) => links.map((link) => link.getAttribute("href")?.slice(1) ?? ""),
    );

    expect(sectionIds.length, `${slug} should expose its on-page navigation`).toBeGreaterThan(0);
    for (const id of sectionIds) {
      expect(
        await page.evaluate((sectionId) => Boolean(document.getElementById(sectionId)), id),
        `${slug} is missing #${id}`,
      ).toBe(true);
    }

    const courseImages = page.locator(".course-figure img");
    await expect(courseImages).toHaveCount(expectedFigureCount);
    await expect(page.locator(".answer-reveal")).toHaveCount(expectedAnswerCount);

    for (const image of await courseImages.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(
          () =>
            image.evaluate(
              (element) =>
                (element as HTMLImageElement).complete &&
                (element as HTMLImageElement).naturalWidth > 0,
            ),
          { message: `${slug} should load each course figure` },
        )
        .toBe(true);
    }
  }

  expect(consoleErrors).toEqual([]);
});

test("AGENT-002: 课程页在手机、平板和桌面宽度没有布局回归", async ({ page }) => {
  for (const width of [390, 900, 1023, 1024, 1280, 1439, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/courses/agents/agent-action-loop");

    const articleBox = await page.locator(".lesson-article").boundingBox();
    const readingTimeBox = await page.locator(".lesson-article > .reading-time-note").boundingBox();

    if (!articleBox || !readingTimeBox) throw new Error(`${width}px is missing the reading estimate`);

    const readingTimeRightEdge = readingTimeBox.x + readingTimeBox.width;
    const articleRightEdge = articleBox.x + articleBox.width;
    expect(Math.abs(articleRightEdge - readingTimeRightEdge)).toBeLessThanOrEqual(2);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(hasHorizontalOverflow, `${width}px should not overflow horizontally`).toBe(false);

    if (width < 1024) {
      await expect(page.locator(".left-sidebar")).toBeHidden();
    } else {
      await expect(page.locator(".left-sidebar")).toBeVisible();
    }

    if (width < 1440) {
      await expect(page.locator(".right-sidebar")).toBeHidden();
    } else {
      await expect(page.locator(".right-sidebar")).toBeVisible();
    }
  }
});

test("AGENT-003: 手机菜单可访问本页目录，选择后关闭", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/courses/agents/agent-action-loop");

  const menu = page.locator("details.mobile-navigation");
  await page.locator("details.mobile-navigation > summary").click();
  await expect(menu).toHaveAttribute("open", "");
  await expect(menu.getByRole("navigation", { name: "网站主要板块" })).toBeVisible();
  await expect(menu.getByRole("navigation", { name: "AI 基础目录" })).toBeVisible();

  const onThisPage = menu.getByRole("navigation", { name: "本页导航" });
  await expect(onThisPage).toBeVisible();

  const firstOnPageLink = onThisPage.getByRole("link").first();
  const expectedHash = await firstOnPageLink.getAttribute("href");
  const expectedId = expectedHash?.slice(1) ?? "";
  await firstOnPageLink.click();

  await expect(menu).not.toHaveAttribute("open", "");
  expect(await page.evaluate(() => decodeURI(window.location.hash))).toBe(expectedHash);
  await expect(page.locator(`[id="${expectedId}"]`)).toBeFocused();
});

test("AGENT-004: 复杂课程图可打开原始大图，末课可返回课程地图", async ({ page }) => {
  await page.goto("/courses/agents/agent-components");

  const openFigure = page.getByRole("link", { name: /查看大图/ });
  await expect(openFigure).toHaveAttribute("target", "_blank");
  await expect(openFigure).toHaveAttribute("href", /01-agent-system.*\.png$/u);

  await page.goto("/courses/agents/when-agents-should-stop");
  await expect(page.getByRole("link", { name: /回到课程首页继续探索/ })).toHaveAttribute(
    "href",
    "/about/learning-map",
  );
});

test("AGENT-005: 参考答案默认折叠并可用键盘展开", async ({ page }) => {
  await page.goto("/courses/agents/agent-task-walkthrough");

  const answerReveal = page.locator(".answer-reveal");
  const summary = answerReveal.locator("summary");
  const answer = answerReveal.locator(".answer-reveal-content");

  await expect(answerReveal).not.toHaveAttribute("open", "");
  await expect(answer).toBeHidden();

  await summary.focus();
  await page.keyboard.press("Enter");

  await expect(answerReveal).toHaveAttribute("open", "");
  await expect(answer).toBeVisible();
  await expect(summary).toBeFocused();
});

test("AI-BASICS-001: 认识人工智能课程页不显示重复的单元课次标签", async ({ page }) => {
  for (const slug of aiBasicsLessons) {
    await page.goto(`/courses/ai-basics/${slug}`);
    await expect(page.locator(".lesson-label")).toHaveCount(0);
  }
});

test("AGENT-LABEL-001: 智能体课程页不显示重复的单元标签", async ({ page }) => {
  for (const [slug] of lessons) {
    await page.goto(`/courses/agents/${slug}`);
    await expect(page.locator(".lesson-label")).toHaveCount(0);
  }
});
