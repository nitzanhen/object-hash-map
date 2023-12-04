import { ObjectMapOptions } from './ObjectMap';
import { ObjectSet, SetLike } from './ObjectSet';

export class ImmutableSet<T> {
  protected _set: ObjectSet<T>;

  constructor(iterable?: Iterable<T>, options: ObjectMapOptions = {}) {
    this._set = new ObjectSet(iterable, options);
  }

  get size(): number {
    return this._set.size;
  }

  add(value: T): ImmutableSet<T> {
    const set = new ObjectSet(this._set);
    set.add(value);
    return new ImmutableSet(set);
  }

  has(value: T): boolean {
    return this._set.has(value);
  }

  delete(value: T): ImmutableSet<T> {
    const set = new ObjectSet(this._set);
    set.delete(value);
    return new ImmutableSet(set);
  }

  clear(): ImmutableSet<T> {
    const set = new ObjectSet(this._set);
    set.clear();
    return new ImmutableSet(set);
  }

  *entries(): Iterable<[T, T]> {
    yield* this._set.entries();
  }

  *keys(): Iterable<T> {
    yield* this._set.keys();
  }

  *values(): Iterable<T> {
    yield* this._set.values();
  }
  [Symbol.iterator] = this.values;

  forEach(callbackfn: (value: T, key: T, set: Set<T>) => void, thisArg?: any): void {
    this._set.forEach(callbackfn, thisArg);
  }

  get [Symbol.toStringTag]() {
    return 'ImmutableSet';
  }

  clone(): ImmutableSet<T> {
    return new ImmutableSet(this._set);
  }

  filter(predicate: (value: T) => boolean): ImmutableSet<T> {
    const set = this._set.filter(predicate);
    return new ImmutableSet(set);
  }

  map<W>(transform: (value: T) => W): ImmutableSet<W> {
    const set = this._set.map(transform);
    return new ImmutableSet(set);
  }

  reduce<A>(reducer: (accumulator: A, value: T) => A, initialValue: A): A {
    return this._set.reduce(reducer, initialValue);
  }

  some(predicate: (value: T) => boolean): boolean {
    return this._set.some(predicate);
  }

  every(predicate: (value: T) => boolean): boolean {
    return this._set.every(predicate);
  }

  sort(compareFn?: (a: T, b: T) => number): ImmutableSet<T> {
    const set = this._set.clone();
    set.sort(compareFn);
    return new ImmutableSet(set);
  }

  isEmpty(): boolean {
    return this._set.isEmpty();
  }

  equals(other: ImmutableSet<T>): boolean {
    return this._set.equals(other._set);
  }

  intersection(other: SetLike<T>): ImmutableSet<T> {
    const set = this._set.intersection(other);
    return new ImmutableSet(set);
  }

  union(other: SetLike<T>): ImmutableSet<T> {
    const set = this._set.union(other);
    return new ImmutableSet(set);
  }

  difference(other: SetLike<T>): ImmutableSet<T> {
    const set = this._set.difference(other);
    return new ImmutableSet(set);
  }

  symmetricDifference(other: SetLike<T>): ImmutableSet<T> {
    const set = this._set.symmetricDifference(other);
    return new ImmutableSet(set);
  }

  isSubsetOf(other: SetLike<T>): boolean {
    return this._set.isSubsetOf(other);
  }

  isSupersetOf(other: SetLike<T>): boolean {
    return this._set.isSupersetOf(other);
  }

  isDisjointFrom(other: SetLike<T>): boolean {
    return this._set.isDisjointFrom(other);
  }

  static keysOf = keysOf;
  static valuesOf = valuesOf;
}

function keysOf<K>(map: Map<K, unknown>): ImmutableSet<K>;
function keysOf<K extends string | number | symbol>(obj: Record<K, unknown>): ImmutableSet<K>;
function keysOf(obj: Map<unknown, unknown> | Record<string | number | symbol, unknown>): ImmutableSet<unknown> {
  if ('keys' in obj && typeof obj.keys === 'function') {
    return new ImmutableSet(obj.keys());
  }
  return new ImmutableSet(Object.keys(obj));
}

function valuesOf<V>(map: Map<unknown, V>): ImmutableSet<V>;
function valuesOf<V>(obj: Record<any, V>): ImmutableSet<V>;
function valuesOf(obj: Map<unknown, unknown> | Record<any, unknown>): ImmutableSet<unknown> {
  if ('values' in obj && typeof obj.values === 'function') {
    return new ImmutableSet(obj.values());
  }
  return new ImmutableSet(Object.values(obj));
}