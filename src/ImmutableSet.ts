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
    const set = new ObjectSet(this.set);
    set.add(value);
    return new ImmutableSet(set);
  }

  has(value: T): boolean {
    return this.set.has(value);
  }

  delete(value: T): ImmutableSet<T> {
    const set = new ObjectSet(this.set);
    set.delete(value);
    return new ImmutableSet(set);
  }

  clear(): ImmutableSet<T> {
    const set = new ObjectSet(this.set);
    set.clear();
    return new ImmutableSet(set);
  }

  *entries(): Iterable<[T, T]> {
    yield* this.set.entries();
  }

  *keys(): Iterable<T> {
    yield* this.set.keys();
  }

  *values(): Iterable<T> {
    yield* this.set.values();
  }
  [Symbol.iterator] = this.values;

  forEach(callbackfn: (value: T, key: T, set: Set<T>) => void, thisArg?: any): void {
    this.set.forEach(callbackfn, thisArg);
  }
}