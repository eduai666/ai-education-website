import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

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

test("PERF-001: scene inputs are deterministic and default to demand rendering constraints", async () => {
  const [demo, runtimeSource] = await Promise.all([
    readJson(paths.demo),
    readFile(paths.runtime, "utf8"),
  ]);

  assert.equal(demo.scene.initialDpr, 1);
  assert.equal(demo.scene.fallbackDpr, 0.75);
  assert.ok(demo.scene.seed.length > 0);
  assert.doesNotMatch(runtimeSource, /Math\.random|Date\.now/u);
  assert.doesNotMatch(runtimeSource, /setAnimationLoop|requestAnimationFrame/u);
  assert.match(runtimeSource, /import\s*\{[\s\S]*\}\s*from\s*"three"/u);
});
