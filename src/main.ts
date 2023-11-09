import { Hono } from "hono/mod.ts";
import { compress } from "hono/middleware/compress/index.ts";

import apiRouter from "./api.ts";
import staticRouter from "./static.ts";

import "./db.ts";

const app = new Hono();

app.use(compress());

app.route("/api", apiRouter);
app.route("/static", staticRouter);

app.get("/", async (c) => {
  const index = new URL(import.meta.resolve("./views/index.html")).pathname;

  return c.html(await Deno.readTextFile(index));
});

Deno.serve(app.fetch);
