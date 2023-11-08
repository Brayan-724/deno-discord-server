import { getSessionId } from "deno_kv_auth/mod.ts";
import { Context, Next } from "hono/mod.ts";

export function mustBeLogged() {
  return async (c: Context, next: Next) => {
    const session = await getSessionId(c.req.raw);

    if (session === undefined) {
      return c.json({ errors: [] }, 401);
    }

    c.set("sessionId", session);

    return next();
  };
}
