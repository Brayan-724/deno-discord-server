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
  const sessionId = await getSessionId(c.req.raw);

  let username = "No logged";

  if (sessionId) {
    const userSession = await db.sessions.findFirst({
      where: { session_id: sessionId },
      include: { user: true },
    });

    if (userSession) {
      username = userSession.user.name;
    }
  }

  return c.html(html`
<!DOCTYPE html> 
${viewIndex(!!sessionId, username)} 
<script> window.is_logged=${sessionId ? "true" : "false"}</script>
`);
});

Deno.serve(app.fetch);
