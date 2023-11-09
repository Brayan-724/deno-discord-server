import { z } from "zod/mod.ts";
import { red } from "std/fmt/colors.ts";
import { DbZodEntity } from "./utils.ts";

/// https://github.com/sindresorhus/type-fest/blob/main/source/simplify.d.ts
// deno-lint-ignore ban-types
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

export type DbDescriptionModifier = "unique" | "index";

export type DbWhereSelector<Shape> = {
  readonly [k in keyof Shape]?: Shape[k];
};

export type DbSelect<Shape> = {
  [k in keyof (Shape) | "_default"]?: boolean;
};

export type DbSelectReturn<
  Shape,
  Selector extends DbSelect<Shape>,
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

export class DbRepo<
  Schema extends DbZodEntity,
  Shape extends z.infer<Schema> = z.infer<Schema>,
> {
  readonly prefix: string;

  readonly allIndexed = new Map<string, DbDescriptionModifier>();
  readonly uniqueIndexes = new Set<string>();
  readonly indexed = new Set<string>();

  constructor(readonly kv: Deno.Kv, readonly schema: Schema) {
    const prefix = schema.description;
    if (!prefix) throw new Error("Schema must have description (kv prefix)");

    this.prefix = prefix;

    Object.entries(schema.shape).forEach(([key, type]) => {
      if (type.description === "unique") {
        this.uniqueIndexes.add(key);
        this.allIndexed.set(key, type.description);
      } else if (type.description === "index") {
        this.indexed.add(key);
        this.allIndexed.set(key, type.description);
      }
    });
  }

  #createPrefix(subprefix: string): string {
    return `${this.prefix}_by_${subprefix}`;
  }

  async create(data: Omit<Shape, "createdAt">) {
    const parsed = this.schema.omit({ "createdAt": true }).safeParse(data);
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
      createdAt: new Date(),
    };

    for (const key of this.uniqueIndexes.values()) {
      const prefix = this.#createPrefix(key);
      const keyValue = `${data[key as Exclude<keyof Shape, "createdAt">]}`;

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
      const keyValue = `${data[key as Exclude<keyof Shape, "createdAt">]}`;
      await this.kv.set([prefix, keyValue, data.id], dbData);
    }

    await this.kv.set([this.prefix, data.id], dbData);
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

  // await delete
  //

  async *_where(selector: DbWhereSelector<Shape>) {
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

    let possibleValues: Deno.KvEntry<Shape>[] = [];

    if (prefixPriority === 3 && indexValue) {
      const value = await this.kv.get<Shape>([prefix, indexValue]);
      if (value.value === null) return [];
      possibleValues = [value as Deno.KvEntry<Shape>];
    } else if (prefixPriority === 2 && indexValue) {
      const value = await this.kv.get<Shape>([prefix, indexValue]);
      if (value.value === null) return [];
      possibleValues = [value as Deno.KvEntry<Shape>];
    } else if (prefixPriority === 1 && indexValue) {
      const values = this.kv.list<Shape>({ prefix: [prefix, indexValue] });
      for await (const entry of values) {
        possibleValues.push(entry);
      }
    } else {
      const values = this.kv.list<Shape>({ prefix: [this.prefix] });
      for await (const entry of values) {
        possibleValues.push(entry);
      }
    }

    next_value: for (const value of possibleValues) {
      for (const [key, spec] of Object.entries(selector)) {
        if (value.value[key as keyof Shape] !== spec) {
          continue next_value;
        }
      }

      yield value.value;
    }
  }

  _select<T extends DbSelect<Shape>>(
    data: Shape,
    selector: T,
  ): DbSelectReturn<Shape, T> {
    const _default = selector._default ??
      !Object.values(selector).every((v) => v === true);

    return Object.fromEntries(
      Object.entries(data).filter(([key]) => {
        const selected = selector[key as keyof T] ?? _default;
        return selected;
      }),
      // deno-lint-ignore no-explicit-any
    ) as any;
  }
}
