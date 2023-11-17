import { z } from "zod/mod.ts";
import { createDbEntity } from "kv-orm/mod.ts";
import { UserEntity } from "./User.ts";
import { ProfileEntity } from "./Profile.ts";

export type Message = z.infer<typeof MessageEntity["schema"]>;

export const MessageEntity = createDbEntity("messages", {
  content: z.string().max(2048),
}, {
  user: UserEntity.optional(),
  profile: ProfileEntity,
});
