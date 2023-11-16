const ws_url = new URL("/ws", location.href);
ws_url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(ws_url);

const chat_container = document.getElementById("chat");
if (!chat_container) throw new Error("Malformed HTML. Needs #chat");

const input_container = document.getElementById(
  "chat-input",
) as HTMLInputElement;
if (!input_container) throw new Error("Malformed HTML. Needs #chat");

ws.onmessage = (event) => {
  console.log(event);
  const messageElement = document.createElement("dds-message");
  messageElement.timestamp = "01/05/2023";
  messageElement.append(event.data);
  chat_container.appendChild(messageElement);
  setTimeout(
    () => chat_container.scrollTo(0, chat_container.scrollHeight + 999),
    0,
  );
};

input_container.addEventListener("keydown", (ev) => {
  if (ev.code === "Enter" && input_container.value.trim() !== "") {
    ws.send(input_container.value.trim());
    input_container.value = "";
    chat_container.scrollTo(0, chat_container.scrollHeight);
  }
});
