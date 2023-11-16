import { z } from "zod/mod.ts";
import { createDbEntity, createUnique } from "kv-orm/mod.ts";

export type User = z.infer<typeof UserEntity["schema"]>;

export const UserAuthMethod = z.enum(["github"]);

export const UserEntity = createDbEntity("users", {
  name: createUnique(z.string()),
  authMethod: UserAuthMethod,
  auth_id: createUnique(z.string()),
  description: z.string(),
});
