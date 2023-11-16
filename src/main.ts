import { Hono } from "hono/mod.ts";
import { compress } from "hono/middleware/compress/index.ts";

import apiRouter from "./api.ts";
import staticRouter from "./static.ts";

import "./db.ts";
import { getSessionId } from "deno_kv_auth/mod.ts";
import db from "./db.ts";
import { twind } from "./twind.ts";

import viewIndex from "./views/index.tsx";
import { html } from "hono/helper/html/index.ts";
import wsRouter from "./ws.ts";

const app = new Hono();

app.use(compress());
app.use(twind);

app.route("/api", apiRouter);
app.route("/static", staticRouter);
app.route("/ws", wsRouter);

app.get("/", async (c: DDSHonoContext) => {
  const a = await getSessionId(c.req.raw);

  let b = "No logged";

  if (a) {
    const userSession = await db.sessions.findFirst({
      where: { session_id: a },
      include: { user: true },
    });

    if (userSession) {
      b = userSession.user.name;
    }
  }

  return c.html(html`<!DOCTYPE html> ${viewIndex(b)} `);
});

Deno.serve(app.fetch);
