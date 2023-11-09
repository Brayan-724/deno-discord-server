import { MessageSchema } from "./db/Message.ts";
import { UserSchema } from "./db/User.ts";
import { DbRepo } from "./db/factory.ts";
import { takeAsync } from "./db/utils.ts";

const kv = await Deno.openKv();
await kv.delete(["orders_by_name"]);

const db = {
  messages: new DbRepo(kv, MessageSchema),
  users: new DbRepo(kv, UserSchema),
};

await db.users.deleteAll();
await db.users.create({
  id: crypto.randomUUID(),
  name: "John",
  description: "Some",
});

await db.messages.deleteAll();
await db.messages.create({ id: crypto.randomUUID(), content: "Hello World!" });

const data = await takeAsync(db.users._where({ description: "Some" }));

for (const d of data) {
  const sel = db.users._select(d, { id: true, name: false });
  console.log(sel);
}

export default db;
