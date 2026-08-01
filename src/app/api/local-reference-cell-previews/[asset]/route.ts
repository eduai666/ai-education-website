import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * This route intentionally serves only an ignored, local derivative of the
 * unlicensed reference model. It must never become a release asset.
 */
const localReferencePreviewAssets = new Set([
  "plant-cell-reference-front-v1.png",
]);

const localReferencePreviewDirectory = join(
  process.cwd(),
  ".local-assets",
  "cell-architecture-studio",
  "front-previews",
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
  if (!localReferencePreviewAssets.has(asset)) {
    return new Response(null, { status: 404 });
  }

  try {
    const bytes = await readFile(join(localReferencePreviewDirectory, asset));
    return new Response(bytes, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Length": String(bytes.byteLength),
        "Content-Type": "image/png",
        "X-Local-Reference-Only": "1",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
