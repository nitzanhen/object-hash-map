import { equals as defaultEquals } from './equals';
import { hash as defaultHash } from './hash';
import type { SetLike } from './ObjectSet';

/**
 * Constructor options for the `ObjectMap`, `ObjectSet`, `ImmutableMap` and `ImmutableSet` classes.
 */
export interface ObjectMapOptions {
  /**
   * The initial capacity of the map; defaults to `32`.
   * For a map with constant capacity, set this together with `loadFactor=1`
   */
  initialCapacity?: number;
  /** 
   * The threshold above which the map will resize; defaults to `0.75`.
   * For a map that never resizes, set this to `1`.
   */
  loadFactor?: number;
  /**
   * The function used to compare keys for equality; defaults to a deep equality function (exported as `equals`).
   */
  equals?: (a: unknown, b: unknown) => boolean;
  /**
   * The function used to hash keys; defaults to a deep hash function (exported as `hash`).
   */
  hash?: (value: unknown) => number;
}

/**
 * @interal - wraps stored values to keep track of order.
 */
interface ObjectMapNode<K, V> {
  key: K;
  value: V;
  prev: K | null;
  next: K | null;
}

/**
 * A Map data structure that compares keys by value rather than by reference.
 * Compliant with the ES6 Map interface.
 * @see https://github.com/nitzanhen/objectmap.js
 */
export class ObjectMap<K, V> implements Map<K, V> {
  protected buckets: Array<ObjectMapNode<K, V>[] | undefined>;
  protected first: K | null;
  protected last: K | null;

  protected loadFactor: number;
  protected _size: number;

  protected _equals: (a: unknown, b: unknown) => boolean;
  protected _hash: (value: unknown) => number;

  /**
   * @param iterable an iterable of key-value pairs, used to initialize the map.  
   * If this is an `ObjectMap`, this constructor will create a copy. 
   * Otherwise, if the iterable has a `length` or `size` property - its value will be used as the initial capacity (can be overriden by `initialCapacity` in options). 
   * @param options constructor options.
   */
  constructor(iterable?: Iterable<[K, V]>, options: ObjectMapOptions = {}) {
    const initialCapacity = options.initialCapacity
      || (iterable && 'size' in iterable && iterable.size as number)
      || (iterable && 'length' in iterable && iterable.length as number)
      || 32;

    if (iterable instanceof ObjectMap) {
      this.buckets = new Array(iterable.capacity);
      this.loadFactor = iterable.loadFactor;
      this._equals = iterable._equals;
      this._hash = iterable._hash;
    }
    else {
      this.buckets = new Array(initialCapacity);
      this.loadFactor = options.loadFactor ?? 0.75;
      this._equals = options.equals ?? defaultEquals;
      this._hash = options.hash ?? defaultHash;
    }

    this.first = null;
    this.last = null;
    this._size = 0;

    if (iterable) {
      for (const [key, value] of iterable) {
        this.set(key, value);
      }
    }
  }

  get size(): number {
    return this._size;
  }

  get capacity(): number {
    return this.buckets.length;
  }

  get options(): Omit<ObjectMapOptions, 'initialCapacity'> {
    return {
      loadFactor: this.loadFactor,
      equals: this._equals,
      hash: this._hash
    };
  }

  protected hash(key: K, capacity = this.capacity): number {
    return this._hash(key) % capacity;
  }

  protected resize(capacity: number): void {
    const buckets = new Array(capacity);
    for (const node of this.nodes()) {
      const h = this.hash(node.key, capacity);
      if (!buckets[h]) {
        buckets[h] = [];
      }
      buckets[h].push(node);
    }

    this.buckets = buckets;
  }

  set(key: K, value: V): this {
    const h = this.hash(key);
    if (!this.buckets[h]) {
      this.buckets[h] = [];
    }
    const bucket = this.buckets[h]!;
    for (let i = 0; i < bucket.length; i++) {
      const { key: k } = bucket[i];
      if (this._equals(key, k)) {
        // `bucket` is not empty, and the key exists in the map. Replace & return
        bucket[i].value = value;
        return this;
      }
    }

    // `bucket` is empty or does not contain the key; insert it
    bucket.push({
      key,
      value,
      prev: this.last,
      next: null
    });
    this._size++;

    // Resize if needed
    if (this.size / this.capacity > this.loadFactor) {
      this.resize(this.capacity * 2);
    }

    // Update `this.last`
    if (this.last !== null) {
      const node = this.getNode(this.last)!;
      node.next = key;
    }
    this.last = key;

    // And if this is the first element, update `this.first`
    if (this.first === null) {
      this.first = key;
    }

    return this;
  }

  protected getNode(key: K): ObjectMapNode<K, V> | undefined {
    const h = this.hash(key);
    const bucket = this.buckets[h];
    if (!bucket) {
      return undefined;
    }

    for (const entry of bucket) {
      if (this._equals(key, entry.key)) {
        return entry;
      }
    }

    return undefined;
  }

  get(key: K): V | undefined {
    return this.getNode(key)?.value;
  }

  delete(key: K): boolean {
    const h = this.hash(key);
    const bucket = this.buckets[h];
    if (!bucket) {
      return false;
    }

    for (let i = 0; i < bucket.length; i++) {
      const { key: k, value, prev, next } = bucket[i];
      if (this._equals(key, k)) {
        bucket.splice(i, 1);
        this._size--;
        if (prev !== null) {
          const prevNode = this.getNode(prev)!;
          prevNode.next = next;
        }
        if (next !== null) {
          const nextNode = this.getNode(next)!;
          nextNode.prev = prev;
        }
        if (this._equals(this.first, key)) {
          this.first = next;
        }
        if (this._equals(this.last, key)) {
          this.last = prev;
        }
        return true;
      }
    }

    // Key is not in the map
    return false;
  }

