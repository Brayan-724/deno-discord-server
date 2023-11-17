import { Context, Hono } from "hono/mod.ts";
import { getFilePath } from "hono/utils/filepath.ts";
import { getMimeType } from "hono/utils/mime.ts";

import { bundle } from "emit/mod.ts";
import sass from "denosass/mod.ts";

import * as JSONC from "std/jsonc/mod.ts";

const denoConfig = JSONC.parse(
  await Deno.readTextFile(new URL(import.meta.resolve("../deno.jsonc"))),
  { allowTrailingComma: true },
);

const PUBLIC_DIR = new URL(import.meta.resolve("../public/"));

const router = new Hono<Env>();

const byExtensionProcessors = {
  async scss(c, filePath) {
    const file = await readFile(filePath);
    if (!file) return await c.notFound();

    const compiled = sass(file, { style: "compressed" });

    c.header("Content-Type", "text/css");
    return c.body(compiled.to_buffer("compressed") as Uint8Array);
  },
} as Record<string, (c: DDSHonoContext, filePath: URL) => Promise<Response>>;

router.get("*.ts", async (c) => {
  const filePath = resolveFilePath(c);
  if (!filePath) return await c.notFound();

  const file = await readFile(filePath);
  if (!file) return await c.notFound();

  const bundled = await bundle(filePath, {
    minify: true,
    importMap: {
      imports: {
        "npm/": new URL(import.meta.resolve("../public/vendor/cdn.jsdelivr.net/npm/")).pathname,
      },
      scopes: denoConfig.scopes,
    },
  });

  c.header("Content-Type", "text/javascript");
  return c.body(bundled.code);
});

router.get("*", async (c: DDSHonoContext, next) => {
  const filePath = resolveFilePath(c);
  if (!filePath) return await next();

  const ext = filePath.pathname.split(".").pop() ?? "default";
  if (byExtensionProcessors[ext]) {
    return await byExtensionProcessors[ext](c, filePath);
  }

  const file = await getFile(filePath);
  if (!file) return await next();

  const mimeType = getMimeType(filePath.pathname);
  if (mimeType) {
    c.header("Content-Type", mimeType);
  }

  // Return Response object with stream
  return c.body(file.readable);
});

function resolveFilePath(c: Context): URL | null {
  const url = new URL(c.req.url);
  const filename = decodeURI(url.pathname);
  const path = getFilePath({
    filename: filename.replace("/static", ""),
  });

  if (!path) return null;

  return new URL(path, PUBLIC_DIR);
}

async function readFile(filePath: string | URL): Promise<Uint8Array | null> {
  try {
    return await Deno.readFile(filePath);
  } catch (e) {
    console.warn(`${e}`);
    console.warn(`Static file: ${filePath} is not found`);
    return null;
  }
}

async function getFile(filePath: string | URL): Promise<Deno.FsFile | null> {
  try {
    return await Deno.open(filePath);
  } catch (e) {
    console.warn(`${e}`);
    console.warn(`Static file: ${filePath} is not found`);
    return null;
  }
}

export default router;
