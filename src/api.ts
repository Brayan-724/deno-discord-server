import { Hono } from "hono/mod.ts";
import { logger } from "hono/middleware/logger/index.ts";

import oauthRouter from "./routes/oauth.ts";
import db from "./db.ts";

const api = new Hono();

api.use(logger());

api.route("/oauth", oauthRouter);

api.get("/messages", async (c) => {
  const messages = await db.messages.findMany({});
  messages.sort((a, b) => +a.createdAt - (+b.createdAt));
  return c.json(messages);
});

api.get("/profile/:id", async (c) => {
  const profileId = c.req.param("id");
  const socket = await db.profiles.findFirst({ where: { id: profileId } });
  if (!socket) {
    return c.json({
      done: false,
      data: "Socket not found",
    }, 404);
  }

  return c.json({
    done: true,
    data: socket,
  });
});

export default api;
