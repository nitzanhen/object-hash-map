import { ObjectMapOptions } from './ObjectMap';
import { ObjectSet, SetLike } from './ObjectSet';

/**
 * An immutable Set data structure that compares members by value rather than by reference.
 * @see https://github.com/nitzanhen/objectmap.js
 */
export class ImmutableSet<T> {
  protected _set: ObjectSet<T>;

  /**
   * @param iterable an iterable; used to initialize the map.
   * If this is an `ImmutableSet`, this constructor will create a copy.
   * @param options constructor options.
   */
  constructor(iterable?: Iterable<T>, options: Partial<ObjectMapOptions> = {}) {
    this._set = new ObjectSet(
      iterable instanceof ImmutableSet ? iterable._set : iterable,
      options
    )
  }

  /** @returns — the number of elements in the Set. */
  get size(): number {
    return this._set.size;
  }

  get options(): Omit<ObjectMapOptions, 'initialCapacity'> {
    return this._set.options;
  }

  /**
   * Returns a new set with the given value added as a member.
   */
  add(value: T): ImmutableSet<T> {
    const set = new ObjectSet(this._set);
    set.add(value);
    return new ImmutableSet(set);
  }

  /** Returns `true` if the set contains the given member, and `false` otherwise. */
  has(value: T): boolean {
    return this._set.has(value);
  }

  /** Returns a new set with the given value excluded. */
  delete(value: T): ImmutableSet<T> {
    const set = new ObjectSet(this._set);
    set.delete(value);
    return new ImmutableSet(set);
  }

  /** Returns an empty clone of this set. */
  clear(): ImmutableSet<T> {
    const set = this._set.emptyClone();
    return new ImmutableSet(set);
  }

  /** Returns an iterable of [v,v] pairs for every value v in the set. */
  *entries(): IterableIterator<[T, T]> {
    yield* this._set.entries();
  }

  /** Despite its name, returns an iterable of the values in the set. */
  *keys(): IterableIterator<T> {
    yield* this._set.keys();
  }

  /** Despite its name, returns an iterable of the values in the set. */
  *values(): IterableIterator<T> {
    yield* this._set.values();
  }
  [Symbol.iterator] = this.values;

  /** Executes a provided function once per each value in the Set object, in insertion order. */
  forEach(callbackfn: (value: T, key: T, set: Set<T>) => void, thisArg?: any): void {
    this._set.forEach(callbackfn, thisArg);
  }

  get [Symbol.toStringTag]() {
    return 'ImmutableSet';
  }

  /**
   * Creates a clone of the set; does not create a deep copy of the members.
   * `set.clone()` is equivalent to `new ObjectSet(set)`.
   */
  clone(): ImmutableSet<T> {
    return new ImmutableSet(this);
  }

  /**
   * @returns a new set containing only the members that satisfy the predicate.
   * Retains the same options as the original set.
   */
  filter(predicate: (value: T) => boolean): ImmutableSet<T> {
    const set = this._set.filter(predicate);
    return new ImmutableSet(set);
  }

  /**
   * Calls `transform` for each member of the set, and collects the results into a new set.
   */
  map<W>(transform: (value: T) => W): ImmutableSet<W> {
    const set = this._set.map(transform);
    return new ImmutableSet(set);
  }

  /**
   * Reduces the set to a single value, by calling the `reducer` function for each member.
   */
  reduce<A>(reducer: (accumulator: A, value: T) => A, initialValue: A): A {
    return this._set.reduce(reducer, initialValue);
  }

  /**
   * Returns `true` if the set contains a member that satisfies the predicate,
   * and `false` otherwise.
   */
  some(predicate: (value: T) => boolean): boolean {
    return this._set.some(predicate);
  }

  /**
   * Returns `true` if every member in the set satisfies the predicate,
   * and `false` otherwise.
   */
  every(predicate: (value: T) => boolean): boolean {
    return this._set.every(predicate);
  }

