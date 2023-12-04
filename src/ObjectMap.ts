import { equals as defaultEquals } from './equals';
import { hash as defaultHash } from './hash';
import type { SetLike } from './ObjectSet';

export interface ObjectMapOptions {
  initialCapacity?: number;
  loadFactor?: number;
  equals?: (a: unknown, b: unknown) => boolean;
  hash?: (value: unknown) => number;
}

interface ObjectMapNode<K, V> {
  key: K;
  value: V;
  prev: K | null;
  next: K | null;
}

export class ObjectMap<K, V> implements Map<K, V> {
  protected buckets: Array<ObjectMapNode<K, V>[] | undefined>;
  protected first: K | null;
  protected last: K | null;

  protected loadFactor: number;
  protected _size: number;

  protected _equals: (a: unknown, b: unknown) => boolean;
  protected _hash: (value: unknown) => number;

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

  get size() {
    return this._size;
  }

  get capacity() {
    return this.buckets.length;
  }

  get options() {
    return {
      loadFactor: this.loadFactor,
      equals: this._equals,
      hash: this._hash
    };
  }

  protected hash(key: K, capacity = this.capacity) {
    return this._hash(key) % capacity;
  }

  protected resize(capacity: number) {
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

  clone() {
    return new ObjectMap(this);
  }

  emptyClone<W = V>() {
    return new ObjectMap<K, W>(undefined, {
      initialCapacity: this.capacity,
      ...this.options
    });
  }

  filter(predicate: (value: V, key: K) => boolean): ObjectMap<K, V> {
    const map = this.emptyClone();
    for (const [key, value] of this.entries()) {
      if (predicate(value, key)) {
        map.set(key, value);
      }
    }

    return map;
  }

  map<W>(transform: (value: V, key: K) => W): ObjectMap<K, W> {
    const map = this.emptyClone<W>();
    for (const [key, value] of this.entries()) {
      map.set(key, transform(value, key));
    }

    return map;
  }

  reduce<A>(reducer: (accumulator: A, value: V, key: K) => A, initialValue: A): A {
    let accumulator = initialValue;
    for (const [key, value] of this.entries()) {
      accumulator = reducer(accumulator, value, key);
    }
    return accumulator;
  }

  some(predicate: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of this.entries()) {
      if (predicate(value, key)) {
        return true;
      }
    }
    return false;
  }

  every(predicate: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of this.entries()) {
      if (!predicate(value, key)) {
        return false;
      }
    }
    return true;
  }

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

  isEmpty(): boolean {
    return this.size === 0;
  }

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

  pop(key: K): V | undefined {
    const value = this.get(key);
    this.delete(key);
    return value;
  }

  update(key: K, updater: (value: V | undefined, key: K) => V): this {
    this.set(key, updater(this.get(key), key));
    return this;
  }

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