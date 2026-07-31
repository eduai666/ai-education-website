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
  model: resolve(
    repositoryRoot,
    "src/features/cell-architecture/cell-three-model.ts",
  ),
  modelCatalog: resolve(
    repositoryRoot,
    "src/features/cell-architecture/cell-model-catalog.ts",
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

test("PERF-001: three detailed GLB scenes are fixed and keep demand-rendering constraints", async () => {
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
  assert.doesNotMatch(sceneSource, /Environment\s+preset/u);

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
