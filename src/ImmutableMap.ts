import { ObjectMap, ObjectMapOptions } from './ObjectMap';
import type { SetLike } from './ObjectSet';

export class ImmutableMap<K, V> {
  protected _map: ObjectMap<K, V>;

  constructor(iterable?: Iterable<[K, V]>, options?: ObjectMapOptions) {
    this._map = new ObjectMap(iterable, options);
  }

  get size() {
    return this._map.size;
  }

  get capacity() {
    return this._map.capacity;
  }

  set(key: K, value: V): ImmutableMap<K, V> {
    const map = this._map.clone();
    map.set(key, value);
    return new ImmutableMap(map);
  }

  get(key: K): V | undefined {
    return this._map.get(key);
  }

  delete(key: K): ImmutableMap<K, V> {
    const map = this._map.clone();
    map.delete(key);
    return new ImmutableMap(map);
  }

  has(key: K): boolean {
    return this._map.has(key);
  }

  clear(): ImmutableMap<K, V> {
    const map = this._map.emptyClone();
    return new ImmutableMap(map);
  }

  *entries(): Iterable<[K, V]> {
    yield* this._map.entries();
  }
  [Symbol.iterator] = this.entries;

  *keys(): Iterable<K> {
    yield* this._map.keys();
  }

  *values(): Iterable<V> {
    yield* this._map.values();
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this._map.forEach(callbackfn, thisArg);
  }

  get [Symbol.toStringTag]() {
    return 'ImmutableMap';
  };

  clone() {
    return new ImmutableMap(this._map);
  }

  filter(predicate: (value: V, key: K) => boolean): ImmutableMap<K, V> {
    const map = this._map.filter(predicate);
    return new ImmutableMap(map);
  }

  map<W>(transform: (value: V, key: K) => W): ImmutableMap<K, W> {
    const map = this._map.map(transform);
    return new ImmutableMap(map);
  }

  reduce<A>(reducer: (accumulator: A, value: V, key: K) => A, initialValue: A): A {
    return this._map.reduce(reducer, initialValue);
  }

  some(predicate: (value: V, key: K) => boolean): boolean {
    return this._map.some(predicate);
  }

  every(predicate: (value: V, key: K) => boolean): boolean {
    return this._map.every(predicate);
  }

  sort(compareFn?: (a: [K, V], b: [K, V]) => number): ImmutableMap<K, V> {
    const map = this._map.clone();
    map.sort(compareFn);
    return new ImmutableMap(map);
  }

  isEmpty(): boolean {
    return this._map.isEmpty();
  }

  equals(other: ImmutableMap<K, V>): boolean {
    return this._map.equals(other._map);
  }

  update(key: K, updater: (value: V | undefined, key: K) => V): ImmutableMap<K, V> {
    const map = this._map.clone();
    map.update(key, updater);
    return new ImmutableMap(map);
  }

  static fromSet<K, V>(
    set: SetLike<K>,
    factory: (key: K) => V,
    options: ObjectMapOptions = {}
  ) {
    return new ImmutableMap<K, V>(ObjectMap.fromSet(set, factory, options));
  }
}