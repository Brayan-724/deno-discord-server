import { DbRepo } from "kv-orm/mod.ts";

import { MessageEntity } from "./db/Message.ts";
import { ProfileEntity } from "./db/Profile.ts";
import { UserEntity } from "./db/User.ts";
import { SessionEntity } from "./db/Session.ts";

const kv = await Deno.openKv();

export default {
  messages: new DbRepo(kv, MessageEntity),
  users: new DbRepo(kv, UserEntity),
  sessions: new DbRepo(kv, SessionEntity),
  profiles: new DbRepo(kv, ProfileEntity),
};
