import { createDbEntity } from "kv-orm/mod.ts";
import { UserEntity } from "./User.ts";
import { z } from "zod/mod.ts";

export const ProfileRole = z.enum(["admin", "moderator", "guest"]);
export type ProfileRole = z.infer<typeof ProfileRole>;

export type Profile = z.infer<typeof ProfileEntity["schema"]>;

export const ProfileEntity = createDbEntity("profiles", {
  avatar: z.string().url(),
  name: z.string(),
  role: ProfileRole,
}, {
  user: UserEntity.optional(),
});

export const defaultProfileAvatars = [
  "https://cdn.discordapp.com/attachments/654503812593090602/665721745466195978/blue.png",
  "https://cdn.discordapp.com/attachments/654503812593090602/665721746569166849/gray.png",
  "https://cdn.discordapp.com/attachments/654503812593090602/665721748431306753/green.png",
  "https://cdn.discordapp.com/attachments/654503812593090602/665721750201434138/orange.png",
  "https://cdn.discordapp.com/attachments/654503812593090602/665721752277483540/red.png",
];

export function getRandomAvatar(): string {
  return defaultProfileAvatars[
    Math.random() * defaultProfileAvatars.length | 0
  ] ?? defaultProfileAvatars[0];
}
