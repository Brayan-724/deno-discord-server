import { z } from "zod/mod.ts";
import { red } from "std/fmt/colors.ts";
import type { DbEntity } from "./utils.ts";
import type {
  DbCreateSpecifier,
  DbDescriptionModifier,
  DbFindManySpecifier,
  DbIncludeItem,
  DbIncluder,
  DbIncludeReturn,
  DbSelector,
  DbSelectReturn,
  DbUniqueSelector,
  DbUpdateSpecifier,
  DbWhereSelector,
  Simplify,
} from "./types.d.ts";
import { iter } from "../iter.ts";

export class DbRepo<
  Entity extends DbEntity,
  Schema extends Entity["schema"] = Entity["schema"],
  Shape extends Schema["_output"] = z.infer<Schema>,
  Relations extends Entity["relations"] = Entity["relations"],
> {
  readonly schema: Schema;
  readonly prefix: string;

  readonly allIndexed = new Map<string, DbDescriptionModifier>();
  readonly uniqueIndexes = new Set<string>();
  readonly indexed = new Set<string>();

  constructor(readonly kv: Deno.Kv, readonly entity: Entity) {
    this.prefix = entity.prefix;
    this.schema = entity.schema as Schema;

    Object.entries(this.schema.shape).forEach(([key, type]) => {
      if (type.description === "unique") {
        this.uniqueIndexes.add(key);
        this.allIndexed.set(key, type.description);
      } else if (type.description === "index") {
        this.indexed.add(key);
        this.allIndexed.set(key, type.description);
      }
    });
  }

  #createPrefix(subprefix: unknown): string {
    return `${this.prefix}_by_${subprefix}`;
  }

  async *listAll(options?: Deno.KvListOptions) {
    const listed = this.kv.list({ prefix: [this.prefix] }, options);
    for await (const entry of listed) {
      yield entry;
    }

    for (const key of this.allIndexed.keys()) {
      const prefix = this.#createPrefix(key);

      const listed = this.kv.list({ prefix: [prefix] }, options);
      for await (const entry of listed) {
        yield entry;
      }
    }
  }

  async deleteAll() {
    for await (const key of this.listAll()) {
      this.kv.delete(key.key);
    }
  }

  /////////////////////////////////////////////
  /////////                           /////////
  /////////            ORM            /////////
  /////////                           /////////
  /////////////////////////////////////////////

  async hasUnique(
    where: DbUniqueSelector<Entity["schema"]["_def"]>,
  ): Promise<boolean> {
    const [key, spec] = Object.entries(where)[0]!;
    const exists = this.uniqueIndexes.has(key);

    if (!exists) {
      console.warn("Trying access to non-unique key in unique searcher.");
      return false;
    }

    const k = this.#createPrefix(key);
    const a = await this.kv.get([k, `${spec}`]);
    return a.value !== null;
  }

  async create(data: DbCreateSpecifier<Shape>): Promise<string> {
    const parsed = this.schema.omit({ "id": true, "createdAt": true })
      .safeParse(data);
    if (!parsed.success) {
      let errorMessage = "Invalid properties for " + this.prefix + "\n";

      for (const error of parsed.error.errors) {
        switch (error.code) {
          case z.ZodIssueCode.unrecognized_keys:
            errorMessage += "  " + error.message + "\n";
            break;

          default: {
            const path = error.path.join(".");
            errorMessage += `  "${path}": ${error.message}\n`;
            break;
          }
        }
      }

      throw new Error(red(errorMessage));
    }

    const dbData = {
      ...parsed.data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    } as Shape;

    for (const key of this.uniqueIndexes.values()) {
      const prefix = this.#createPrefix(key);
      const keyValue = `${dbData[key as keyof Shape]}`;

      const maybeValue = await this.kv.get([prefix, keyValue]);

      if (maybeValue.value) {
        throw new Error(
          `Conflict creating data for ${this.prefix}. \`${key}\` must be unique. `,
        );
      }

      await this.kv.set([prefix, keyValue], dbData);
    }

    for (const key of this.indexed.keys()) {
      const prefix = this.#createPrefix(key);
      const keyValue = `${dbData[key as keyof Shape]}`;
      await this.kv.set([prefix, keyValue, dbData.id], dbData);
    }

    await this.kv.set([this.prefix, dbData.id], dbData);

    return dbData.id;
  }

  findMany<S extends DbSelector<Shape>, I extends DbIncluder<Relations>>(
    specifier: DbFindManySpecifier<Entity, S, I>,
  ): Promise<
    Simplify<(DbSelectReturn<Shape, S> & DbIncludeReturn<Relations, I>)>[]
  > {
    return iter(this._where((specifier.where ?? {}) as DbWhereSelector<Shape>))
      .map((value) => {
        return this._processEntry(
          value,
          (specifier.select ?? {}) as S,
          (specifier.include ?? {}) as I,
        );
      })
      .await()
      .collect();
  }

  async findFirst<S extends DbSelector<Shape>, I extends DbIncluder<Relations>>(
    specifier: DbFindManySpecifier<Entity, S, I>,
  ): Promise<
    | Simplify<(DbSelectReturn<Shape, S> & DbIncludeReturn<Relations, I>)>
    | undefined
  > {
    const a = await this._where(
      (specifier.where ?? {}) as DbWhereSelector<Shape>,
    ).next();
    if (!a.value) return;
    return this._processEntry(
      a.value as Shape,
      (specifier.select ?? {}) as S,
      (specifier.include ?? {}) as I,
    );
  }

  async updateFirst(specifier: DbUpdateSpecifier<Shape>): Promise<boolean> {
    const parsed = this.schema.omit({ "id": true, "createdAt": true }).partial()
      .safeParse(specifier.data);
    if (!parsed.success) {
      let errorMessage = "Invalid properties for " + this.prefix + "\n";

      for (const error of parsed.error.errors) {
        switch (error.code) {
          case z.ZodIssueCode.unrecognized_keys:
            errorMessage += "  " + error.message + "\n";
            break;

          default: {
            const path = error.path.join(".");
            errorMessage += `  "${path}": ${error.message}\n`;
            break;
          }
        }
      }

      throw new Error(red(errorMessage));
    }

    const old = await this.findFirst({ where: specifier.where }) as Shape;

    if (!old) return false;

    const dbData = {
      ...old,
      ...parsed.data,
    } as Shape;

    const trans = this.kv.atomic();

    for (const _key of this.uniqueIndexes.values()) {
      const key = _key as keyof Shape;
      const prefix = this.#createPrefix(key);
      const keyValue = `${dbData[key]}`;

      if (old[key] !== dbData[key]) {
        trans.delete([prefix, `${old[key]}`]);
      }

      trans.set([prefix, keyValue], dbData);
    }

    for (const _key of this.indexed.keys()) {
      const key = _key as keyof Shape;
      const prefix = this.#createPrefix(key);
      const keyValue = `${dbData[key]}`;

      if (old[key] !== dbData[key]) {
        trans.delete([prefix, `${old[key]}`, old.id]);
      }

      trans.set([prefix, keyValue, dbData.id], dbData);
    }

    trans.set([this.prefix, dbData.id], dbData);

    const result = await trans.commit();
    return result.ok;
  }

  /////////////////////////////////////////////
  /////////                           /////////
  /////////           UTILS           /////////
  /////////                           /////////
  /////////////////////////////////////////////

  async *_where(
    selector: DbWhereSelector<Shape>,
  ): AsyncGenerator<Shape, undefined> {
    let prefix = this.prefix;
    let prefixPriority = 0; // 0: base, 1: indexed, 2: unique, 3: primary
    let indexValue: string | null = null;

    for (const [key, spec] of Object.entries(selector)) {
      if (key === "id") {
        prefix = this.prefix;
        prefixPriority = 3;
        indexValue = spec;
        break;
      }

      const modifier = this.allIndexed.get(key);
      if (prefixPriority < 1 && modifier === "index") {
        prefix = this.prefix + "_by_" + key;
        prefixPriority = 1;
        indexValue = spec;
      } else if (prefixPriority <= 1 && modifier === "unique") {
        prefix = this.prefix + "_by_" + key;
        prefixPriority = 2;
        indexValue = spec;
      }
    }

    let possibleValues: Deno.KvListIterator<Shape> | Deno.KvEntry<Shape>;

    if (prefixPriority === 3 && indexValue) {
      const value = await this.kv.get<Shape>([prefix, indexValue]);
      if (value.value === null) return;
      possibleValues = value as Deno.KvEntry<Shape>;
    } else if (prefixPriority === 2 && indexValue) {
      const value = await this.kv.get<Shape>([prefix, indexValue]);
      if (value.value === null) return;
      possibleValues = value as Deno.KvEntry<Shape>;
    } else if (prefixPriority === 1 && indexValue) {
      possibleValues = this.kv.list<Shape>({ prefix: [prefix, indexValue] });
    } else {
      possibleValues = this.kv.list<Shape>({ prefix: [this.prefix] });
    }

    // Is unique entry
    if ("key" in possibleValues) {
      for (const [key, spec] of Object.entries(selector)) {
        if (possibleValues.value[key as keyof Shape] !== spec) {
          return;
        }
      }
      yield possibleValues.value;
      return;
    }

    next_value: for await (const value of possibleValues) {
      for (const [key, spec] of Object.entries(selector)) {
        if (value.value[key as keyof Shape] !== spec) {
          continue next_value;
        }
      }

      yield value.value;
    }
  }

  _select<T extends DbSelector<Shape>>(
    data: Shape,
    selector: T,
  ): DbSelectReturn<Shape, T> {
    const _default = selector._default ?? Object.keys(selector).length === 0
      ? true
      : !Object.values(selector).every((v) => v === true);

    return Object.fromEntries(
      Object.entries(data).filter(([key]) => {
        const selected = selector[key as keyof T] ?? _default;
        return selected;
      }),
      // deno-lint-ignore no-explicit-any
    ) as any;
  }

  async _include<T extends DbIncluder<Relations>>(
    data: Shape,
    includer: T,
  ): Promise<DbIncludeReturn<Relations, T>> {
    if (includer === false) {
      return {} as DbIncludeReturn<Relations, T>;
    }
    if (includer === true) {
      const entries = [];
      for (
        const [relationKey, relationEntity] of Object.entries<DbEntity>(
          this.entity.relations,
        )
      ) {
        const relatedId = data[`${relationKey}Id` as keyof Shape] as string;
        const related =
          (await this.kv.get([relationEntity.prefix, relatedId])).value;

        entries.push([relationKey, related]);
      }

      return Object.fromEntries(entries);
    }

    const entries = [];
    for (
      const [relationKey, relationEntity] of Object.entries<DbEntity>(
        this.entity.relations,
      )
    ) {
      const relatedValue = includer[relationKey as keyof T];

      if (!relatedValue) continue;

      const relatedId = data[`${relationKey}Id` as keyof Shape] as string;
      const related =
        (await this.kv.get([relationEntity.prefix, relatedId])).value;

      if (relatedValue === true) {
        entries.push([relationKey, related]);
        continue;
      }

      const selector = (relatedValue as DbIncludeItem<DbEntity>).select;
      const includer_ = (relatedValue as DbIncludeItem<DbEntity>).include;

      const value = await this._processEntry(
        related as Shape,
        selector ?? { _default: true },
        includer_ ?? {},
      );

      entries.push([relationKey, value]);
    }

    return Object.fromEntries(entries);
  }

  async _processEntry<
    S extends DbSelector<Shape>,
    I extends DbIncluder<Relations>,
  >(
    data: Shape,
    selector: S,
    includer: I,
  ): Promise<DbSelectReturn<Shape, S> & DbIncludeReturn<Relations, I>> {
    return {
      ...this._select(data, selector),
      ...(await this._include(data, includer)),
    };
  }
}
