import { equals as defaultEquals } from './equals';
import { hash as defaultHash } from './hash';

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

  protected loadFactor;
  protected _size;

  protected equals: (a: unknown, b: unknown) => boolean;
  protected _hash: (value: unknown) => number;

  constructor({
    initialCapacity = 32,
    loadFactor = 0.75,
    equals = defaultEquals,
    hash = defaultHash
  }: ObjectMapOptions = {}) {
    this.buckets = new Array(initialCapacity);
    this.first = null;
    this.last = null;

    this.loadFactor = loadFactor;
    this._size = 0;

    this.equals = equals;
    this._hash = hash;
  }

  get size() {
    return this._size;
  }

  get capacity() {
    return this.buckets.length;
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
      if (this.equals(key, k)) {
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
      if (this.equals(key, entry.key)) {
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
      if (this.equals(key, k)) {
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
        if (this.equals(this.first, key)) {
          this.first = next;
        }
        if (this.equals(this.last, key)) {
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

    return bucket.some(({ key: k }) => this.equals(key, k));
  }

  clear(): void {
    this.buckets = new Array(this.buckets.length);
    this._size = 0;
    this.first = null;
    this.last = null;
  }


  protected *nodes(): Generator<ObjectMapNode<K, V>> {
    let k = this.first;
    while (k !== null) {
      const node = this.getNode(k)!;
      yield node;
      k = node.next;
    }
  }

  *entries(): Generator<[K, V]> {
    for (const { key, value } of this.nodes()) {
      yield [key, value];
    }
  }
  [Symbol.iterator] = this.entries;

  *keys(): Generator<K> {
    for (const { key } of this.nodes()) {
      yield key;
    }
  }

  *values(): Generator<V> {
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
}