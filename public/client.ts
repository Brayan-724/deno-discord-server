const chat_container = document.getElementById("chat") as HTMLElement;
if (!chat_container) throw new Error("Malformed HTML. Needs #chat");

const input_container = document.getElementById(
  "chat-input",
) as HTMLInputElement;
if (!input_container) throw new Error("Malformed HTML. Needs #chat");

const ws_url = new URL("/ws", location.href);
ws_url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(ws_url);
let ws_id: string | null = null;

declare global {
  interface Window {
    is_logged: boolean;
  }
}

fetch("/api/messages").then((res) => res.json()).then((messages) => {
  for (const message of messages) {
    appendMessage(
      message.profileId,
      (+(new Date(message.createdAt))).toString(),
      message.content,
    );
  }
});

ws.onopen = () => {
  if (!window.is_logged) {
    const name = prompt(
      "You are not logged in. Write your username: (Leave empty to Log in)",
    );
    if (name == null) {
      location.pathname = "/api/oauth/signin";
    }
    ws.send("name\0" + name);
  }
};

ws.onmessage = (event) => {
  const [topic, ...data] = event.data.split("\0");
  if (topic === "id") {
    ws_id = data;
  } else if (topic === "msg") {
    appendMessage(...data);
  }
};

input_container.addEventListener("keydown", (ev) => {
  const message = input_container.value.trim();
  const isEmpty = message === "";
  const maySendMessage = !ev.shiftKey && ev.code === "Enter";
  if (maySendMessage && !isEmpty) {
    ev.preventDefault();
    ws.send("msg\0" + message);
    input_container.value = "";
    chat_container.scrollTo(0, chat_container.scrollHeight);
  }
});

function appendMessage(...data: string[]) {
  const authorId = data[0];
  const date = new Date(parseInt(data[1], 10));
  const message = data[2];

  const messageElement = document.createElement("dds-message");
  messageElement.author = authorId;
  messageElement.timestamp = date;
  messageElement.append(message);
  chat_container.appendChild(messageElement);
  setTimeout(
    () => chat_container.scrollTo(0, chat_container.scrollHeight + 999),
    0,
  );
}
