// deno-lint-ignore-file ban-types
import z from "zod/index.ts";
import type {
  DbDefaultEntityKeys,
  DbEntity,
  DbEntityRelations,
} from "./utils.ts";

export type DbDescriptionModifier = "unique" | "index";

type RemoveBrand<T> = Omit<T, symbol>;
type RemoveBrandObject<T> = { [k in keyof T]: Omit<T[k], symbol> };

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};
/// https://github.com/sindresorhus/type-fest/blob/main/source/require-exactly-one.d.ts
type RequireExactlyOne<
  ObjectType,
  KeysType extends keyof ObjectType = keyof ObjectType,
> =
  & {
    [Key in KeysType]: (
      & Required<Pick<ObjectType, Key>>
      & Partial<Record<Exclude<KeysType, Key>, never>>
    );
  }[KeysType]
  & Omit<ObjectType, KeysType>;

export type BooleanSwitcher<V, Truthy, Falsy, Other> = V extends true ? Truthy
  : V extends false ? Falsy
  : V extends boolean ? Truthy | Falsy
  : Other;

/////// SPECIFIERS

export type DbCreateSpecifier<Shape> = {
  [K in keyof Shape as K extends DbDefaultEntityKeys ? never : K]: RemoveBrand<
    Shape[K]
  >;
};

export type DbFindManySpecifier<
  Entity extends DbEntity,
  Selector extends DbSelector<Entity["schema"]["_output"]>,
  Includer extends DbIncluder<Entity["relations"]>,
> = {
  where?: DbWhereSelector<Entity["schema"]["_output"]>;
  select?: Selector;
  include?: Includer;
};

export type DbUpdateSpecifier<Shape> = {
  where: DbWhereSelector<Shape>;
  data: RemoveBrandObject<Partial<Exclude<Shape, DbDefaultEntityKeys>>>;
};

/////// hasUnique
export type DbUniqueSelector<
  Def extends z.SomeZodObject["_def"],
  Shape extends ReturnType<Def["shape"]> = ReturnType<Def["shape"]>,
  UniqueKeys extends {
    // deno-lint-ignore no-explicit-any
    [K in keyof Shape]: Shape[K] extends z.ZodBranded<any, infer B>
      ? B extends DbDescriptionModifier ? K : never
      : never;
  }[keyof Shape] = {
    // deno-lint-ignore no-explicit-any
    [K in keyof Shape]: Shape[K] extends z.ZodBranded<any, infer B>
      ? B extends DbDescriptionModifier ? K : never
      : never;
  }[keyof Shape],
> = Simplify<
  RequireExactlyOne<
    {
      [K in UniqueKeys]: Omit<Shape[K]["_output"], symbol>;
    },
    UniqueKeys
  >
>;

type A = z.ZodObject<{
  name: z.ZodBranded<z.ZodString, "unique">;
  id: z.ZodBranded<z.ZodString, "unique">;
  desc: z.ZodString;
}>["_def"];
type B = DbUniqueSelector<A>;

/////// _where
export type DbWhereSelector<Shape> = {
  readonly [k in keyof Shape]?: RemoveBrand<Shape[k]>;
};

/////// _select

export type DbSelector<Shape> = {
  [k in keyof (Shape) | "_default"]?: boolean;
};

export type DbSelectReturn<
  Shape,
  Selector extends DbSelector<Shape>,
  /// If there's the "_default" prop then prioritize it
  Default = Selector["_default"] extends true ? true
    : Selector["_default"] extends false ? false
    /// else, if there're only truthy then disapear any other
    : Selector[keyof Selector] extends true ? false
    : true,
> = {
  [
    K in keyof Shape as Selector[K] extends true ? K
      : Selector[K] extends false ? never
      : Selector[K] extends boolean ? K
      : Default extends true ? K
      : never
  ]: Selector[K] extends true ? Shape[K]
    : Selector[K] extends boolean ? Shape[K] | undefined
    : Shape[K];
};

/////// _include

export type DbRelationResolve<Relation extends DbEntityRelations[string]> =
  Relation extends [infer Entity, infer PrimaryKey] ? [Entity, PrimaryKey]
    : [Relation, "id"];

export type DbRelationEntity<Relation extends DbEntityRelations[string]> =
  DbRelationResolve<Relation>[0];

export type DbIncludeItem<Entity extends DbEntity> = {
  select?: DbSelector<Entity["schema"]["_output"]>;
  include?: DbIncluder<Entity["relations"]>;
};
export type DbIncluder<Relations extends DbEntityRelations> =
  | boolean
  | {
    [K in keyof Relations]?:
      | boolean
      | DbIncludeItem<DbRelationEntity<Relations[K]>>;
  };

type Incl<
  Relations extends DbEntityRelations,
  Includers extends DbIncluder<Relations>,
  K extends keyof Relations & keyof Includers,
  Includer extends Includers[K] = Includers[K],
  Entity extends DbRelationEntity<Relations[K]> = DbRelationEntity<
    Relations[K]
  >,
> = BooleanSwitcher<
  Includer,
  {},
  never,
  & (Includer extends Pick<DbIncludeItem<Entity>, "select"> ? DbSelectReturn<
      Entity["schema"]["_output"],
      NonNullable<Includer["select"]>
    >
    : Entity["schema"]["_output"])
  & (Includer extends Pick<DbIncludeItem<Entity>, "include">
    ? DbIncludeReturn<Entity["relations"], NonNullable<Includer["include"]>>
    : {})
  & {}
>;

export type DbIncludeReturn<
  Relations extends DbEntityRelations,
  Includer extends DbIncluder<Relations>,
> = BooleanSwitcher<
  Includer,
  {
    [K in keyof Relations]: DbRelationEntity<Relations[K]>["schema"]["_output"];
  },
  {},
  {
    [
      K in keyof Relations & keyof Includer as Includer[K] extends false ? never
        : Includer[K] extends boolean ? K
        : Includer[K] extends object ? K
        : never
    ]: Incl<Relations, Includer, K, Includer[K]>;
  }
>;
