import { getSessionId } from "deno_kv_auth/mod.ts";
import { Next } from "hono/mod.ts";
import { DDSHonoContext } from "../types.d.ts";

export function mustBeLogged() {
  return async (c: DDSHonoContext, next: Next) => {
    const session = await getSessionId(c.req.raw);

    if (session === undefined) {
      return c.json({ errors: [] }, 401);
    }

    c.set("sessionId", session);

    return next();
  };
}
