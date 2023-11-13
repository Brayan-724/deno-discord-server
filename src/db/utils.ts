import { z } from "zod/mod.ts";

const dbZodEntity = {
  id: z.string().uuid(),
  createdAt: z.date(),
};

export type DbDefaultEntityKeys = keyof typeof dbZodEntity;

export type DbEntityRelations = {
  [k: string]: DbEntity | [DbEntity, remoteId: string];
};

export type DbEntityZodRelated<R extends DbEntityRelations> = {
  [K in keyof R as K extends string ? `${K}Id` : never]: z.ZodString;
};

export type DbEntityRelated<R extends DbEntityRelations> = {
  [K in keyof R as K extends string ? `${K}Id` : never]: string;
};

export interface DbEntity<
  // deno-lint-ignore ban-types
  T extends object = {},
  // deno-lint-ignore ban-types
  R extends DbEntityRelations = {},
> {
  prefix: string;
  schema: z.ZodObject<
    T & typeof dbZodEntity & DbEntityZodRelated<R>,
    "strict",
    z.ZodTypeAny
  >;
  relations: R;
}
export const createDbEntity = <
  T extends z.ZodRawShape,
  // deno-lint-ignore ban-types
  R extends DbEntityRelations = {},
>(
  prefix: string,
  def: T,
  relations: R = {} as R,
): DbEntity<T, R> => ({
  prefix,
  relations,
  schema: z
    .object({
      ...def,
      ...dbZodEntity,
      ...Object.fromEntries(
        Object.entries(relations).map((
          [key],
        ) => [`${key}Id`, z.string().uuid()]),
      ) as DbEntityZodRelated<R>,
    })
    .strict(),
});

export function createUnique<T extends z.ZodTypeAny>(
  t: T,
): z.ZodBranded<T, "unique"> {
  return createTag(t, "unique");
}

export function createTag<T extends z.ZodTypeAny, B extends string>(
  t: T,
  b: B,
): z.ZodBranded<T, B> {
  return t.describe(b).brand(b);
}
