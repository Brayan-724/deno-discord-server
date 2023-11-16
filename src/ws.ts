import { Hono } from "hono/mod.ts";

const wsRouter = new Hono();

const broadcastChannel = new BroadcastChannel("ws");

const sockets = new Set<WebSocket>();

broadcastChannel.addEventListener("message", (ev) => {
  sockets.forEach((socket) => socket.send(ev.data));
});

wsRouter.get("/", (c: DDSHonoContext) => {
  const req = c.req.raw;

  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 501 });
  }
  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.addEventListener("open", () => {
    console.log("a client connected!");
    sockets.add(socket);
  });
  socket.addEventListener("message", (event) => {
    sockets.forEach((socket) => socket.send(event.data));
    broadcastChannel.postMessage(event.data);
  });
  socket.addEventListener("close", () => {
    sockets.delete(socket);
  });
  return response;
});

export default wsRouter;
