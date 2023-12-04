import { ObjectMap, ObjectMapOptions } from './ObjectMap';

export class ObjectSet<T> {
  protected map: ObjectMap<T, true>;

  constructor(iterable?: Iterable<T>, options: ObjectMapOptions = {}) {
    this.map = new ObjectMap(toMapIterable(iterable), options);
  }

  get size() {
    return this.map.size;
  }

  add(value: T) {
    this.map.set(value, true);
  }

  has(value: T) {
    return this.map.has(value);
  }

  delete(value: T): boolean {
    return !!this.map.delete(value)
  }

  clear() {
    this.map.clear();
  }

  *values() {
    yield* this.map.keys();
  }
}

/**
 * Turns a "set" iterator to a "map" iterator by putting each value into a tuple, with the value as `true`.
 */
function* toMapIterable<T>(iterable?: Iterable<T>): Iterable<[T, true]> {
  if (!iterable) {
    return undefined;
  }
  for (const value of iterable) {
    yield [value, true];
  }
}