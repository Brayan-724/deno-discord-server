import { Context, Hono } from "hono/mod.ts";
import { getFilePath } from "hono/utils/filepath.ts";
import { getMimeType } from "hono/utils/mime.ts";

import { bundle } from "emit/mod.ts";
import sass from "denosass/mod.ts";

const PUBLIC_DIR = new URL(import.meta.resolve("../public/"));

const router = new Hono();

router.get("*.ts", async (c, next) => {
  const filePath = resolveFilePath(c);
  if (!filePath) return await next();

  const file = await readFile(filePath);
  if (!file) return await next();

  const a = await bundle(filePath, { "minify": true });


  c.header("Content-Type", "text/javascript");
  return c.body(a.code);
});

router.get("*.scss", async (c, next) => {
  const filePath = resolveFilePath(c);
  if (!filePath) return await next();

  const file = await readFile(filePath);
  if (!file) return await next();

  const compiled = sass(file, { style: "compressed" });

  c.header("Content-Type", "text/css");
  return c.body(compiled.to_buffer("compressed") as Uint8Array);
});

router.get("*", async (c, next) => {
  const filePath = resolveFilePath(c);

  if (!filePath) return await next();

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
