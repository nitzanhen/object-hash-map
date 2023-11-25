import { ObjectMap, ObjectMapOptions } from './ObjectMap';

export class ObjectSet<T> {
  protected map: ObjectMap<T, true>;

  constructor(options: ObjectMapOptions) {
    this.map = new ObjectMap(options);
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