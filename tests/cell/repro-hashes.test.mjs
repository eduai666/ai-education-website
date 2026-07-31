import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import {
  defaultManifestPath,
  repositoryRoot,
  sha256File,
  updateReproInputs,
  verifyReproInputs,
} from "../../scripts/cell-repro-hashes.mjs";

const baselineDirectory = resolve(
  repositoryRoot,
  "docs/markdown/生物学习/00-可复现基线",
);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test("BUILD-001: versioned reproducibility inputs match their raw-byte SHA-256 values", async () => {
  const result = await verifyReproInputs();

  assert.equal(
    result.ok,
    true,
    result.failures
      .map((failure) => `${failure.path}: ${failure.reason}`)
      .join("\n"),
  );
  assert.ok(result.checked >= 20);
  assert.equal(result.manifest.hashAlgorithm, "sha256");
  assert.equal(result.manifest.bytePolicy, "raw-file-bytes");
  assert.equal(
    result.manifest.files.some(
      (file) => resolve(repositoryRoot, file.path) === defaultManifestPath,
    ),
    false,
    "The manifest cannot contain its own hash.",
  );
});

test("ASSET-001: programmatic visuals are local, traceable, and declare no remote runtime assets", async () => {
  const assetManifestPath = resolve(baselineDirectory, "asset-manifest.json");
  const [assetManifest, packageJson] = await Promise.all([
    readJson(assetManifestPath),
    readJson(resolve(repositoryRoot, "package.json")),
  ]);

  assert.equal(assetManifest.schemaVersion, "cell-asset-manifest.v1");
  assert.equal(assetManifest.demoVersion, "bio-cell-demo-v0.1");
  assert.equal(
    assetManifest.runtimeAssetPolicy.networkFetchedVisualizationAssets,
    false,
  );

  for (const field of [
    "externalModels",
    "externalTextures",
    "externalFonts",
    "externalDecoders",
    "remoteRuntimeUrls",
  ]) {
    assert.deepEqual(assetManifest.runtimeAssetPolicy[field], []);
  }

  assert.deepEqual(
    assetManifest.generatedVisuals.map((visual) => visual.id),
    ["cell-2d-diagram-v1", "cell-3d-scene-v1"],
  );

  for (const visual of assetManifest.generatedVisuals) {
    const sourcePath = resolve(repositoryRoot, visual.source.path);
    const configurationPath = resolve(repositoryRoot, visual.configuration.path);
    const [sourceBytes, configurationBytes] = await Promise.all([
      readFile(sourcePath),
      readFile(configurationPath),
    ]);

    assert.equal(sourceBytes.byteLength, visual.source.byteSize);
    assert.equal(configurationBytes.byteLength, visual.configuration.byteSize);
    assert.equal(await sha256File(sourcePath), visual.source.sha256);
    assert.equal(
      await sha256File(configurationPath),
      visual.configuration.sha256,
    );
    assert.deepEqual(visual.outputFiles, []);
  }

  const threeRecord = assetManifest.thirdPartyCode.find(
    (record) => record.package === "three",
  );
  assert.ok(threeRecord, "Three.js must have a provenance record.");
  assert.equal(packageJson.dependencies.three, threeRecord.version);
  assert.equal(threeRecord.license, "MIT");
  assert.equal(
    assetManifest.performanceEvidence.lowEndDeviceClaim,
    "pending-manual-real-device-test",
  );
});

test("BUILD-001: verifier detects drift and explicit update repairs only the selected manifest", async (t) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "cell-repro-hash-test-"));
  t.after(async () => {
    await rm(temporaryRoot, { recursive: true, force: true });
  });

  const inputPath = join(temporaryRoot, "input.txt");
  const manifestPath = join(temporaryRoot, "manifest.json");
  const original = Buffer.from("stable-input\n", "utf8");
  const originalHash = createHash("sha256").update(original).digest("hex");

  await writeFile(inputPath, original);
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        schemaVersion: "cell-repro-inputs.v1",
        demoVersion: "bio-cell-demo-v0.1",
        manifestVersion: "test-only",
        hashAlgorithm: "sha256",
        hashEncoding: "lowercase-hex",
        pathBase: "repository-root",
        bytePolicy: "raw-file-bytes",
        selfHashPolicy: "test manifest is not self-hashed",
        files: [
          {
            path: "input.txt",
            role: "test-input",
            sha256: originalHash,
          },
        ],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  assert.equal(
    (await verifyReproInputs({ manifestPath, root: temporaryRoot })).ok,
    true,
  );

  await writeFile(inputPath, Buffer.from("stable-input!\n", "utf8"));
  const drifted = await verifyReproInputs({
    manifestPath,
    root: temporaryRoot,
  });

  assert.equal(drifted.ok, false);
  assert.equal(drifted.failures.length, 1);
  assert.equal(drifted.failures[0].path, "input.txt");
  assert.equal(drifted.failures[0].reason, "hash-mismatch");

  assert.equal(
    await updateReproInputs({ manifestPath, root: temporaryRoot }),
    1,
  );
  assert.equal(
    (await verifyReproInputs({ manifestPath, root: temporaryRoot })).ok,
    true,
  );
});
