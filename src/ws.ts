import { Hono } from "hono/mod.ts";
import db from "./db.ts";
import { getSessionId } from "deno_kv_auth/mod.ts";
import { getRandomAvatar } from "./db/Profile.ts";

const wsRouter = new Hono();

const broadcastChannel = new BroadcastChannel("ws");

const profileSockets = new Map<string, Set<WebSocket>>();

broadcastChannel.addEventListener("message", (ev) => broadcastMessage(ev.data));

function broadcastMessage(data: string) {
  for (const sockets of profileSockets.values()) {
    for (const socket of sockets) {
      socket.send(data);
    }
  }
}

wsRouter.get("/", async (c: DDSHonoContext) => {
  const req = c.req.raw;

  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 501 });
  }
  const sessionId = await getSessionId(req);

  const user = sessionId
    ? (await db.sessions.findFirst({
      where: { session_id: sessionId },
      include: true,
    }))?.user || null
    : null;

  let socketId: string = user
    ? (await db.profiles.findFirst({ where: { userId: user.id } }))?.id ??
      (await db.profiles.create({
        avatar: user.avatar ?? getRandomAvatar(),
        name: user.name,
        role: "guest",
        userId: user.id,
      })) as string
    : (await db.profiles.findFirst({ where: { name: "Anonymous" } }))?.id ??
      (await db.profiles.create({
        avatar: getRandomAvatar(),
        name: "Anonymous",
        role: "guest",
        userId: undefined,
      })) as string;

  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.addEventListener("error", () => {
    console.log("something wrong with ws!");
  });
  socket.addEventListener("open", () => {
    console.log("A client connected! " + socketId);
    socket.send("id\0" + socketId);
    const sockets = profileSockets.get(socketId) ?? new Set();
    sockets.add(socket);
    profileSockets.set(socketId, sockets);
  });
  socket.addEventListener("message", async (event) => {
    const [topic, data] = event.data.split("\0");
    if (topic === "msg") {
      const message = `msg\0${socketId}\0${Date.now()}\0${data}`;
      broadcastMessage(message);
      broadcastChannel.postMessage(message);

      db.messages.create({
        content: data,
        socketId,
        userId: user?.id,
      });
    } else if (topic === "name") {
      profileSockets.get(socketId)?.delete(socket);

      socketId = (await db.profiles.findFirst({ where: { name: data } }))?.id ??
        (await db.profiles.create({
          avatar: getRandomAvatar(),
          name: data,
          role: "guest",
          userId: undefined,
        })) as string;

      const sockets = profileSockets.get(socketId) ?? new Set();
      sockets.add(socket);
      profileSockets.set(socketId, sockets);
    }
  });
  socket.addEventListener("close", () => {
    profileSockets.get(socketId)?.delete(socket);
  });

  return response;
});

export default wsRouter;
