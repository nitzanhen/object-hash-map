import { ObjectMap, ObjectMapOptions } from './ObjectMap';

export interface SetLike<T> {
  size: number;
  has(value: T): boolean;
  keys(): IterableIterator<T>;
}

export class ObjectSet<T> implements Set<T> {
  protected _map: ObjectMap<T, T>;

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

  clone(): ObjectSet<T> {
    return new ObjectSet(this);
  }

  emptyClone<S = T>(): ObjectSet<S> {
    return new ObjectSet<S>(undefined, {
      initialCapacity: this.size,
      ...this._map.options
    });
  }

  filter(predicate: (value: T) => boolean): ObjectSet<T> {
    const set = this.emptyClone();
    set._map = this._map.filter((_, k) => predicate(k));
    return set;
  }

  map<S>(transform: (value: T) => S): ObjectSet<S> {
    const set = this.emptyClone<S>();
    for (const value of this.values()) {
      set.add(transform(value));
    }
    return set;
  }

  reduce<A>(reducer: (accumulator: A, value: T) => A, initialValue: A): A {
    return this._map.reduce(reducer, initialValue);
  }

  some(predicate: (value: T) => boolean): boolean {
    for (const value of this.values()) {
      if (predicate(value)) {
        return true;
      }
    }
    return false;
  }

  every(predicate: (value: T) => boolean): boolean {
    for (const value of this.values()) {
      if (!predicate(value)) {
        return false;
      }
    }
    return true;
  }

  sort(compareFn?: (a: T, b: T) => number): this {
    this._map.sort(compareFn && (([a], [b]) => compareFn(a, b)));
    return this;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  equals(other: ObjectSet<T>): boolean {
    return this._map.equals(other._map);
  }

  // Set operation methods; compliant with the corresponding experimental apis

  intersection(other: SetLike<T>): ObjectSet<T> {
    return this.filter(value => other.has(value));
  }

  union(other: SetLike<T>): ObjectSet<T> {
    const set = this.clone();
    for (const value of other.keys()) {
      set.add(value);
    }
    return set;
  }

  difference(other: SetLike<T>): ObjectSet<T> {
    return this.filter(value => !other.has(value));
  }

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

  isSubsetOf(other: SetLike<T>): boolean {
    return this.every(value => other.has(value));
  }

  isSupersetOf(other: SetLike<T>): boolean {
    for (const value of other.keys()) {
      if (!this.has(value)) {
        return false;
      }
    }
    return true;
  }

  isDisjointFrom(other: SetLike<T>): boolean {
    return !this.some(value => other.has(value));
  }

  static keysOf = keysOf;
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