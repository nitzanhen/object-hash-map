import { ObjectMap, ObjectMapOptions } from './ObjectMap';

export class ObjectSet<T> implements Set<T> {
  protected map: ObjectMap<T, T>;

  constructor(iterable?: Iterable<T>, options: ObjectMapOptions = {}) {
    this.map = new ObjectMap(
      iterable instanceof ObjectSet ? iterable.map : toMapIterable(iterable),
      options
    );
  }

  get size() {
    return this.map.size;
  }

  add(value: T): this {
    this.map.set(value, value);
    return this;
  }

  has(value: T) {
    return this.map.has(value);
  }

  delete(value: T): boolean {
    return this.map.delete(value)
  }

  clear() {
    this.map.clear();
  }

  *entries(): IterableIterator<[T, T]> {
    yield* this.map.entries();
  }

  *keys(): IterableIterator<T> {
    yield* this.map.keys();
  }

  *values(): IterableIterator<T> {
    yield* this.map.values();
  }
  [Symbol.iterator] = this.values;

  forEach(callbackfn: (value: T, key: T, set: ObjectSet<T>) => void, thisArg?: any): void {
    this.map.forEach((v, k) => callbackfn(v, k, this), thisArg);
  }

  get [Symbol.toStringTag]() {
    return 'ObjectSet';
  }
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