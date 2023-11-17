import { z } from "zod/mod.ts";
import { createDbEntity } from "kv-orm/mod.ts";
import { UserEntity } from "./User.ts";

export type Socket = z.infer<typeof SocketEntity["schema"]>;

export const SocketEntity = createDbEntity("sockets", {
  name: z.string(),
}, {
  user: UserEntity.optional(),
});