  has(key: K): boolean {
    // Tempting to use `!!this.get(key)` here, but the value may be a falsy value.
    const h = this.hash(key);
    const bucket = this.buckets[h];
    if (!bucket) {
      return false
    }

    return bucket.some(({ key: k }) => this._equals(key, k));
  }

  clear(): void {
    this.buckets = new Array(this.buckets.length);
    this._size = 0;
    this.first = null;
    this.last = null;
  }


  protected * nodes(): Generator<ObjectMapNode<K, V>> {
    let k = this.first;
    while (k !== null) {
      const node = this.getNode(k)!;
      yield node;
      k = node.next;
    }
  }

  * entries(): Generator<[K, V]> {
    for (const { key, value } of this.nodes()) {
      yield [key, value];
    }
  }
  [Symbol.iterator] = this.entries;

  * keys(): Generator<K> {
    for (const { key } of this.nodes()) {
      yield key;
    }
  }

  * values(): Generator<V> {
    for (const { value } of this.nodes()) {
      yield value;
    }
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    for (const [key, value] of this.entries()) {
      callbackfn.call(thisArg, value, key, this);
    }
  }

  get [Symbol.toStringTag]() {
    return 'ObjectMap';
  };

  /**
   * Creates a clone of the map; does not create a deep copy keys or values.
   * `map.clone()` is equivalent to `new ObjectMap(map)`.
   */
  clone(): ObjectMap<K, V> {
    return new ObjectMap(this);
  }

  /**
   * @returns a map with the same options but no keys or values.
   */
  emptyClone<W = V>(): ObjectMap<K, W> {
    return new ObjectMap<K, W>(undefined, {
      initialCapacity: this.capacity,
      ...this.options
    });
  }

  /**
   * @returns a new map containing only the key-value pairs that satisfy the predicate.
   * Retains the same options as the original map.
   */
  filter(predicate: (value: V, key: K) => boolean): ObjectMap<K, V> {
    const map = this.emptyClone();
    for (const [key, value] of this.entries()) {
      if (predicate(value, key)) {
        map.set(key, value);
      }
    }

    return map;
  }

  /**
   * Returns a new map with the same keys, and the results of calling `transform` for each key-value pair as values.
   */
  map<W>(transform: (value: V, key: K) => W): ObjectMap<K, W> {
    const map = this.emptyClone<W>();
    for (const [key, value] of this.entries()) {
      map.set(key, transform(value, key));
    }

    return map;
  }

  /**
   * Reduces the map to a single value, by calling the `reducer` function for each key-value pair.
   */
  reduce<A>(reducer: (accumulator: A, value: V, key: K) => A, initialValue: A): A {
    let accumulator = initialValue;
    for (const [key, value] of this.entries()) {
      accumulator = reducer(accumulator, value, key);
    }
    return accumulator;
  }

  /**
   * Returns `true` if the map contains a key-value pair that satisfies the predicate,
   * and `false` otherwise.
   */
  some(predicate: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of this.entries()) {
      if (predicate(value, key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns `true` if every key-value pair in the map satisfies the predicate,
   * and `false` otherwise.
   */
  every(predicate: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of this.entries()) {
      if (!predicate(value, key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Sorts the map in-place using the provided compare function.
   * uses `Array.prototype.sort` under the hood.
   */
  sort(compareFn?: (a: [K, V], b: [K, V]) => number): this {
    const nodes = [...this.nodes()];
    nodes.sort(compareFn && ((a, b) => compareFn([a.key, a.value], [b.key, b.value])));

    // After sort, rewrite the order
    this.first = nodes[0].key;
    this.last = nodes[nodes.length - 1].key;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      node.prev = i === 0 ? null : nodes[i - 1].key;
      node.next = i === nodes.length - 1 ? null : nodes[i + 1].key;
    }

    return this;
  }

  /**
   * @returns `true` if the map is empty (of size `0`), and `false` otherwise.
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * @returns `true` if this map and the other map are equal, and `false` otherwise;
   * equality here is defined as having the same key sets, and the same values for each key.
   * Equality is tested using the `equals` function provided in the constructor options.
   */
  equals(other: ObjectMap<K, V>): boolean {
    if (this.size !== other.size) {
      return false;
    }

    for (const [key, value] of this.entries()) {
      if (!other.has(key) || !this._equals(value, other.get(key)!)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Removes the value associated with the given key, and returns it.
   * If the key is not in the map, returns `undefined`.
   * This is like `delete`, except the `value` (or `undefined`) is returned.
   */
  pop(key: K): V | undefined {
    const value = this.get(key);
    this.delete(key);
    return value;
  }

  /**
   * Updates the value associated with the given key, using the `updater` function.
   * Note that if the key is not in the map, updater will be called with `undefined`.
   * @returns this
   */
  update(key: K, updater: (value: V | undefined, key: K) => V): this {
    this.set(key, updater(this.get(key), key));
    return this;
  }

  /** Static factory for creating a map from a set-like object and a function. */
  static fromSet<K, V>(
    set: SetLike<K>,
    factory: (key: K) => V,
    options: ObjectMapOptions = {}
  ): ObjectMap<K, V> {
    const map = new ObjectMap<K, V>(undefined, options);
    for (const key of set.keys()) {
      map.set(key, factory(key));
    }
    return map;
  }
}