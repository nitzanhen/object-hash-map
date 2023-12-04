import { ObjectMapOptions } from './ObjectMap';
import { ObjectSet } from './ObjectSet';

export class ImmutableSet<T> {
  protected set: ObjectSet<T>;

  constructor(iterable?: Iterable<T>, options: ObjectMapOptions = {}) {
    this.set = new ObjectSet(iterable, options);
  }

  get size() {
    return this.set.size;
  }

  add(value: T): ImmutableSet<T> {
    const set = this.set.clone();
    set.add(value);
    return new ImmutableSet(set);
  }

  has(value: T): boolean {
    return this.set.has(value);
  }

  delete(value: T): ImmutableSet<T> {
    const set = this.set.clone();
    set.delete(value);
    return new ImmutableSet(set);
  }

  clear(): ImmutableSet<T> {
    const set = this.set.clone();
    set.clear();
    return new ImmutableSet(set);
  }

  *values(): Iterable<T> {
    yield* this.set.values();
  }
  [Symbol.iterator] = this.values;

  clone(): ImmutableSet<T> {
    return new ImmutableSet(this.set);
  }
}