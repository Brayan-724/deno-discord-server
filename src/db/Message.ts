import { z } from "zod/mod.ts";
import { createDbEntity } from "./utils.ts";
import { UserEntity } from "./User.ts";

export type Message = z.infer<typeof MessageEntity["schema"]>;

export const MessageEntity = createDbEntity("messages", {
  content: z.string().max(2048),
}, {
  user: UserEntity,
});
