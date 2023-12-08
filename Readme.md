<h1 align="center">objectmap.js</h1>

<p align="center">
  A HashMap for the modern Javascript world ⚡
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/objectmap.js">
    <img src="https://img.shields.io/npm/v/objectmap.js" alt="npm" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/github/languages/top/nitzanhen/objectmap" alt="typescript" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/github/license/nitzanhen/objectmap" alt="license" />
  </a>
</p>

```
npm install objectmap.js
```

```ts
// Compares keys by *data*, not by object identity

const friendCounts = new ObjectMap<{ name: string }, number>();
friendCounts.set({ name: "Foo" }, 4);
friendCounts.set({ name: "Bar" }, 6)

// In ES2015's Map, this returns false
console.log(friendCounts.has({ name: "Foo" })) // true

// In ES2015's Map, these return undefined
console.log(friendCounts.get({ name: "Foo" })) // 4
console.log(friendCounts.get({ name: "Bar" })) // 6

// Compliant with ES2015's Map API
console.log([...friendCounts.keys()]) // [{ name: "Foo" }, { name: "Bar" }]
console.log(friendCounts.delete({ name: "Foo" })) // true

// ... but has a lot more to offer:
// filter(), map(), reduce(), sort(), some(), every(), 
// update(), pop(), clone(), etc.
```

```ts
// Features a `Set` implementation, too

const friends = new ObjectSet<{ name: string }>();
friends.add({ name: "Foo" });

// In ES2015's Set, this returns `false`
console.log(friends.has({ name: "Foo" })) // `true`

// And immutable versions, too
const map = new ImmutableMap()
const set = new ImmutableSet()
```

