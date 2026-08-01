import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const expectedModelAssets = [
  {
    id: "animal-cell",
    fileName: "animal-cell-nih.glb",
    byteLength: 1_526_232,
    sha256: "416b95d454e4243a49a530e7e9e4447d33c543e838d072ae5128c38bdad7d7c6",
    vertices: 42_168,
    triangles: 84_906,
  },
  {
    id: "neuron",
    fileName: "neuron-nih.glb",
    byteLength: 2_885_524,
    sha256: "d979bca2c94eb7b78de51bf68642ba00bf0b21d38d31161348f033c2a893a4a4",
    vertices: 80_130,
    triangles: 160_256,
  },
  {
    id: "bacteria-wall",
    fileName: "bacteria-wall-nih.glb",
    byteLength: 482_424,
    sha256: "8c25bccaf828353ced1849483f9701266b43ae6f51899f6f6a3c45bfc7bede57",
    vertices: 14_572,
    triangles: 25_542,
  },
];

const expectedFrontPreviewAssets = [
  {
    id: "animal-cell",
    fileName: "animal-cell-front-v1.png",
    byteLength: 250_134,
    sha256: "e8ca7bd6b5c9ae2cf900043f2d59a0599cc5817c4f0401de8ddb65f28662672e",
    source: "glb",
  },
  {
    id: "plant-cell",
    fileName: "plant-cell-front-v1.png",
    byteLength: 92_971,
    sha256: "e5ef97ff041f86f97154fb331bec4bafe1aea84e5cf5bb3ad64c21a778098141",
    source: "procedural",
  },
  {
    id: "muscle-cell",
    fileName: "muscle-cell-front-v1.png",
    byteLength: 96_634,
    sha256: "56a11a357ec16a2551f7b74eeb1895c1877fe1aff543e6b797a9199c0e56c9e7",
    source: "procedural",
  },
  {
    id: "neuron",
    fileName: "neuron-front-v1.png",
    byteLength: 31_083,
    sha256: "b15c14ad3f31d29c0e0784f71c7dbfab248ded43bf55ea066d3a99b0740953ef",
    source: "glb",
  },
  {
    id: "bacteria-wall",
    fileName: "bacteria-wall-front-v1.png",
    byteLength: 197_903,
    sha256: "3f6a6ee6e58cf9d42b9a6256af7acf0c45abd49da6310d9e820d183d525a3440",
    source: "glb",
  },
];

const expectedModelIds = [
  "animal-cell",
  "plant-cell",
  "muscle-cell",
  "neuron",
  "bacteria-wall",
];

const localReferencePreviewAsset = "plant-cell-reference-front-v1.png";

const paths = {
  demo: resolve(
    repositoryRoot,
    "docs/markdown/生物学习/00-可复现基线/cell-demo-v1.json",
  ),
  demoSchema: resolve(
    repositoryRoot,
    "docs/markdown/生物学习/00-可复现基线/cell-demo-v1.schema.json",
  ),
  fixture: resolve(
    repositoryRoot,
    "docs/markdown/生物学习/00-可复现基线/fixtures/ai/plan-fixture-v1.json",
  ),
  fixtureSchema: resolve(
    repositoryRoot,
    "docs/markdown/生物学习/00-可复现基线/fixtures/ai/fixture-schema-v1.schema.json",
  ),
  runtime: resolve(
    repositoryRoot,
    "src/features/cell-architecture/cell-three-runtime.ts",
  ),
  explorer: resolve(
    repositoryRoot,
    "src/features/cell-architecture/cell-architecture-explorer.tsx",
  ),
  diagram: resolve(
    repositoryRoot,
    "src/features/cell-architecture/cell-diagram.tsx",
  ),
  model: resolve(
    repositoryRoot,
    "src/features/cell-architecture/cell-three-model.ts",
  ),
  modelCatalog: resolve(
    repositoryRoot,
    "src/features/cell-architecture/cell-model-catalog.ts",
  ),
  localReferenceRoute: resolve(
    repositoryRoot,
    "src/app/api/local-reference-cell-models/[asset]/route.ts",
  ),
  localReferencePreviewRoute: resolve(
    repositoryRoot,
    "src/app/api/local-reference-cell-previews/[asset]/route.ts",
  ),
  frontPreviewRenderer: resolve(
    repositoryRoot,
    "scripts/render-cell-front-previews.mjs",
  ),
  frontPreviewAssets: expectedFrontPreviewAssets.map((asset) =>
    resolve(
      repositoryRoot,
      `public/cell-architecture/front-previews/${asset.fileName}`,
    ),
  ),
  modelAssets: expectedModelAssets.map((asset) =>
    resolve(
      repositoryRoot,
      `public/models/cell-architecture-studio/${asset.fileName}`,
    ),
  ),
};

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function createValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  ajv.addFormat("date", /^\d{4}-\d{2}-\d{2}$/u);
  ajv.addFormat("uri", /^https:\/\/.+/u);
  return ajv;
}

