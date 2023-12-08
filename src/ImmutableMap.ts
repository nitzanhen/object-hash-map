import { ObjectMap, ObjectMapOptions } from './ObjectMap';
import type { SetLike } from './ObjectSet';

/**
 * An immutable Map data structure that compares keys by value rather than by reference.
 * @see https://github.com/nitzanhen/objectmap.js
 */
export class ImmutableMap<K, V> {
  protected _map: ObjectMap<K, V>;

  /**
   * @param iterable an iterable of key-value pairs; used to initialize the map.  
   * If this is an `ImmutableMap`, this constructor will create a copy. 
   * Otherwise, if the iterable has a `length` or `size` property - its value will be used as the initial capacity (can be overriden by `initialCapacity` in options). 
   * @param options constructor options.
   */
  constructor(iterable?: Iterable<[K, V]>, options?: ObjectMapOptions) {
    this._map = new ObjectMap(
      iterable instanceof ImmutableMap ? iterable._map : iterable,
      options
    );
  }

  /** @returns — the number of elements in the Map. */
  get size(): number {
    return this._map.size;
  }

  get capacity(): number {
    return this._map.capacity;
  }

  /**
   * Returns a new map with the given value associated with the given key;
   * if the key is already present in the map, the old value is replaced, otherwise it's added.
   */
  set(key: K, value: V): ImmutableMap<K, V> {
    const map = this._map.clone();
    map.set(key, value);
    return new ImmutableMap(map);
  }

  /**
   * Returns the value associated with the specified key, 
   * or `undefined` if the key is not in the map.
   */
  get(key: K): V | undefined {
    return this._map.get(key);
  }

  /**
   * Returns a new map with the given key removed, if it was present.
   */
  delete(key: K): ImmutableMap<K, V> {
    const map = this._map.clone();
    map.delete(key);
    return new ImmutableMap(map);
  }

  /** @returns a boolean indicating whether an element with the specified key exists or not. */
  has(key: K): boolean {
    return this._map.has(key);
  }

  /** Returns an empty clone of this map. */
  clear(): ImmutableMap<K, V> {
    const map = this._map.emptyClone();
    return new ImmutableMap(map);
  }

  /** Returns an iterable of key, value pairs for every entry in the map. */
  *entries(): IterableIterator<[K, V]> {
    yield* this._map.entries();
  }
  [Symbol.iterator] = this.entries;

  /** Returns an iterable of keys in the map */
  *keys(): IterableIterator<K> {
    yield* this._map.keys();
  }

  /** Returns an iterable of values in the map */
  *values(): IterableIterator<V> {
    yield* this._map.values();
  }

  /** Executes a provided function once per each key/value pair in the Map, in insertion order. */
  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this._map.forEach(callbackfn, thisArg);
  }

  get [Symbol.toStringTag]() {
    return 'ImmutableMap';
  };

  /**
   * Creates a clone of the map; does not create a deep copy of keys or values.
   * `map.clone()` is equivalent to `new ImmutableMap(map)`.
   */
  clone(): ImmutableMap<K, V> {
    return new ImmutableMap(this);
  }

  /**
   * @returns a new map containing only the key-value pairs that satisfy the predicate.
   * Retains the same options as the original map.
   */
  filter(predicate: (value: V, key: K) => boolean): ImmutableMap<K, V> {
    const map = this._map.filter(predicate);
    return new ImmutableMap(map);
  }

  /**
   * Calls `transform` for each key-value pair in the map, and collects the results into a new map.
   */
  map<W>(transform: (value: V, key: K) => W): ImmutableMap<K, W> {
    const map = this._map.map(transform);
    return new ImmutableMap(map);
  }

  /**
   * Reduces the map to a single value, by calling the `reducer` function for each key-value pair.
   */
  reduce<A>(reducer: (accumulator: A, value: V, key: K) => A, initialValue: A): A {
    return this._map.reduce(reducer, initialValue);
  }

  /**
   * Returns `true` if the map contains a key-value pair that satisfies the predicate,
   * and `false` otherwise.
   */
  some(predicate: (value: V, key: K) => boolean): boolean {
    return this._map.some(predicate);
  }

  /**
   * Returns `true` if every key-value pair in the map satisfies the predicate,
   * and `false` otherwise.
   */
  every(predicate: (value: V, key: K) => boolean): boolean {
    return this._map.every(predicate);
  }

  /**
   * Returns a new map with the same keys, sorted by the given function.
   * uses `Array.prototype.sort` under the hood.
   */
  sort(compareFn?: (a: [K, V], b: [K, V]) => number): ImmutableMap<K, V> {
    const map = this._map.clone().sort(compareFn);
    return new ImmutableMap(map);
  }

  /**
   * @returns `true` if the map is empty (of size `0`), and `false` otherwise.
   */
  isEmpty(): boolean {
    return this._map.isEmpty();
  }

  /**
   * @returns `true` if this map and the other map are equal;
   * equality here is defined as having the same key sets, and the same values for each key.
   * Equality is tested using the `equals` function provided in the constructor options.
   */
  equals(other: ImmutableMap<K, V>): boolean {
    return this._map.equals(other._map);
  }

  /**
   * Returns a new map with the value for the given key updated to the result of `updater`.
   * Note that if the key is not in the map, updater will be called with `undefined`.
   */
  update(key: K, updater: (value: V | undefined, key: K) => V): ImmutableMap<K, V> {
    return this.set(key, updater(this.get(key), key));
  }

  /** Static factory for creating a map from a set-like object and a function. */
  static fromSet<K, V>(
    set: SetLike<K>,
    factory: (key: K) => V,
    options: ObjectMapOptions = {}
  ): ImmutableMap<K, V> {
    return new ImmutableMap<K, V>(ObjectMap.fromSet(set, factory, options));
  }
}