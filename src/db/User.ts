import { z } from "zod/mod.ts";
import { createDbEntity } from "./utils.ts";

export type User = z.infer<typeof UserSchema>;

export const UserSchema = createDbEntity("users", {
  name: z.string().describe("unique"),
  description: z.string(),
});
