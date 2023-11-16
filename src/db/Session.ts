import { z } from "zod/mod.ts";
import { createDbEntity, createUnique } from "kv-orm/mod.ts";
import { UserEntity } from "./User.ts";

export type Session = z.infer<typeof SessionEntity["schema"]>;

export const SessionEntity = createDbEntity("sessions", {
  session_id: createUnique(z.string().uuid()),
  auth_id: z.string(),
}, {
  user: UserEntity,
});
