import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const localReferenceAssets = new Set([
  "plant-cell-3d-model-tripo-v3.glb",
  "muscle-cell-tripo-skeletal-fiber-textured-pbr.glb",
]);

const localReferenceModelDirectory = join(
  process.cwd(),
  ".local-assets",
  "cell-architecture-studio",
  "models",
);

function localPreviewIsEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.CELL_LOCAL_REFERENCE_MODELS === "1"
  );
}

function isLoopbackRequest(request: Request) {
  const hostname = new URL(request.url).hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ asset: string }> },
) {
  if (!localPreviewIsEnabled() || !isLoopbackRequest(request)) {
    return new Response(null, { status: 404 });
  }

  const { asset } = await context.params;
  if (!localReferenceAssets.has(asset)) {
    return new Response(null, { status: 404 });
  }

  try {
    const bytes = await readFile(join(localReferenceModelDirectory, asset));
    return new Response(bytes, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Length": String(bytes.byteLength),
        "Content-Type": "model/gltf-binary",
        "X-Local-Reference-Only": "1",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
