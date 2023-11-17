const use_remote = false;
const remote_id = "9153f6c0-6f97-410b-98bd-dfd87590e694";

const url = use_remote
  ? `https://api.deno.com/databases/${remote_id}/connect`
  : undefined;

const kv = await Deno.openKv(url);

for await (const l of kv.list({ prefix: [] })) {
  console.log(l.key);
  await kv.delete(l.key);
}
