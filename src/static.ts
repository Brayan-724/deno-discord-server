import { Context, Hono } from "hono/mod.ts";
import { getFilePath } from "hono/utils/filepath.ts";

import { transpile } from "emit/mod.ts";
import { getMimeType } from "hono/utils/mime.ts";

const PUBLIC_DIR = new URL(import.meta.resolve("../public/"));

const router = new Hono();

router.get(
  "*",
  async (c, next) => {
    const filePath = resolveFilePath(c);

    if (!filePath) return await next();

    let file;

    try {
      file = await Deno.open(filePath);
    } catch (e) {
      console.warn(`${e}`);
    }

    if (file) {
      const mimeType = getMimeType(filePath.pathname);
      if (mimeType) {
        c.header("Content-Type", mimeType);
      }
      // Return Response object with stream
      return c.body(file.readable);
    } else {
      console.warn(`Static file: ${filePath} is not found`);
      await next();
    }
    return;
  },
);

function resolveFilePath(c: Context): URL | null {
  const url = new URL(c.req.url);
  const filename = decodeURI(url.pathname);
  const path = getFilePath({
    filename: filename.replace("/static", ""),
  });

  if (!path) return null;

  return new URL(path, PUBLIC_DIR);
}

export default router;
