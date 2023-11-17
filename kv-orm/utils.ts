// deno-lint-ignore-file ban-types
import { z } from "zod/mod.ts";

const dbZodEntity = {
  id: z.string().uuid(),
  createdAt: z.date(),
};

export type DbDefaultEntityKeys = keyof typeof dbZodEntity;

const s_optionalEntity = Symbol.for("kv-orm-entity-optional");
export type DbEntityOptional<
  T extends object = {},
  R extends DbEntityRelations = {},
  E extends DbEntity<T, R> = DbEntity<T, R>,
> = E & { [s_optionalEntity]: typeof s_optionalEntity };

export type DbEntityRelations = {
  [k: string]: DbEntity | DbEntityOptional;
};

export type DbEntityZodRelated<R extends DbEntityRelations> = {
  [K in keyof R as K extends string ? `${K}Id` : never]: R[K] extends
    DbEntityOptional ? z.ZodOptional<z.ZodString> : z.ZodString;
};

export type DbEntityRelated<R extends DbEntityRelations> = {
  [K in keyof R as K extends string ? `${K}Id` : never]: R[K] extends
    DbEntityOptional ? string | undefined : string;
};

export interface DbEntity<
  T extends object = {},
  R extends DbEntityRelations = {},
> {
  prefix: string;
  schema: z.ZodObject<
    T & typeof dbZodEntity & DbEntityZodRelated<R>,
    "strict",
    z.ZodTypeAny
  >;
  readonly relations: R;

  optional(): DbEntityOptional<T, R>;
}
export const createDbEntity = <
  T extends z.ZodRawShape,
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
        ) => [
          `${key}Id`,
          isOptional(relations[key])
            ? z.string().uuid().optional()
            : z.string().uuid(),
        ]),
      ) as DbEntityZodRelated<R>,
    })
    .strict(),
  optional() {
    return {
      ...this,
      [s_optionalEntity]: s_optionalEntity,
    };
  },
});

export function isOptional<T extends object, R extends DbEntityRelations>(
  entity: DbEntity<T, R> | DbEntityOptional<T, R>,
): entity is DbEntityOptional<T, R> {
  return (entity as DbEntityOptional<T, R>)[s_optionalEntity] === s_optionalEntity;
}

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
