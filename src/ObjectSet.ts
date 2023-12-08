import { ObjectMap, ObjectMapOptions } from './ObjectMap';

/**
 * A set-like object, as per the [mozilla docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#set-like_objects)
 */
export interface SetLike<T> {
  size: number;
  has(value: T): boolean;
  keys(): IterableIterator<T>;
}

/**
 * A Set data structure that compares members by value rather than by reference.
 * Compliant with the ES6 Set interface.
 * @see https://github.com/nitzanhen/objectmap.js
 */
export class ObjectSet<T> implements Set<T> {
  protected _map: ObjectMap<T, T>;

  /**
   * @param iterable an iterable; used to initialize the map.
   * If this is an `ObjectSet`, this constructor will create a copy.
   * @param options constructor options.
   */
  constructor(iterable?: Iterable<T>, options: ObjectMapOptions = {}) {
    this._map = new ObjectMap(
      iterable instanceof ObjectSet ? iterable._map : toMapIterable(iterable),
      options
    );
  }

  get size(): number {
    return this._map.size;
  }

  add(value: T): this {
    this._map.set(value, value);
    return this;
  }

  has(value: T): boolean {
    return this._map.has(value);
  }

  delete(value: T): boolean {
    return this._map.delete(value)
  }

  clear(): void {
    this._map.clear();
  }

  *entries(): IterableIterator<[T, T]> {
    yield* this._map.entries();
  }

  *keys(): IterableIterator<T> {
    yield* this._map.keys();
  }

  *values(): IterableIterator<T> {
    yield* this._map.values();
  }
  [Symbol.iterator] = this.values;

  forEach(callbackfn: (value: T, key: T, set: ObjectSet<T>) => void, thisArg?: any): void {
    this._map.forEach((v, k) => callbackfn(v, k, this), thisArg);
  }

  get [Symbol.toStringTag]() {
    return 'ObjectSet';
  }

  /**
   * Creates a clone of the set; does not create a deep copy of the members.
   * `set.clone()` is equivalent to `new ObjectSet(set)`.
   */
  clone(): ObjectSet<T> {
    return new ObjectSet(this);
  }

  /**
   * @returns a set with the same options as this but no keys or values.
   */
  emptyClone<S = T>(): ObjectSet<S> {
    return new ObjectSet<S>(undefined, {
      initialCapacity: this.size,
      ...this._map.options
    });
  }

  /**
   * @returns a new set containing only the members that satisfy the predicate.
   * Retains the same options as the original set.
   */
  filter(predicate: (value: T) => boolean): ObjectSet<T> {
    const set = this.emptyClone();
    set._map = this._map.filter((_, k) => predicate(k));
    return set;
  }

  /**
   * Returns a new set containing the results of calling `transform` on each member.
   */
  map<S>(transform: (value: T) => S): ObjectSet<S> {
    const set = this.emptyClone<S>();
    for (const value of this.values()) {
      set.add(transform(value));
    }
    return set;
  }

  /**
   * Calls `reducer` for each member, accumulating the results into a single value.
   */
  reduce<A>(reducer: (accumulator: A, value: T) => A, initialValue: A): A {
    return this._map.reduce(reducer, initialValue);
  }

  /**
   * Returns `true` if the set contains a member that satisfies the predicate,
   * and `false` otherwise.
   */
  some(predicate: (value: T) => boolean): boolean {
    for (const value of this.values()) {
      if (predicate(value)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns `true` if every member in the set satisfies the predicate,
   * and `false` otherwise.
   */
  every(predicate: (value: T) => boolean): boolean {
    for (const value of this.values()) {
      if (!predicate(value)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Sorts the set in-place using the provided compare function.
   * uses `Array.prototype.sort` under the hood.
   */
  sort(compareFn?: (a: T, b: T) => number): this {
    this._map.sort(compareFn && (([a], [b]) => compareFn(a, b)));
    return this;
  }

  /**
   * @returns `true` if the set is empty (of size `0`), and `false` otherwise.
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * @returns `true` if this set and the other set are equal;
   * equality here is defined as having exactly the same members.
   * Equality of members is tested using the `equals` function provided in the constructor options.
   */
  equals(other: ObjectSet<T>): boolean {
    return this._map.equals(other._map);
  }

  // Set operation methods; compliant with the corresponding experimental apis

  /**
   * Returns a new set containing exactly the members that are both in this set and in `other`.
   */
  intersection(other: SetLike<T>): ObjectSet<T> {
    return this.filter(value => other.has(value));
  }

  /**
   * Returns a new set containing exactly the members that are either in this set, in `other` or both.
   */
  union(other: SetLike<T>): ObjectSet<T> {
    const set = this.clone();
    for (const value of other.keys()) {
      set.add(value);
    }
    return set;
  }

  /**
   * Returns a new set containing exactly the members that are in this set but not in `other`.
   */
  difference(other: SetLike<T>): ObjectSet<T> {
    return this.filter(value => !other.has(value));
  }

  /**
   * Returns a new set containing exactly the members that are in this set or in `other`, but not in both.
   */
  symmetricDifference(other: SetLike<T>): ObjectSet<T> {
    const set = this.clone();
    for (const value of other.keys()) {
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
    }
    return set;
  }

  /**
   * Returns `true` if every element in this set is also in `other`, and `false` otherwise.
   */
  isSubsetOf(other: SetLike<T>): boolean {
    return this.every(value => other.has(value));
  }

  /**
   * Returns `true` if this set contains every element in `other`, and `false` otherwise.
   */
  isSupersetOf(other: SetLike<T>): boolean {
    for (const value of other.keys()) {
      if (!this.has(value)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns `true` if this set and `other` have no members in common, and `false` otherwise.
   */
  isDisjointFrom(other: SetLike<T>): boolean {
    return !this.some(value => other.has(value));
  }

  /**
   * Creates an `ObjectSet` from the keys of a `Map` (possibly an `ObjectMap`) or an object.
   */
  static keysOf = keysOf;

  /**
   * Creates an `ObjectSet` from the values of a `Map` (possibly an `ObjectMap`) or an object.
   */
  static valuesOf = valuesOf;
}

/**
 * Turns a "set" iterator to a "map" iterator by doubling each value into a tuple.
 */
function* toMapIterable<T>(iterable?: Iterable<T>): Iterable<[T, T]> {
  if (!iterable) {
    return undefined;
  }
  for (const value of iterable) {
    yield [value, value];
  }
}

function keysOf<K>(map: Map<K, unknown>): ObjectSet<K>;
function keysOf<K extends string | number | symbol>(obj: Record<K, unknown>): ObjectSet<K>;
function keysOf(obj: Map<unknown, unknown> | Record<string | number | symbol, unknown>): ObjectSet<unknown> {
  if ('keys' in obj && typeof obj.keys === 'function') {
    return new ObjectSet(obj.keys());
  }
  return new ObjectSet(Object.keys(obj));
}

function valuesOf<V>(map: Map<unknown, V>): ObjectSet<V>;
function valuesOf<V>(obj: Record<any, V>): ObjectSet<V>;
function valuesOf(obj: Map<unknown, unknown> | Record<any, unknown>): ObjectSet<unknown> {
  if ('values' in obj && typeof obj.values === 'function') {
    return new ObjectSet(obj.values());
  }
  return new ObjectSet(Object.values(obj));
}