  /**
   * Returns a new set with the same members, sorted by the given function.
   * uses `Array.prototype.sort` under the hood.
   */
  sort(compareFn?: (a: T, b: T) => number): ImmutableSet<T> {
    const set = this._set.clone().sort(compareFn);
    return new ImmutableSet(set);
  }

  /**
   * @returns `true` if the map is empty (of size `0`), and `false` otherwise.
   */
  isEmpty(): boolean {
    return this._set.isEmpty();
  }

  /**
   * @returns `true` if this set and the other set are equal;
   * equality here is defined as having exactly the same members.
   * Equality of members is tested using the `equals` function provided in the constructor options.
   */
  equals(other: ImmutableSet<T>): boolean {
    return this._set.equals(other._set);
  }

  /**
   * Returns a new set containing exactly the members that are both in this set and in `other`.
   */
  intersection(other: SetLike<T>): ImmutableSet<T> {
    const set = this._set.intersection(other);
    return new ImmutableSet(set);
  }

  /**
   * Returns a new set containing exactly the members that are either in this set, the other set or both.
   */
  union(other: SetLike<T>): ImmutableSet<T> {
    const set = this._set.union(other);
    return new ImmutableSet(set);
  }

  /**
   * Returns a new set containing exactly the members that are in this set but not in `other`.
   */
  difference(other: SetLike<T>): ImmutableSet<T> {
    const set = this._set.difference(other);
    return new ImmutableSet(set);
  }

  /**
   * Returns a new set containing exactly the members that are in this set or in `other`, but not in both.
   */
  symmetricDifference(other: SetLike<T>): ImmutableSet<T> {
    const set = this._set.symmetricDifference(other);
    return new ImmutableSet(set);
  }

  /**
   * Returns `true` if every element in this set is also in `other`, and `false` otherwise.
   */
  isSubsetOf(other: SetLike<T>): boolean {
    return this._set.isSubsetOf(other);
  }

  /**
   * Returns `true` if this set contains every element in `other`, and `false` otherwise.
   */
  isSupersetOf(other: SetLike<T>): boolean {
    return this._set.isSupersetOf(other);
  }

  /**
   * Returns `true` if this set and `other` have no members in common, and `false` otherwise.
   */
  isDisjointFrom(other: SetLike<T>): boolean {
    return this._set.isDisjointFrom(other);
  }

  /**
   * Creates an `ImmutableSet` from the keys of a `Map` (possibly an `ObjectMap`) or an object.
   */
  static keysOf = keysOf;

  /**
   * Creates an `ObjectSet` from the values of a `Map` (possibly an `ObjectMap`) or an object.
   */
  static valuesOf = valuesOf;
}

function keysOf<K>(map: Map<K, unknown>, options?: Partial<ObjectMapOptions>): ImmutableSet<K>;
function keysOf<K extends string | number | symbol>(obj: Record<K, unknown>, options?: Partial<ObjectMapOptions>): ImmutableSet<K>;
function keysOf(obj: Map<unknown, unknown> | Record<string | number | symbol, unknown>, options: Partial<ObjectMapOptions> = {}): ImmutableSet<unknown> {
  if ('keys' in obj && typeof obj.keys === 'function') {
    return new ImmutableSet(obj.keys(), options);
  }
  return new ImmutableSet(Object.keys(obj), options);
}

function valuesOf<V>(map: Map<unknown, V>, options?: Partial<ObjectMapOptions>): ImmutableSet<V>;
function valuesOf<V>(obj: Record<any, V>, options?: Partial<ObjectMapOptions>): ImmutableSet<V>;
function valuesOf(obj: Map<unknown, unknown> | Record<any, unknown>, options: Partial<ObjectMapOptions> = {}): ImmutableSet<unknown> {
  if ('values' in obj && typeof obj.values === 'function') {
    return new ImmutableSet(obj.values(), options);
  }
  return new ImmutableSet(Object.values(obj), options);
}