import { z } from "zod/mod.ts";
import { createDbEntity } from "./utils.ts";

export type Message = z.infer<typeof MessageSchema>;

export const MessageSchema = createDbEntity("messages", {
  content: z.string().max(2048),
});
