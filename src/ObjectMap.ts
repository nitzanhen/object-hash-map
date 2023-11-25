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

export class ObjectMap<K, V> {
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

  set(key: K, value: V): void {
    const h = this.hash(key);
    const bucket = this.buckets[h] ?? [];
    for (let i = 0; i < bucket.length; i++) {
      const { key: k } = bucket[i];
      if (this.equals(key, k)) {
        // `bucket` is not empty, and the key exists in the map. Replace & return
        bucket[i].value = value;
        return;
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
    // And if this is the first element, update `this.first`
    if (this.first === null) {
      this.first = key;
    }

    return;
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

  delete(key: K): V | undefined {
    const h = this.hash(key);
    const bucket = this.buckets[h];
    if (!bucket) {
      return undefined;
    }

    for (let i = 0; i < bucket.length; i++) {
      const { key: k, value } = bucket[i];
      if (this.equals(key, k)) {
        bucket.splice(i, 1);
        this._size--;
        return value;
      }
    }

    // Key is not in the map
    return undefined;
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
}