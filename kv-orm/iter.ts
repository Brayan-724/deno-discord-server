export interface CustomIterator<T> extends Generator<T> {
  /**
   * Await promises to be resolved in the iterator's value.
   *
   * @examples
   * ```typescript
   * iter([1, 2, 3])
   *   .map(async v => v + 1) // CustomIterator<Promise<number>>
   *   .await() // CustomAsyncIterator<number>
   *   .collect(); // -> [2, 3, 4]
   * ```
   */
  await(): CustomAsyncIterator<Awaited<T>>;

  /**
   * Execute all the iterator collecting the output to get an array.
   *
   * @example
   * ```typescript
   * iter([1, 2, 3])
   *   .map(v => v + 1) // CustomIterator<number[]>
   *   .collect(); // -> [2, 3, 4]
   * ```
   */
  collect(): T[];

  /**
   * Execute a function through the iterator and transform its output.
   *
   * @example
   * ```typescript
   * iter([1, 2, 3])
   *   .map(v => v + 1)
   *   .collect(); // -> [2, 3, 4]
   * ```
   */
  map<R>(mapFn: (value: T) => R): CustomIterator<R>;

  /**
   * Limit the output to the first `n` values.
   *
   * @example
   * ```typescript
   * iter([1, 2, 3])
   *   .take(2)
   *   .collect(); // -> [1, 2]
   * ```
   */
  take(n: number): CustomIterator<T>;
}

export interface CustomAsyncIterator<T> extends AsyncGenerator<T> {
  /**
   * Await promises to be resolved in the iterator's value.
   *
   * @examples
   * ```typescript
   * iter([1, 2, 3])
   *   .map(async v => v + 1) // CustomIterator<Promise<number>>
   *   .await() // CustomAsyncIterator<number>
   *   .collect(); // -> [2, 3, 4]
   * ```
   */
  await(): CustomAsyncIterator<Awaited<T>>;

  /**
   * Execute all the iterator collecting the output to get an array.
   *
   * @example
   * ```typescript
   * iter([1, 2, 3])
   *   .map(v => v + 1) // CustomIterator<number[]>
   *   .collect(); // -> [2, 3, 4]
   * ```
   */
  collect(): Promise<T[]>;

  /**
   * Execute a function through the iterator and transform its output.
   *
   * @example
   * ```typescript
   * iter([1, 2, 3])
   *   .map(v => v + 1)
   *   .collect(); // -> [2, 3, 4]
   * ```
   */
  map<R>(mapFn: (value: T) => R): CustomAsyncIterator<R>;

  /**
   * Limit the output to the first `n` values.
   *
   * @example
   * ```typescript
   * iter([1, 2, 3])
   *   .take(2)
   *   .collect(); // -> [1, 2]
   * ```
   */
  take(n: number): CustomAsyncIterator<T>;
}

/**
 * Rust-like iterators transformer.
 *
 * @examples
 * ```typescript
 * const my_values = [1, 2, 3, 4, 5];
 * const new_values = iter(my_values)
 *   .map(async v => v + 1)
 *   .await()
 *   .collect();
 * // -> [2, 3, 4, 5, 6]
 * ```
 *
 * Lazy iterator
 *
 * ```typescript
 * const my_iterator = function *() {
 *   for (let index = 0; index < 10; index++) {
 *     console.log("Running: ", index);
 *     yield index;
 *   }
 * };
 * const new_values = iter(my_iterator())
 *   .map(async v => v + 1)
 *   .await();
 *
 * for (const v of new_values.take(2)) {
 *   console.log(v)
 * }
 * // Running: 0
 * // 0
 * // Running: 1
 * // 1
 * ```
 */
export function iter<T>(i: Iterable<T>): CustomIterator<T>;
export function iter<T>(i: Generator<T>): CustomIterator<T>;
export function iter<T>(i: AsyncIterable<T>): CustomAsyncIterator<T>;
export function iter<T>(i: AsyncGenerator<T>): CustomAsyncIterator<T>;
export function iter<T>(
  i: Iterable<T> | AsyncIterable<T>,
): CustomIterator<T> | CustomAsyncIterator<T> {
  if (Symbol.asyncIterator in i) {
    const custom = i as CustomAsyncIterator<T>;
    custom.map = transformer(async function* (mapFn) {
      for await (const value of i) {
        yield mapFn(value);
      }
    }, iter) as CustomAsyncIterator<T>["map"];
    custom.collect = async function () {
      const out = [];
      for await (const v of i) {
        out.push(v);
      }
      return out;
    };
    custom.await = transformer(async function* () {
      for await (const v of i) {
        yield v;
      }
    }, iter) as CustomAsyncIterator<T>["await"];
    return custom;
  }
  const custom = i as CustomIterator<T>;
  custom.map = transformer<
    [mapFn: (value: T) => unknown],
    Generator<unknown>,
    CustomIterator<T>
  >(function* <R>(mapFn: (value: T) => R): Generator<R> {
    for (const value of i) {
      yield mapFn(value);
    }
  }, iter) as CustomIterator<T>["map"];
  custom.collect = function () {
    const out = [];
    for (const v of i) {
      out.push(v);
    }
    return out;
  };
  custom.await = transformer(async function* () {
    for await (const v of i) {
      yield v;
    }
  }, iter) as CustomIterator<T>["await"];
  return custom;
}

function transformer<A extends unknown[], R, T>(
  fn: (...args: A) => R,
  transform: (value: R) => T,
): (...args: A) => T {
  return (...args: A) => transform(fn(...args));
}
