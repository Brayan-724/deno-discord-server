import { MessageEntity } from "./db/Message.ts";
import { SessionEntity } from "./db/Session.ts";
import { UserEntity } from "./db/User.ts";
import { DbRepo } from "./db/factory.ts";

const kv = await Deno.openKv();

const db = {
  messages: new DbRepo(kv, MessageEntity),
  users: new DbRepo(kv, UserEntity),
  sessions: new DbRepo(kv, SessionEntity),
};

export default db;
