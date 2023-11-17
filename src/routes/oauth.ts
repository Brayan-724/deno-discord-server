import { Hono } from "hono/mod.ts";
import {
  createGitHubOAuthConfig,
  handleCallback,
  signIn,
  signOut,
} from "deno_kv_auth/mod.ts";

import db from "../db.ts";
// @deno-types="https://esm.sh/v133/@octokit/graphql@7.0.2/dist-types/index.d.ts"
import { graphql } from "octokit";

type graphql =
  import("esm.sh/v133/@octokit/graphql@7.0.2/dist-types/types.d.ts").graphql;

const oauthConfig = createGitHubOAuthConfig({
  redirectUri: Deno.env.get("HOST") + "/api/oauth/callback",
});

const router = new Hono();

router.use("/signin", async (c) => {
  return await signIn(c.req.raw, oauthConfig);
});

router.use("/signout", async (c) => {
  return await signOut(c.req.raw);
});

router.use("/callback", async (c) => {
  try {
    const a = await handleCallback(c.req.raw, oauthConfig);

    const octokit = graphql.defaults({
      headers: {
        authorization: "bearer " + a.tokens.accessToken,
      },
    });
    type Response = {
      viewer: {
        id: string;
        avatarUrl: string;
        name: string;
        status: {
          message: string;
        };
      };
    };

    const userInfo: Response = await octokit(`{
        viewer {
          id
          avatarUrl(size: 72)
          name
          status {
            message
          }
        }
      }`);
    console.log("User logged: ", userInfo.viewer.name);

    const oldUser = await db.users.findFirst({
      where: { "name": userInfo.viewer.name },
    });

    if (oldUser) {
      console.log("Already exists");

      await db.sessions.create({
        session_id: a.sessionId,
        auth_id: userInfo.viewer.id,
        userId: oldUser.id,
      });
    } else {
      const userId = await db.users.create({
        avatar: userInfo.viewer.avatarUrl,
        name: userInfo.viewer.name,
        description: userInfo.viewer?.status?.message,
        authMethod: "github",
        auth_id: userInfo.viewer.id,
      });

      await db.sessions.create({
        session_id: a.sessionId,
        auth_id: userInfo.viewer.id,
        userId,
      });
    }
    return a.response;
  } catch (e) {
    console.error(e);
    return Response.redirect("/api/oauth/signin", 500);
  }
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
