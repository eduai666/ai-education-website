import { expect, test } from "@playwright/test";

const coursePath = "/courses/agents/agent-action-loop";
const learningStorageKey = "ai-education.learning-center";

test("HEADER-001: 顶栏只标记当前板块，课程左栏只显示课程目录", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  const routes = [
    ["/about/learning-map", "学习路线"],
    [coursePath, "AI 基础"],
    ["/projects/learn/cell-architecture", "实践项目"],
    ["/guides/parents", "家长与教师"],
    ["/", "关于项目"],
  ] as const;

  for (const [path, activeLabel] of routes) {
    await page.goto(path);

    const primaryNavigation = page.getByRole("navigation", { name: "网站主要板块" });
    await expect(primaryNavigation).toBeVisible();
    await expect(primaryNavigation.locator('a[aria-current="location"]')).toHaveCount(1);
    await expect(
      primaryNavigation.getByRole("link", { name: activeLabel, exact: true }),
    ).toHaveAttribute("aria-current", "location");
  }

  await page.goto(coursePath);

  const leftSidebar = page.locator(".left-sidebar");
  const courseNavigation = leftSidebar.getByRole("navigation", { name: "AI 基础目录" });
  await expect(leftSidebar.getByRole("navigation")).toHaveCount(1);
  await expect(courseNavigation).toBeVisible();
  await expect(courseNavigation.getByRole("heading", { name: "AI 基础课程" })).toBeVisible();
  await expect(courseNavigation.locator('a[aria-current="page"]')).toHaveCount(1);
  await expect(
    courseNavigation.getByRole("link", { name: "智能体怎样一步步行动", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(courseNavigation.getByRole("heading", { name: "学习路线" })).toHaveCount(0);
  await expect(courseNavigation.getByRole("heading", { name: "实践项目" })).toHaveCount(0);
  await expect(courseNavigation.getByRole("heading", { name: "关于项目" })).toHaveCount(0);
});

test("HEADER-002: Ctrl+K 可搜索，Escape 关闭后恢复焦点", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(coursePath);

  const searchTrigger = page.getByRole("button", { name: /搜索/u });
  await searchTrigger.focus();
  await page.keyboard.press("Control+k");

  const dialog = page.getByRole("dialog", { name: "查找课程、指南和项目" });
  const searchInput = dialog.getByRole("searchbox", { name: "搜索关键词" });
  await expect(dialog).toBeVisible();
  await expect(searchInput).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(searchTrigger).toBeFocused();

  await page.keyboard.press("Control+k");
  await searchInput.fill("一轮行动包含四个环节");
  await dialog.getByRole("link", { name: /一轮行动包含四个环节/u }).click();
  await expect.poll(() => page.evaluate(() => decodeURI(window.location.hash))).toBe(
    "#一轮行动包含四个环节",
  );
  const targetSection = page.locator('[id="一轮行动包含四个环节"]');
  await expect(targetSection).toBeFocused();

  await page.keyboard.press("Control+k");
  await expect(searchInput).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(targetSection).toBeFocused();

  await page.keyboard.press("Control+k");
  await searchInput.fill("细胞结构探索器");

  const cellResult = dialog.getByRole("link", { name: /细胞结构探索器/u });
  await expect(cellResult).toBeVisible();
  await expect(cellResult).toHaveAttribute("href", "/projects/learn/cell-architecture");
  await cellResult.click();
  await expect(page).toHaveURL(/\/projects\/learn\/cell-architecture$/u);
});

test("HEADER-003: GitHub 外链安全打开，English 明确标记为建设中", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(coursePath);

  const githubLink = page.getByRole("link", { name: "GitHub 源码（在新窗口打开）" });
  await expect(githubLink).toBeVisible();
  await expect(githubLink).toHaveAttribute(
    "href",
    "https://github.com/eduai666/ai-education-website",
  );
  await expect(githubLink).toHaveAttribute("target", "_blank");
  await expect(githubLink).toHaveAttribute("rel", /noreferrer/u);

  const languageMenu = page.locator("details.language-menu");
  await languageMenu.locator('summary[aria-label="选择语言，当前为简体中文"]').click();
  await expect(languageMenu).toHaveAttribute("open", "");

  const englishOption = languageMenu.locator('[aria-disabled="true"]');
  await expect(englishOption).toContainText("English");
  await expect(englishOption).toContainText("建设中");
  await expect(languageMenu.getByRole("link", { name: /English/u })).toHaveCount(0);
  await expect(languageMenu.getByRole("button", { name: /English/u })).toHaveCount(0);

  await page.keyboard.press("Escape");
  await expect(languageMenu).not.toHaveAttribute("open", "");
  await expect(languageMenu.locator("summary")).toBeFocused();
});

test("LEARNING-001: 最近学习仅保存在本机，清除时不影响其他存储键", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const unrelatedStorageKey = "header-utilities.unrelated";
  await page.evaluate(
    ({ learningKey, unrelatedKey }) => {
      window.localStorage.removeItem(learningKey);
      window.localStorage.setItem(unrelatedKey, "keep-me");
    },
    { learningKey: learningStorageKey, unrelatedKey: unrelatedStorageKey },
  );

  await page.goto(coursePath);
  await expect
    .poll(() =>
      page.evaluate((storageKey) => {
        const rawValue = window.localStorage.getItem(storageKey);
        if (!rawValue) return null;

        const state = JSON.parse(rawValue) as { recent?: { path?: string }[] };
        return state.recent?.[0]?.path ?? null;
      }, learningStorageKey),
    )
    .toBe(coursePath);

  await page.getByRole("link", { name: "个人中心", exact: true }).click();
  await expect(page).toHaveURL(/\/learning-center$/u);
  await expect(page.getByRole("heading", { name: "你的本机学习记录" })).toBeVisible();
  await expect(page.getByText("智能体怎样一步步行动", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "清除本机记录" }).click();
  await expect(page.getByText("还没有本机学习记录", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "最近学习" })).toBeFocused();
  await expect(page.getByRole("status")).toHaveText("本机学习记录已清除");

  const storedValues = await page.evaluate(
    ({ learningKey, unrelatedKey }) => ({
      learning: window.localStorage.getItem(learningKey),
      unrelated: window.localStorage.getItem(unrelatedKey),
    }),
    { learningKey: learningStorageKey, unrelatedKey: unrelatedStorageKey },
  );
  expect(storedValues).toEqual({ learning: null, unrelated: "keep-me" });
});

test("HEADER-RESP-001: 顶栏在手机、平板和桌面宽度不产生横向溢出", async ({ page }) => {
  for (const width of [390, 900, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(coursePath);
    await expect(page.getByRole("banner")).toBeVisible();

    const viewport = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(
      viewport.scrollWidth,
      `${width}px should not overflow horizontally`,
    ).toBeLessThanOrEqual(viewport.clientWidth + 1);
  }
});