function readGlbJson(bytes) {
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "glTF");
  assert.equal(bytes.readUInt32LE(4), 2, "Only glTF 2.0 assets are accepted.");
  assert.equal(bytes.readUInt32LE(8), bytes.byteLength);

  let offset = 12;
  while (offset < bytes.byteLength) {
    const chunkLength = bytes.readUInt32LE(offset);
    const chunkType = bytes.readUInt32LE(offset + 4);
    const chunk = bytes.subarray(offset + 8, offset + 8 + chunkLength);

    if (chunkType === 0x4e4f534a) {
      return JSON.parse(chunk.toString("utf8").replace(/\0+$/u, ""));
    }
    offset += 8 + chunkLength;
  }

  assert.fail("GLB has no JSON chunk.");
}

function countTriangles(json) {
  return json.meshes.reduce(
    (total, mesh) =>
      total +
      mesh.primitives.reduce((meshTotal, primitive) => {
        const accessorIndex = primitive.indices ?? primitive.attributes.POSITION;
        const elementCount = json.accessors[accessorIndex].count;
        const mode = primitive.mode ?? 4;

        if (mode === 4) return meshTotal + Math.floor(elementCount / 3);
        if (mode === 5 || mode === 6) {
          return meshTotal + Math.max(0, elementCount - 2);
        }
        return meshTotal;
      }, 0),
    0,
  );
}

function countPositionVertices(json) {
  return json.meshes.reduce(
    (total, mesh) =>
      total +
      mesh.primitives.reduce(
        (meshTotal, primitive) =>
          meshTotal + json.accessors[primitive.attributes.POSITION].count,
        0,
      ),
    0,
  );
}

test("FACT-001: content and fixture satisfy their versioned schemas", async () => {
  const [demo, demoSchema, fixture, fixtureSchema] = await Promise.all([
    readJson(paths.demo),
    readJson(paths.demoSchema),
    readJson(paths.fixture),
    readJson(paths.fixtureSchema),
  ]);
  const ajv = createValidator();
  const validateDemo = ajv.compile(demoSchema);
  const validateFixture = ajv.compile(fixtureSchema);

  assert.equal(validateDemo(demo), true, JSON.stringify(validateDemo.errors));
  assert.equal(
    validateFixture(fixture),
    true,
    JSON.stringify(validateFixture.errors),
  );
});

