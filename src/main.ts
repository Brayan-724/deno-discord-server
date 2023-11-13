import { Hono } from "hono/mod.ts";
import { compress } from "hono/middleware/compress/index.ts";

import apiRouter from "./api.ts";
import staticRouter from "./static.ts";

import "./db.ts";
import { getSessionId } from "deno_kv_auth/mod.ts";
import db from "./db.ts";

const app = new Hono();

app.use(compress());

app.route("/api", apiRouter);
app.route("/static", staticRouter);

app.get("/", async (c) => {
  const index = new URL(import.meta.resolve("./views/index.html")).pathname;
  const indexContent = await Deno.readTextFile(index);

  const a = await getSessionId(c.req.raw);

  let b = "No logged";

  if (a) {
    const userSession = await db.sessions.findFirst({
      where: { session_id: a },
      include: true,
    });

    if (userSession) {
      b = userSession.user.name;
    }
  }

  return c.html(indexContent.replace("<%USER%>", b));
});

Deno.serve(app.fetch);
