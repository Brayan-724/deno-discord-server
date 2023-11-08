import { Hono } from "hono/mod.ts";
import { logger } from "hono/middleware/logger/index.ts";

import oauthRouter from "./routes/oauth.ts";

const api = new Hono();

api.use(logger());

api.route("/oauth", oauthRouter);

export default api;
