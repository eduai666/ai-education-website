#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  lstat,
  readFile,
  realpath,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, posix, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const moduleDirectory = dirname(fileURLToPath(import.meta.url));

export const repositoryRoot = resolve(moduleDirectory, "..");
export const defaultManifestPath = resolve(
  repositoryRoot,
  "docs/markdown/生物学习/00-可复现基线/repro-inputs-v1.json",
);

const expectedManifestFields = {
  schemaVersion: "cell-repro-inputs.v1",
  demoVersion: "bio-cell-demo-v0.1",
  hashAlgorithm: "sha256",
  hashEncoding: "lowercase-hex",
  pathBase: "repository-root",
  bytePolicy: "raw-file-bytes",
};

const sha256Pattern = /^[0-9a-f]{64}$/u;

export async function sha256File(path) {
  const bytes = await readFile(path);
  return createHash("sha256").update(bytes).digest("hex");
}

async function readManifest(manifestPath) {
  const source = await readFile(manifestPath, "utf8");
  return JSON.parse(source);
}

function assertManifestShape(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new TypeError("Repro input manifest must be a JSON object.");
  }

  for (const [field, expected] of Object.entries(expectedManifestFields)) {
    if (manifest[field] !== expected) {
      throw new TypeError(
        `Manifest field ${field} must equal ${JSON.stringify(expected)}.`,
      );
    }
  }

  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new TypeError("Manifest files must be a non-empty array.");
  }

  const paths = new Set();
  let previousPath = "";

  for (const [index, file] of manifest.files.entries()) {
    if (!file || typeof file !== "object" || Array.isArray(file)) {
      throw new TypeError(`Manifest files[${index}] must be an object.`);
    }

    if (typeof file.path !== "string" || file.path.length === 0) {
      throw new TypeError(`Manifest files[${index}].path must be non-empty.`);
    }

    if (
      isAbsolute(file.path) ||
      file.path.includes("\\") ||
      file.path.includes("\0") ||
      file.path === ".." ||
      file.path.startsWith("../") ||
      posix.normalize(file.path) !== file.path
    ) {
      throw new TypeError(
        `Manifest path must be a normalized repository-relative POSIX path: ${file.path}`,
      );
    }

    if (paths.has(file.path)) {
      throw new TypeError(`Manifest contains duplicate path: ${file.path}`);
    }

    if (previousPath && previousPath >= file.path) {
      throw new TypeError("Manifest file entries must be sorted by path.");
    }

    if (typeof file.role !== "string" || file.role.length === 0) {
      throw new TypeError(`Manifest role is missing for ${file.path}.`);
    }

    if (!sha256Pattern.test(file.sha256)) {
      throw new TypeError(`Manifest SHA-256 is invalid for ${file.path}.`);
    }

    paths.add(file.path);
    previousPath = file.path;
  }
}

function assertManifestDoesNotHashItself(manifest, manifestPath, root) {
  const absoluteManifestPath = resolve(manifestPath);
  const manifestRelativePath = posix.relative(
    resolve(root).replaceAll("\\", "/"),
    absoluteManifestPath.replaceAll("\\", "/"),
  );

  if (manifest.files.some((file) => file.path === manifestRelativePath)) {
    throw new TypeError("The reproducibility manifest must not hash itself.");
  }
}

async function resolveManifestFile(root, relativePath) {
  const realRoot = await realpath(root);
  const candidate = resolve(realRoot, relativePath);
  const realCandidate = await realpath(candidate);
  const rootPrefix = `${realRoot}${sep}`;

  if (!realCandidate.startsWith(rootPrefix)) {
    throw new Error(`Manifest path resolves outside the repository: ${relativePath}`);
  }

  const metadata = await lstat(realCandidate);
  if (!metadata.isFile()) {
    throw new Error(`Manifest path is not a regular file: ${relativePath}`);
  }

  return realCandidate;
}

export async function verifyReproInputs({
  manifestPath = defaultManifestPath,
  root = repositoryRoot,
} = {}) {
  const manifest = await readManifest(manifestPath);
  assertManifestShape(manifest);
  assertManifestDoesNotHashItself(manifest, manifestPath, root);

  const failures = [];

  for (const file of manifest.files) {
    try {
      const absolutePath = await resolveManifestFile(root, file.path);
      const actual = await sha256File(absolutePath);
      if (actual !== file.sha256) {
        failures.push({
          path: file.path,
          reason: "hash-mismatch",
          expected: file.sha256,
          actual,
        });
      }
    } catch (error) {
      failures.push({
        path: file.path,
        reason: "unreadable-input",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    ok: failures.length === 0,
    checked: manifest.files.length,
    failures,
    manifest,
  };
}

export async function updateReproInputs({
  manifestPath = defaultManifestPath,
  root = repositoryRoot,
} = {}) {
  const manifest = await readManifest(manifestPath);
  assertManifestShape(manifest);
  assertManifestDoesNotHashItself(manifest, manifestPath, root);

  const updatedFiles = [];
  for (const file of manifest.files) {
    const absolutePath = await resolveManifestFile(root, file.path);
    updatedFiles.push({
      ...file,
      sha256: await sha256File(absolutePath),
    });
  }

  const updatedManifest = {
    ...manifest,
    files: updatedFiles,
  };
  const temporaryPath = `${manifestPath}.${process.pid}.tmp`;

  try {
    await writeFile(
      temporaryPath,
      `${JSON.stringify(updatedManifest, null, 2)}\n`,
      "utf8",
    );
    await rename(temporaryPath, manifestPath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }

  return updatedManifest.files.length;
}

function printUsage() {
  process.stderr.write(
    "Usage: node scripts/cell-repro-hashes.mjs --check|--write\n",
  );
}

async function main() {
  const [mode = "--check", ...extraArguments] = process.argv.slice(2);
  if (extraArguments.length > 0 || !["--check", "--write"].includes(mode)) {
    printUsage();
    process.exitCode = 2;
    return;
  }

  if (mode === "--write") {
    const count = await updateReproInputs();
    process.stdout.write(
      `Updated ${count} SHA-256 entries in ${defaultManifestPath}.\n`,
    );
    return;
  }

  const result = await verifyReproInputs();
  if (result.ok) {
    process.stdout.write(
      `Verified ${result.checked} reproducibility inputs using SHA-256 over raw file bytes.\n`,
    );
    return;
  }

  for (const failure of result.failures) {
    if (failure.reason === "hash-mismatch") {
      process.stderr.write(
        `${failure.path}: expected ${failure.expected}, received ${failure.actual}\n`,
      );
    } else {
      process.stderr.write(`${failure.path}: ${failure.message}\n`);
    }
  }
  process.exitCode = 1;
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : undefined;

if (invokedPath === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.stack ?? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
