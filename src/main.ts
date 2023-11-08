import { Hono } from "hono/mod.ts";
import { compress } from "hono/middleware/compress/index.ts";

import apiRouter from "./api.ts";
import staticRouter from "./static.ts";

const app = new Hono();

app.use(compress());

app.route("/api", apiRouter);
app.route("/static", staticRouter);

app.get("/", (c) => {
  return c.text("Hello World!");
});

Deno.serve(app.fetch);