## Features
- **💡 Compare keys by value, not by reference**: Referential equality is outdated - JavaScript objects are nowadays compared by the information they engrain.  
`objectmap.js`'s crown feature is hashing and comparing objects by value rather than their place in memory; you'll find that `ObjectMap` and `ObjectSet` are a natural fit where the native `Map` and `Set` should have been (read more [below](#🌟-why-value-based-comparison-matters)).
- **🧰 Equipped with utilities**: alongside the standard `Map` and `Set` interfaces, `objectmap.js` provides convenient methods for dealing with collections (e.g. [filter()](#filterpredicate-value-v-key-k--boolean-objectmapk-v), [map()](#mapwtransform-value-v-key-k--w-objectmapk-w), [reduce()](#reduceareducer-accumulator-a-value-v-key-k--a-initialvalue-a-a), [sort()](#sortcomparefn-a-k-v-b-k-v--number-this)), factories (e.g. [fromSet()](#static-fromsetk-vset-setlikek-factory-key-k--v-options-objectmapoptions-objectmapk-v), [keysOf()](#static-keysofkobj-mapk-unknown--recordk-unknown-objectsetk)) and others (e.g. [pop()](#popkey-k-v--undefined), [update()](#updatekey-k-updater-value-v--undefined-key-k--v-this)).
- **💯 Has all the numbers**: `objectmap.js` is fast, small, thoroughly tested, side effect free, and is written in TypeScript.

## 🌟 Why Value-Based Comparison Matters
In the modern JavaScript world, *an object is almost always determined solely by information that it contains* - two objects with the same keys and values are considered equal, for virtually all intents and purposes.  
This is not surprising, given some of the common actions modern applications perform on data: they transfer it between services, serialize & deserialize it, and mutate it in a functional flavor (i.e. creating new objects rather than changing the existing onces).  
Together with the increasingly large scale of apps, *referential equality* - that is, declaring that two objects are equal only if they are the very same instance, stored in the same place in memory - is *obsolete*.  
However, JavaScript has no standard way of checking equality of two objects by their data. When dealing with objects directly, you can use an npm package (e.g. [fast-deep-equal](https://www.npmjs.com/package/fast-deep-equal)), but more complex structures such as `Map`s and `Set`s still rely on referential identity (and can't be effectively overriden), making them useless in many situations where they would otherwise be a great fit.

`objectmap.js` was created with this problem exactly in mind - instead of using a kludge to turn objects into primitive values and using those as a map keys, or inefficiently using an array, you can work with complex objects and arrays as keys.


## API
`objectmap.js` exposes four classes - `ObjectMap`, `ObjectSet`, `ImmutableMap` and `ImmutableSet` - as well as some types and utilities.

### ObjectMap\<K, V\>
A HashMap implementation. By default, compares keys by value (deep equality), rather than `Object.is` or similar referential equality.  
Compliant with ES6's Map interface.

#### `new ObjectMap<K, V>(iterable?: Iterable<[K, V]>, options?: ObjectMapOptions)`
The generic parameters `K` and `V` correspond to the key and value type, respectively;
often they can be inferred from the context (especially if an `iterable` is passed), but might night to be supplied explicitly.

**Parameters**: 
- *`iterable`*: an iterable of key-value pairs, used to initialize the map.  
  If this is an `ObjectMap`, this constructor will create a copy. Otherwise, if the iterable has a `length` or `size` property - its value will be used as the initial capacity (can be overriden by `initialCapacity` in `options`).
- *`options`*: constructor options; see [ObjectMapOptions](#objectmapoptions).


To initialize a map without an iterable but with custom options, pass `undefined` as the iterable - `new ObjectMap(undefined, { /* options */ })`.

#### `size: number`
Returns the number of key-value pairs in the map.

#### `isEmpty(): boolean`
Returns `true` if the map is empty (of size `0`), and `false` otherwise.

#### `set(key: K, value: V): this` 
Adds a new element with a specified key and value to the map. If an element with the same key already exists, the element will be updated.  
Returns the map object (`this`), for chaining.

**Parameters**:
- *`key`*: the key to use.
- *`value`*: the value to associate with the key.

#### `get(key: K): V | undefined`
Returns the value associated with the specified key. If no value is associated with the specified key, `undefined` is returned.

**Parameters**:
- *`key`*: the key to search for.

#### `delete(key: K): boolean`
Removes a key-value pair from the map.  
Returns `true` if the pair existed and was removed, or `false` if the key does not exist.

**Parameters**:
- *`key`*: the key to search for.

#### `has(key: K): boolean`
Returns `true` if the map has a value associated with the given `key`, and `false` otherwise.

**Parameters**:
- *`key`*: the key to search for.

#### `clear(): void`
Removes all key-value pairs from the map.

#### `keys(): Generator<K>`
Returns an iterable of keys in the map.

#### `values(): Generator<V>`
Returns an iterable of values in the map.

#### `entries(): Generator<[K, V]>`
Returns an iterable of key, value pairs for every entry in the map.

#### `forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void`
Executes a provided function once per each key/value pair in the map, in insertion order.

**Parameters**:
- *`callbackfn`*: the callback to execute for each pair.
- *`thisArg`*: optional argument to use as the value of `this`.

#### `clone(): ObjectMap<K, V>`
Creates a clone of the map; does not create a deep copy keys or values.
`map.clone()` is equivalent to `new ObjectMap(map)`.

#### `emptyClone<W = V>(): ObjectMap<K, W>`
Returns a map with the same options as `this`, but no keys or values.

#### `filter(predicate: (value: V, key: K) => boolean): ObjectMap<K, V>`
Returns a new map containing only the key-value pairs that satisfy the predicate.
Retains the same options as the original map.

**Parameters**:
- *`predicate`*: the function called to test which pairs to keep. Called once for each key-value pair.

#### `map<W>(transform: (value: V, key: K) => W): ObjectMap<K, W>`
Returns a new map with the same keys, and the results of calling `transform` for each key-value pair as values.

**Parameters**:
- *`transform`*: the function called to transform the map's values. Called once for each key-value pair.

#### `reduce<A>(reducer: (accumulator: A, value: V, key: K) => A, initialValue: A): A`
Calls `reducer` for each key-value pair, accumulating the results into a single value.

**Parameters**:
- *`reducer`*: the function to reduce by. Called once for each key-value pair.

#### `some(predicate: (value: V, key: K) => boolean): boolean`
Returns `true` if the map contains a key-value pair that satisfies the predicate, and `false` otherwise.

**Parameters**:
- *`predicate`*: the predicate called to test key-value pairs by.

#### `every(predicate: (value: V, key: K) => boolean): boolean`
Returns `true` if every key-value pair in the map satisfies the predicate, and `false` otherwise.

**Parameters**:
- *`predicate`*: the predicate called to test key-value pairs by.

#### `sort(compareFn?: (a: [K, V], b: [K, V]) => number): this`
Sorts the map in-place using the provided compare function. uses `Array.prototype.sort` under the hood.

**Parameters**:
- *`compareFn`*: comparator function; passed to `Array.prototype.sort`.

#### `equals(other: ObjectMap<K, V>): boolean`
returns `true` if this map and the other map are equal, and `false` otherwise; equality here is defined as having the same key sets, and the same values for each key. Equality is tested using the `equals` function provided in the constructor options.

**Parameters**:
- *`other`*: the map to test equality against

#### `pop(key: K): V | undefined`
Removes the value associated with the given key, and returns it. This is like `delete()`, except the `value` (or `undefined`) is returned.
If the key is not in the map, returns `undefined`.

**Parameters**:
- *`key`*: the key to search for.

#### `update(key: K, updater: (value: V | undefined, key: K) => V): this`
Updates the value associated with the given key, using the `updater` function. Note that if the key is not in the map, updater will be called with `undefined`.

**Parameters**:
- *`key`*: the key to search for.
- *`updater`*: the transformer to call for the associated value.

#### `capacity: number`
Returns the number of buckets in the map, mostly intended for internal purposes.

#### `options: Omit<ObjectMapOptions, 'initialCapacity'>`
The current options used by the map, mostly intended for internal purposes.
Note, this is a getter - changing this does not actually change the map's options.

#### `static fromSet<K, V>(set: SetLike<K>, factory: (key: K) => V, options?: ObjectMapOptions): ObjectMap<K, V>`
Static factory for creating a map from a set-like object and a function.

**Parameters**:
- *`set`*: a [set-like](#setliket) object to get the map's keys from
- *`factory`*: called for each key, the result is used as the new map's value.
- *`options`*: optional constructor options.




### ImmutableMap\<K, V\>
`ImmutableMap` is the immutable variant of `ObjectMap`, all mutating methods return a new `ImmutableMap` with the changes applied rather than mutating the current instance.  
That means `ImmutableMap`'s API is the same as `ObjectMap`'s API except for the following differences:

#### `set(key: K, value: V): ImmutableMap<K, V>`
Returns a new map with the given `value` associated with the given `key` (whether the value is updated from an old one or added).

#### `delete(key: K): ImmutableMap<K, V>`
Returns a new map with the given key removed, if it was present.

#### `clear(): ImmutableMap<K, V>`
Returns an empty clone of this map.

#### `sort(compareFn?: (a: [K, V], b: [K, V]) => number): ImmutableMap<K, V>`
Returns a new map with the same keys, sorted by the given function.

#### `update(key: K, updater: (value: V | undefined, key: K) => V): ImmutableMap<K, V>`
Returns a new map with the value for the given key updated to the result of `updater`.




### ObjectSet\<T\>
A Set implementation. By default, compares keys by value (deep equality), rather than `Object.is` or similar referential equality.  
Compliant with ES6's Set interface.

#### `new ObjectSet<T>(iterable?: Iterable<T>, options?: ObjectMapOptions)`
The generic parameter `T` marks the set member type; it can often be inferred from the context (especially if an `iterable` is passed), but might night to be supplied explicitly.

**Parameters**: 
- *`iterable`*: an iterable, used to initialize the map.  
  If this is an `ObjectSet`, this constructor will create a copy. Otherwise, if the iterable has a `length` or `size` property - its value will be used as the initial capacity (can be overriden by `initialCapacity` in `options`).
- *`options`*: constructor options; see [ObjectMapOptions](#objectmapoptions).

#### `size: number`
Returns the number of members in the set.

#### `isEmpty(): boolean`
Returns `true` if the set is empty (of size `0`), and `false` otherwise.

#### `add(value: T): this`
Appends the given value to the set; if it's already present, nothing is changed.

**Parameters**:
- *`value`*: the value to add.

#### `has(value: T): boolean`
Returns `true` if the value is a member of the set, and `false` otherwise.

**Parameters**:
- *`value`*: the value to search for.

#### `delete(value: T): boolean`
Removes the given value from the set.  
Returns `true` if value was a member and was removed, or `false` if the key does not exist.

**Parameters**:
- *`value`*: the value to delete.

#### `clear(): void`
Removes all members from the set.

#### `keys(): IterableIterator<T>`
Iterates all members of the set, in insertion order.

#### `values(): IterableIterator<T>`
Iterates all members of the set, in insertion order.

#### `entries(): IterableIterator<[T, T]>`
Yields an iterable of `[v,v]` pairs for every value v in the set.

#### `forEach(callbackfn: (value: T, key: T, set: ObjectSet<T>) => void, thisArg?: any): void`
Executes a provided function once per each member in the set, in insertion order.

**Parameters**:
- *`callbackfn`*: the callback to execute for each member.
- *`thisArg`*: optional argument to use as the value of `this`.

#### `clone(): ObjectSet<T>`
Creates a clone of the set; does not create a deep copy of the members.
`set.clone()` is equivalent to `new ObjectSet(set)`.

#### ` emptyClone<S = T>(): ObjectSet<S>`
Returns a new set with the same options as this but no keys or values.

#### `filter(predicate: (value: T) => boolean): ObjectSet<T>`
Returns a new set containing only the members that satisfy the predicate.
Retains the same options as the original set.

**Parameters**:
- *`predicate`*: the function called to test which members to keep. Called once for each member.

#### `map<S>(transform: (value: T) => S): ObjectSet<S>`
Returns a new set containing the results of calling `transform` on each member.

**Parameters**:
- *`transform`*: the function called to transform the set's values. Called once for each key-value pair.

#### `reduce<A>(reducer: (accumulator: A, value: T) => A, initialValue: A): A`
Calls `reducer` for each member, accumulating the results into a single value.

**Parameters**:
- *`reducer`*: the function to reduce by. Called once for each member.

#### `some(predicate: (value: T) => boolean): boolean`
Returns `true` if the set contains a member that satisfies the predicate, and `false` otherwise.

**Parameters**:
- *`predicate`*: the predicate to test members by.

#### `every(predicate: (value: T) => boolean): boolean`
Returns `true` if every member in the set satisfies the predicate,
and `false` otherwise.

**Parameters**:
- *`predicate`*: the predicate to test members by.

#### `sort(compareFn?: (a: T, b: T) => number): this`
Sorts the set in-place using the provided compare function. uses `Array.prototype.sort` under the hood.

**Parameters**:
- *`compareFn`*: comparator function; passed to `Array.prototype.sort`.

#### `equals(other: ObjectSet<T>): boolean`
Returns `true` if this set and the other set are equal; equality here is defined as having exactly the same members. Equality of members is tested using the `equals` function provided in the constructor options.

**Parameters**:
- *`other`*: the set to test equality against.

#### `intersection(other: SetLike<T>): ObjectSet<T>`
Returns a new set containing exactly the members that are both in this set and in `other`.

**Parameters**:
- *`other`*: the [set-like](#setliket) object to intersect with.

#### `union(other: SetLike<T>): ObjectSet<T>`
Returns a new set containing exactly the members that are either in this set, in `other` or both.

**Parameters**:
- *`other`*: the [set-like](#setliket) object to take the union with.

#### `difference(other: SetLike<T>): ObjectSet<T>`
Returns a new set containing exactly the members that are in this set but not in `other`.

**Parameters**:
- *`other`*: the [set-like](#setliket) object to diff from this set.

#### `symmetricDifference(other: SetLike<T>): ObjectSet<T>`
Returns a new set containing exactly the members that are in this set or in `other`, but not in both.

**Parameters**:
- *`other`*: the [set-like](#setliket) object to take the symmetric difference with respect to.

#### `isSubsetOf(other: SetLike<T>): boolean`
Returns `true` if every element in this set is also in `other`, and `false` otherwise.

**Parameters**:
- *`other`*: the [set-like](#setliket) object to check against.

#### `isSupersetOf(other: SetLike<T>): boolean`
Returns `true` if this set contains every element in `other`, and `false` otherwise.

**Parameters**:
- *`other`*: the [set-like](#setliket) object to check against.

#### `isDisjointFrom(other: SetLike<T>): boolean`
Returns `true` if this set and `other` have no members in common, and `false` otherwise.

**Parameters**:
- *`other`*: the [set-like](#setliket) object to check against.

#### `static keysOf<K>(obj: Map<K, unknown> | Record<K, unknown>): ObjectSet<K>`
Creates an `ObjectSet` from the keys of a `Map` (possibly an `ObjectMap`) or an object.

**Parameters**:
- *`obj`*: the map or object to take the keys of.

#### `static valuesOf<V>(obj: Map<unknown, V> | Record<any, V>): ObjectSet<V>`
Creates an `ObjectSet` from the values of a `Map` (possibly an `ObjectMap`) or an object.

**Parameters**:
- *`obj`*: the map or object to take the values of.

### ImmutableSet\<K, V\>
`ImmutableSet` is the immutable variant of `ObjectSet`, all mutating methods return a new `ImmutableSet` with the changes applied rather than mutating the current instance.  
That means `ImmutableSet`'s API is the same as `ObjectSet`'s API except for the following differences:

#### `add(value: T): ImmutableSet<T>`
Returns a new set with the given value added as a member.

#### `delete(value: T): ImmutableSet<T>`
Returns a new set with the given value excluded.

#### `clear(): ImmutableSet<T>`
Returns an empty clone of this set.

#### ` sort(compareFn?: (a: T, b: T) => number): ImmutableSet<T>`
Returns a new set with the same members, sorted by the given function.



### ObjectMapOptions
Constructor options for the `ObjectMap`, `ObjectSet`, `ImmutableMap` and `ImmutableSet` classes.

#### `initialCapacity?: number`
The initial capacity of the map; defaults to `32`.
For a map with constant capacity, set this together with `loadFactor=1`

#### `loadFactor?: number`
The threshold above which the map will resize; defaults to `0.75`.
For a map that never resizes, set this to `1`.

#### `equals?: (a: unknown, b: unknown) => boolean`
The function used to compare keys for equality; defaults to a deep equality function (exported as `equals`).

#### `hash?: (value: unknown) => number`
The function used to hash keys; defaults to a deep hash function (exported as `hash`).



### SetLike\<T\>
A set-like object, as per the [mozilla docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#set-like_objects)

#### `size: number`
#### `has(value: T): boolean`
#### `keys(): IterableIterator<T>`