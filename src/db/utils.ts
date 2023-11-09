import { z, ZodObject } from "zod/mod.ts";

z.string;

const dbZodEntity = {
  id: z.string().uuid(),
  createdAt: z.date(),
};
export type DbZodEntity = ZodObject<typeof dbZodEntity, "strict">;
export const createDbEntity = <T extends z.ZodRawShape>(
  prefix: string,
  def: T,
) =>
  z
    .object({ ...def, ...dbZodEntity })
    .strict()
    .describe(prefix);

export const takeAsync = async <T>(iter: AsyncGenerator<T>) => {
  const out = [];
  for await (const item of iter) {
    out.push(item);
  }

  return out;
};
