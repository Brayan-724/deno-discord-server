import { Hono } from "hono/mod.ts";
import {
  createGitHubOAuthConfig,
  handleCallback,
  signIn,
} from "deno_kv_auth/mod.ts";

import {} from "../oauth/middlewares.ts";

const oauthConfig = createGitHubOAuthConfig({
  redirectUri: Deno.env.get("HOST") + "/api/oauth/callback",
});

const router = new Hono();

router.use("/signin", async (c) => {
  return await signIn(c.req.raw, oauthConfig);
});

router.use("/callback", async (c) => {
  const a = await handleCallback(c.req.raw, oauthConfig);
  console.log(a.sessionId, a.tokens);
  return a.response;
});

export default router;

/**
 switch (pathname) {
    case "/oauth/signin":
      return await signIn(request, oauthConfig);
    case "/oauth/callback":
      const { response } = await handleCallback(request, oauthConfig);
      return response;
    case "/oauth/signout":
      return await signOut(request);
    case "/protected-route":
      return await getSessionId(request) === undefined
        ? new Response("Unauthorized", { status: 401 })
        : new Response("You are allowed");
    default:
      return new Response(null, { status: 404 });
  }
 */
