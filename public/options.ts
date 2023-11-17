const defaultAvatars: Record<string, string> = {
  blue:
    "https://cdn.discordapp.com/attachments/654503812593090602/665721745466195978/blue.png",
  gray:
    "https://cdn.discordapp.com/attachments/654503812593090602/665721746569166849/gray.png",
  green:
    "https://cdn.discordapp.com/attachments/654503812593090602/665721748431306753/green.png",
  orange:
    "https://cdn.discordapp.com/attachments/654503812593090602/665721750201434138/orange.png",
  red:
    "https://cdn.discordapp.com/attachments/654503812593090602/665721752277483540/red.png",
};

// FIXME: Remind Update This
export type Profile = {
  avatar: string;
  name: string;
  role: "admin" | "moderator" | "guest";
  id: string;
  createdAt: Date;
  userId: string;
};

const profile_cache = new Map<string, Profile>();

export async function get_profile(profile_id: string) {
  if (profile_cache.has(profile_id)) {
    return profile_cache.get(profile_id)!;
  } else {
    const res = await fetch("/api/profile/" + profile_id);
    const data = await res.json();
    if (data.done) {
      profile_cache.set(profile_id, data.data);
      return data.data;
    }

    throw new Error(data.data);
  }
}
