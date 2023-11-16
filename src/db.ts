import { DbRepo } from "kv-orm/mod.ts";

import { MessageEntity } from "./db/Message.ts";
import { SessionEntity } from "./db/Session.ts";
import { UserEntity } from "./db/User.ts";

const kv = await Deno.openKv();

export default {
  messages: new DbRepo(kv, MessageEntity),
  sessions: new DbRepo(kv, SessionEntity),
  users: new DbRepo(kv, UserEntity),
};
