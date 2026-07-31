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

const expectedThirdPartyModels = [
  {
    id: "nih-3d-animal-cell-3dpx-015797-v2",
    path: "public/models/cell-architecture-studio/animal-cell-nih.glb",
    byteSize: 1_526_232,
    sha256: "416b95d454e4243a49a530e7e9e4447d33c543e838d072ae5128c38bdad7d7c6",
    triangles: 84_906,
    license: "CC BY-NC-SA 4.0",
  },
  {
    id: "nih-3d-neuron-3dpx-015796-v2",
    path: "public/models/cell-architecture-studio/neuron-nih.glb",
    byteSize: 2_885_524,
    sha256: "d979bca2c94eb7b78de51bf68642ba00bf0b21d38d31161348f033c2a893a4a4",
    triangles: 160_256,
    license: "CC BY-NC-SA 4.0",
  },
  {
    id: "nih-3d-gram-positive-cell-wall-3dpx-010752-v2",
    path: "public/models/cell-architecture-studio/bacteria-wall-nih.glb",
    byteSize: 482_424,
    sha256: "8c25bccaf828353ced1849483f9701266b43ae6f51899f6f6a3c45bfc7bede57",
    triangles: 25_542,
    license: "CC0 1.0",
  },
];

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

test("ASSET-001: local visuals are traceable and declare no remote runtime assets", async () => {
  const assetManifestPath = resolve(baselineDirectory, "asset-manifest.json");
  const [assetManifest, packageJson] = await Promise.all([
    readJson(assetManifestPath),
    readJson(resolve(repositoryRoot, "package.json")),
  ]);

  assert.equal(assetManifest.schemaVersion, "cell-asset-manifest.v1");
  assert.equal(assetManifest.demoVersion, "bio-cell-demo-v0.2");
  assert.equal(
    assetManifest.runtimeAssetPolicy.networkFetchedVisualizationAssets,
    false,
  );

  for (const field of [
    "externalTextures",
    "externalFonts",
    "externalDecoders",
    "remoteRuntimeUrls",
  ]) {
    assert.deepEqual(assetManifest.runtimeAssetPolicy[field], []);
  }
  assert.deepEqual(
    assetManifest.runtimeAssetPolicy.externalModels.map((model) => ({
      path: model.path,
      byteSize: model.byteSize,
      sha256: model.sha256,
    })),
    expectedThirdPartyModels.map(({ path, byteSize, sha256 }) => ({
      path,
      byteSize,
      sha256,
    })),
  );

  assert.deepEqual(
    assetManifest.generatedVisuals.map((visual) => visual.id),
    ["cell-2d-diagram-v1", "cell-3d-scene-v3"],
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
  assert.equal(assetManifest.thirdPartyAssets.length, 3);
  for (const expected of expectedThirdPartyModels) {
    const asset = assetManifest.thirdPartyAssets.find(
      (candidate) => candidate.id === expected.id,
    );
    assert.ok(asset, `${expected.id} must have a provenance record.`);
    assert.equal(asset.localPath, expected.path);
    assert.equal(asset.byteSize, expected.byteSize);
    assert.equal(asset.sha256, expected.sha256);
    assert.equal(asset.geometry.triangles, expected.triangles);
    assert.equal(asset.license, expected.license);

    const assetPath = resolve(repositoryRoot, asset.localPath);
    const bytes = await readFile(assetPath);
    assert.equal(bytes.byteLength, expected.byteSize);
    assert.equal(await sha256File(assetPath), expected.sha256);
  }
  assert.equal(assetManifest.budgets.maximumTriangles, 170_000);
  assert.equal(assetManifest.budgets.maximumDrawCalls, 12);
  assert.equal(assetManifest.budgets.maximumModelBytes, 3_000_000);
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
        demoVersion: "bio-cell-demo-v0.2",
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
