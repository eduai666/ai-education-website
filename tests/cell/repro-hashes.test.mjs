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

const expectedFrontPreviewAssets = [
  {
    modelId: "animal-cell",
    path: "public/cell-architecture/front-previews/animal-cell-front-v1.png",
    runtimeUrl: "/cell-architecture/front-previews/animal-cell-front-v1.png",
    byteSize: 250_134,
    sha256: "e8ca7bd6b5c9ae2cf900043f2d59a0599cc5817c4f0401de8ddb65f28662672e",
  },
  {
    modelId: "plant-cell",
    path: "public/cell-architecture/front-previews/plant-cell-front-v1.png",
    runtimeUrl: "/cell-architecture/front-previews/plant-cell-front-v1.png",
    byteSize: 92_971,
    sha256: "e5ef97ff041f86f97154fb331bec4bafe1aea84e5cf5bb3ad64c21a778098141",
  },
  {
    modelId: "muscle-cell",
    path: "public/cell-architecture/front-previews/muscle-cell-front-v1.png",
    runtimeUrl: "/cell-architecture/front-previews/muscle-cell-front-v1.png",
    byteSize: 96_634,
    sha256: "56a11a357ec16a2551f7b74eeb1895c1877fe1aff543e6b797a9199c0e56c9e7",
  },
  {
    modelId: "neuron",
    path: "public/cell-architecture/front-previews/neuron-front-v1.png",
    runtimeUrl: "/cell-architecture/front-previews/neuron-front-v1.png",
    byteSize: 31_083,
    sha256: "b15c14ad3f31d29c0e0784f71c7dbfab248ded43bf55ea066d3a99b0740953ef",
  },
  {
    modelId: "bacteria-wall",
    path: "public/cell-architecture/front-previews/bacteria-wall-front-v1.png",
    runtimeUrl: "/cell-architecture/front-previews/bacteria-wall-front-v1.png",
    byteSize: 197_903,
    sha256: "3f6a6ee6e58cf9d42b9a6256af7acf0c45abd49da6310d9e820d183d525a3440",
  },
];

const localReferencePreviewRoutePath =
  "src/app/api/local-reference-cell-previews/[asset]/route.ts";
const localReferencePreviewAsset = "plant-cell-reference-front-v1.png";

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
  assert.ok(result.checked >= 40);
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

test("LOCAL-002: ignored plant reference preview remains outside release and reproducibility assets", async () => {
  const [assetManifest, reproInputs] = await Promise.all([
    readJson(resolve(baselineDirectory, "asset-manifest.json")),
    readJson(defaultManifestPath),
  ]);
  const routeRecord = reproInputs.files.find(
    (file) => file.path === localReferencePreviewRoutePath,
  );
  const declaredReleasePaths = [
    ...assetManifest.runtimeAssetPolicy.externalModels.map(({ path }) => path),
    ...assetManifest.generatedVisuals.flatMap((visual) =>
      visual.outputFiles.map(({ path }) => path),
    ),
    ...assetManifest.thirdPartyAssets.map(({ localPath }) => localPath),
  ];

  assert.ok(routeRecord, "The local preview gate source must be hash-tracked.");
  assert.equal(
    routeRecord.role,
    "development-only-local-reference-preview-gate",
  );
  assert.match(routeRecord.sha256, /^[0-9a-f]{64}$/u);
  assert.equal(
    reproInputs.files.some(
      (file) =>
        file.path.includes(".local-assets") ||
        file.path.endsWith(localReferencePreviewAsset),
    ),
    false,
  );
  assert.equal(
    declaredReleasePaths.some(
      (path) =>
        path.includes(".local-assets") || path.endsWith(localReferencePreviewAsset),
    ),
    false,
  );
  assert.match(assetManifest.runtimeAssetPolicy.note, /local-development preview/u);
  assert.match(assetManifest.runtimeAssetPolicy.note, /not release assets/u);
});

test("ASSET-001: local visuals are traceable and declare no remote runtime assets", async () => {
  const assetManifestPath = resolve(baselineDirectory, "asset-manifest.json");
  const [assetManifest, packageJson] = await Promise.all([
    readJson(assetManifestPath),
    readJson(resolve(repositoryRoot, "package.json")),
  ]);

  assert.equal(assetManifest.schemaVersion, "cell-asset-manifest.v1");
  assert.equal(assetManifest.demoVersion, "bio-cell-demo-v0.3");
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
    [
      "cell-2d-diagram-v1",
      "cell-3d-scene-v3",
      "cell-3d-front-preview-v1",
    ],
  );

  const frontPreviewVisual = assetManifest.generatedVisuals.find(
    (visual) => visual.id === "cell-3d-front-preview-v1",
  );
  assert.ok(frontPreviewVisual, "Static front previews need a provenance record.");
  assert.equal(
    frontPreviewVisual.kind,
    "five-fixed-camera-3d-front-preview-pngs",
  );
  assert.deepEqual(frontPreviewVisual.capture.viewport, {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
  });
  assert.deepEqual(frontPreviewVisual.capture.outputCanvas, {
    width: 704,
    height: 521,
  });
  assert.equal(frontPreviewVisual.capture.localReferenceModels, "disabled");
  assert.match(frontPreviewVisual.capture.server, /127\.0\.0\.1:3101/u);
  assert.match(frontPreviewVisual.capture.sceneCamera, /no rotate or zoom gesture/u);
  assert.match(frontPreviewVisual.capture.readiness, /canvas coordinate \(8, 8\)/u);
  assert.match(
    frontPreviewVisual.capture.readiness,
    /data-selected-structure=none/u,
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
    if (visual.id !== "cell-3d-front-preview-v1") {
      assert.deepEqual(visual.outputFiles, []);
    }
  }

  assert.deepEqual(
    frontPreviewVisual.outputFiles.map(
      ({ modelId, path, runtimeUrl, byteSize, mime, sha256 }) => ({
        modelId,
        path,
        runtimeUrl,
        byteSize,
        mime,
        sha256,
      }),
    ),
    expectedFrontPreviewAssets.map((asset) => ({
      ...asset,
      mime: "image/png",
    })),
  );
  for (const expected of expectedFrontPreviewAssets) {
    const previewPath = resolve(repositoryRoot, expected.path);
    const bytes = await readFile(previewPath);
    assert.equal(bytes.byteLength, expected.byteSize);
    assert.equal(await sha256File(previewPath), expected.sha256);
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(bytes.readUInt32BE(16), 704);
    assert.equal(bytes.readUInt32BE(20), 521);
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
        demoVersion: "bio-cell-demo-v0.3",
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