test("FACT-001: exactly three stable structure IDs resolve to approved source records", async () => {
  const demo = await readJson(paths.demo);
  const expectedIds = ["cell-membrane", "nucleus", "mitochondrion"];
  const actualIds = demo.structures.map((structure) => structure.id);
  const factIds = demo.structures.map((structure) => structure.factId);
  const sourceIds = new Set(demo.sources.map((source) => source.id));

  assert.deepEqual(actualIds, expectedIds);
  assert.equal(new Set(actualIds).size, 3);
  assert.equal(new Set(factIds).size, 3);
  assert.equal(demo.initialStructureId, "cell-membrane");

  for (const structure of demo.structures) {
    assert.equal(structure.reviewStatus, "verified-against-source");
    assert.ok(structure.summary.length > 10);
    assert.ok(structure.observationQuestion.endsWith("？"));
    assert.ok(structure.sourceIds.length > 0);
    for (const sourceId of structure.sourceIds) {
      assert.ok(sourceIds.has(sourceId), `Unknown source ${sourceId}`);
    }
  }

  for (const source of demo.sources) {
    assert.notEqual(source.organization.toLowerCase(), "ai");
    assert.match(source.url, /^https:\/\//u);
    assert.match(source.accessedAt, /^\d{4}-\d{2}-\d{2}$/u);
  }
});

test("BIO-G3-PLAN-001: AI suggestions have unique IDs and recorded human decisions", async () => {
  const [demo, fixture] = await Promise.all([
    readJson(paths.demo),
    readJson(paths.fixture),
  ]);
  const suggestions = fixture.parsed.suggestions;

  assert.equal(fixture.demoVersion, demo.demoVersion);
  assert.equal(fixture.requirementsVersion, demo.requirementsVersion);
  assert.equal(fixture.factsVersion, demo.factsVersion);
  assert.equal(fixture.source, "synthetic-offline-fixture");
  assert.deepEqual(
    fixture.messages.map((message) => message.role),
    ["system", "user", "assistant"],
  );
  assert.equal(new Set(suggestions.map((item) => item.id)).size, suggestions.length);

  for (const suggestion of suggestions) {
    assert.match(suggestion.id, /^SUG-\d{3}$/u);
    assert.ok(["accept", "modify", "reject"].includes(suggestion.referenceDecision));
    assert.ok(suggestion.reason.length > 10);
  }
});

test("PERF-001: three fixed GLBs and two procedural scenes keep demand-rendering constraints", async () => {
  const [demo, runtimeSource, modelSource, modelCatalogSource, modelAssets] =
    await Promise.all([
      readJson(paths.demo),
      readFile(paths.runtime, "utf8"),
      readFile(paths.model, "utf8"),
      readFile(paths.modelCatalog, "utf8"),
      Promise.all(paths.modelAssets.map((path) => readFile(path))),
    ]);
  const sceneSource = `${runtimeSource}\n${modelSource}\n${modelCatalogSource}`;

  assert.equal(demo.scene.initialDpr, 1);
  assert.equal(demo.scene.fallbackDpr, 0.75);
  assert.ok(demo.scene.seed.length > 0);
  assert.doesNotMatch(sceneSource, /Math\.random|Date\.now/u);
  assert.doesNotMatch(runtimeSource, /setAnimationLoop|requestAnimationFrame/u);
  assert.match(runtimeSource, /import\s*\{[\s\S]*\}\s*from\s*"three"/u);
  assert.match(modelSource, /GLTFLoader/u);
  assert.match(modelSource, /parseAsync/u);
  assert.match(modelSource, /MeshPhysicalMaterial/u);
  assert.match(modelSource, /computeVertexNormals/u);
  assert.match(modelSource, /teaching-hotspot/u);
  assert.match(modelSource, /createPlantCellModel/u);
  assert.match(modelSource, /createMuscleCellModel/u);
  assert.match(modelSource, /RoundedBoxGeometry/u);
  assert.match(modelSource, /definition\.source\.kind === "procedural"/u);
  assert.doesNotMatch(sceneSource, /Environment\s+preset/u);

  for (const modelId of expectedModelIds) {
    assert.match(modelCatalogSource, new RegExp(`id: "${modelId}"`, "u"));
  }
  assert.equal(
    [
      ...modelCatalogSource.matchAll(
        /source:\s*\{\s*kind: "procedural"/gu,
      ),
    ].length,
    2,
  );

  for (const [index, expected] of expectedModelAssets.entries()) {
    const modelAsset = modelAssets[index];
    const glbJson = readGlbJson(modelAsset);

    assert.match(
      modelCatalogSource,
      new RegExp(expected.fileName.replace(".", "\\."), "u"),
    );
    assert.equal(modelAsset.byteLength, expected.byteLength);
    assert.equal(
      createHash("sha256").update(modelAsset).digest("hex"),
      expected.sha256,
    );
    assert.equal(glbJson.meshes.length, 1);
    assert.equal(countPositionVertices(glbJson), expected.vertices);
    assert.equal(countTriangles(glbJson), expected.triangles);
    assert.equal(glbJson.materials?.length ?? 0, 0);
    assert.equal(glbJson.textures?.length ?? 0, 0);
    assert.deepEqual(glbJson.extensionsRequired ?? [], []);
  }
});

test("LOCAL-001: optional reference GLBs remain development-only and loopback-only", async () => {
  const [
    modelCatalogSource,
    localReferenceRouteSource,
    modelSource,
    explorerSource,
    packageJson,
  ] = await Promise.all([
    readFile(paths.modelCatalog, "utf8"),
    readFile(paths.localReferenceRoute, "utf8"),
    readFile(paths.model, "utf8"),
    readFile(paths.explorer, "utf8"),
    readJson(resolve(repositoryRoot, "package.json")),
  ]);

  assert.match(
    modelCatalogSource,
    /local-reference-cell-models\/plant-cell-3d-model-tripo-v3\.glb/u,
  );
  assert.match(
    modelCatalogSource,
    /local-reference-cell-models\/muscle-cell-tripo-skeletal-fiber-textured-pbr\.glb/u,
  );
  assert.match(modelCatalogSource, /materialMode: "native"/u);
  assert.match(
    localReferenceRouteSource,
    /process\.env\.NODE_ENV === "development"/u,
  );
  assert.match(
    localReferenceRouteSource,
    /CELL_LOCAL_REFERENCE_MODELS === "1"/u,
  );
  assert.match(localReferenceRouteSource, /\.local-assets/u);
  assert.match(localReferenceRouteSource, /isLoopbackRequest/u);
  assert.doesNotMatch(localReferenceRouteSource, /https?:\/\//u);
  assert.equal(packageJson.scripts.dev, "next dev --hostname 127.0.0.1");
  assert.match(modelSource, /disposeCellTexture/u);
  assert.match(modelSource, /texture\.image\.close\(\)/u);
  assert.match(
    explorerSource,
    /active = false;\s*sceneAbortController\.abort\(\)/u,
  );
});

test("LOCAL-002: the plant reference front preview is exact, development-only, and loopback-only", async () => {
  const [localReferencePreviewRouteSource, diagramSource] = await Promise.all([
    readFile(paths.localReferencePreviewRoute, "utf8"),
    readFile(paths.diagram, "utf8"),
  ]);

  assert.match(
    diagramSource,
    new RegExp(
      `/api/local-reference-cell-previews/${localReferencePreviewAsset.replaceAll(".", "\\.")}`,
      "u",
    ),
  );
  assert.match(
    localReferencePreviewRouteSource,
    new RegExp(
      `const localReferencePreviewAssets = new Set\\(\\[\\s*"${localReferencePreviewAsset.replaceAll(".", "\\.")}"\\s*,?\\s*\\]\\);`,
      "u",
    ),
  );
  assert.match(
    localReferencePreviewRouteSource,
    /process\.env\.NODE_ENV === "development"/u,
  );
  assert.match(
    localReferencePreviewRouteSource,
    /CELL_LOCAL_REFERENCE_MODELS === "1"/u,
  );
  assert.match(
    localReferencePreviewRouteSource,
    /return\s*\(\s*process\.env\.NODE_ENV === "development"\s*&&\s*process\.env\.CELL_LOCAL_REFERENCE_MODELS === "1"\s*\);/u,
  );
  assert.match(
    localReferencePreviewRouteSource,
    /if \(!localPreviewIsEnabled\(\) \|\| !isLoopbackRequest\(request\)\) \{\s*return new Response\(null, \{ status: 404 \}\);/u,
  );
  assert.match(
    localReferencePreviewRouteSource,
    /"\.local-assets",\s*"cell-architecture-studio",\s*"front-previews"/u,
  );
  assert.match(
    localReferencePreviewRouteSource,
    /hostname === "localhost"/u,
  );
  assert.match(
    localReferencePreviewRouteSource,
    /hostname === "127\.0\.0\.1"/u,
  );
  assert.match(localReferencePreviewRouteSource, /hostname === "\[::1\]"/u);
  assert.match(localReferencePreviewRouteSource, /"Content-Type": "image\/png"/u);
  assert.match(
    localReferencePreviewRouteSource,
    /"X-Local-Reference-Only": "1"/u,
  );
  assert.doesNotMatch(localReferencePreviewRouteSource, /https?:\/\//u);
  assert.doesNotMatch(localReferencePreviewRouteSource, /\bfetch\s*\(/u);
});

test("STATIC-001: fixed static front previews use published sources and declared capture bounds", async () => {
  const [rendererSource, diagramSource, previewAssets] = await Promise.all([
    readFile(paths.frontPreviewRenderer, "utf8"),
    readFile(paths.diagram, "utf8"),
    Promise.all(paths.frontPreviewAssets.map((path) => readFile(path))),
  ]);

  assert.match(
    rendererSource,
    /const defaultBaseUrl = "http:\/\/127\.0\.0\.1:3101"/u,
  );
  assert.match(rendererSource, /const loopbackHosts = new Set/u);
  assert.match(rendererSource, /data-local-reference-models/u);
  assert.match(rendererSource, /localReferenceMode !== "disabled"/u);
  assert.match(rendererSource, /data-model-source/u);
  assert.match(rendererSource, /waitUntil: "networkidle"/u);
  assert.match(rendererSource, /deviceScaleFactor: 1/u);
  assert.match(rendererSource, /viewport: \{ width: 1440, height: 1000 \}/u);
  assert.match(rendererSource, /waitForTimeout\(120\)/u);
  assert.match(rendererSource, /\$\{specimen\.id\}-front-v1\.png/u);
  assert.match(rendererSource, /if \(specimen\.id === "animal-cell"\)/u);
  assert.match(
    rendererSource,
    /canvas\.click\(\{ position: \{ x: 8, y: 8 \} \}\)/u,
  );
  assert.match(rendererSource, /data-selected-structure="none"/u);
  assert.doesNotMatch(rendererSource, /\.local-assets|Tripo/u);
  assert.doesNotMatch(rendererSource, /page\.(?:mouse|keyboard)/u);
  assert.match(diagramSource, /frontPreviewByModel/u);
  assert.match(diagramSource, /frontPreviewFallback/u);
  assert.match(diagramSource, /<img/u);
  assert.match(diagramSource, /ref=\{imageRef\}/u);
  assert.match(diagramSource, /onError=\{\(\) => setFailed\(true\)\}/u);
  assert.match(
    diagramSource,
    /image\.complete && image\.naturalWidth === 0/u,
  );

  for (const [index, expected] of expectedFrontPreviewAssets.entries()) {
    const asset = previewAssets[index];
    assert.match(
      rendererSource,
      new RegExp(
        `\\{ id: "${expected.id}", name: "[^"]+", source: "${expected.source}" \\}`,
        "u",
      ),
    );
    assert.match(
      diagramSource,
      new RegExp(
        `/cell-architecture/front-previews/${expected.fileName.replaceAll(".", "\\.")}`,
        "u",
      ),
    );
    assert.equal(asset.byteLength, expected.byteLength);
    assert.equal(
      createHash("sha256").update(asset).digest("hex"),
      expected.sha256,
    );
    assert.deepEqual([...asset.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(asset.toString("ascii", 12, 16), "IHDR");
    assert.equal(asset.readUInt32BE(16), 704);
    assert.equal(asset.readUInt32BE(20), 521);
  }
});
