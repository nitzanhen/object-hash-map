import { ObjectMap, ObjectMapOptions } from './ObjectMap';

export class ImmutableMap<K, V> {
  protected map: ObjectMap<K, V>;

  constructor(iterable?: Iterable<[K, V]>, options?: ObjectMapOptions) {
    this.map = new ObjectMap(iterable, options);
  }

  get size() {
    return this.map.size;
  }

  get capacity() {
    return this.map.capacity;
  }

  set(key: K, value: V): ImmutableMap<K, V> {
    const map = this.map.clone();
    map.set(key, value);
    return new ImmutableMap(map);
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  delete(key: K): ImmutableMap<K, V> {
    const map = this.map.clone();
    map.delete(key);
    return new ImmutableMap(map);
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  clear(): ImmutableMap<K, V> {
    const map = this.map.clone();
    map.clear();
    return new ImmutableMap(map);
  }

  *entries(): Iterable<[K, V]> {
    yield* this.map.entries();
  }
  [Symbol.iterator] = this.entries;

  *keys(): Iterable<K> {
    yield* this.map.keys();
  }

  *values(): Iterable<V> {
    yield* this.map.values();
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this.map.forEach(callbackfn, thisArg);
  }

  get [Symbol.toStringTag]() {
    return 'ImmutableMap';
  };

  clone(): ImmutableMap<K, V> {
    return new ImmutableMap(this.map.clone());
  }
}