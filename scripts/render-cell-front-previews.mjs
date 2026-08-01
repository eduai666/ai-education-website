#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const repositoryRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(
  repositoryRoot,
  "public/cell-architecture/front-previews",
);
const defaultBaseUrl = "http://127.0.0.1:3101";
const route = "/projects/learn/cell-architecture";

const specimens = [
  { id: "animal-cell", name: "动物细胞", source: "glb" },
  { id: "plant-cell", name: "植物细胞", source: "procedural" },
  { id: "muscle-cell", name: "肌肉细胞", source: "procedural" },
  { id: "neuron", name: "神经元", source: "glb" },
  { id: "bacteria-wall", name: "细菌细胞壁", source: "glb" },
];

function getBaseUrl() {
  const baseUrl = new URL(process.env.CELL_PREVIEW_BASE_URL ?? defaultBaseUrl);
  const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);

  if (!loopbackHosts.has(baseUrl.hostname)) {
    throw new Error("CELL_PREVIEW_BASE_URL must point to a loopback server.");
  }

  return baseUrl;
}

async function renderPreview(page, baseUrl, specimen) {
  await page.goto(new URL(route, baseUrl).href, {
    waitUntil: "networkidle",
  });

  const localReferenceMode = await page
    .locator("[data-local-reference-models]")
    .getAttribute("data-local-reference-models");
  if (localReferenceMode !== "disabled") {
    throw new Error(
      "Preview rendering must use a production-mode page with local reference GLBs disabled.",
    );
  }

  await page.getByRole("button", { name: specimen.name, exact: true }).click();
  await page
    .getByRole("button", { name: `启动${specimen.name} 3D` })
    .click();
  await page
    .locator(`[data-model-id="${specimen.id}"][data-view="3d"]`)
    .waitFor({ state: "visible" });

  const stats = page.getByTestId("scene-stats");
  if ((await stats.getAttribute("data-model-source")) !== specimen.source) {
    throw new Error(`${specimen.id} did not use its published ${specimen.source} source.`);
  }

  if (specimen.id === "animal-cell") {
    const canvas = page.getByTestId("cell-3d-canvas");
    await canvas.click({ position: { x: 8, y: 8 } });
    await page
      .locator('[data-selected-structure="none"]')
      .waitFor({ state: "visible" });
  }

  await page.addStyleTag({
    content: `
      [class*="sceneBadge"],
      [class*="visualStage"]::after {
        display: none !important;
      }

      [class*="visualStage"] {
        background: #e9f0ef !important;
      }

      [data-testid="cell-3d-canvas"] {
        filter: brightness(0.72) contrast(1.34) saturate(1.75);
      }
    `,
  });
  await page.waitForTimeout(120);

  const canvas = page.getByTestId("cell-3d-canvas");
  await canvas.screenshot({
    path: resolve(outputDirectory, `${specimen.id}-front-v1.png`),
  });
}

async function main() {
  const baseUrl = getBaseUrl();
  await mkdir(outputDirectory, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    for (const specimen of specimens) {
      const page = await browser.newPage({
        deviceScaleFactor: 1,
        viewport: { width: 1440, height: 1000 },
      });
      try {
        await renderPreview(page, baseUrl, specimen);
        process.stdout.write(`Rendered ${specimen.id}.\n`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
