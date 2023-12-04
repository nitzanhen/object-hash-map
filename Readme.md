<h1 align="center">object-hash-map</h1>

<p align="center">
  A HashMap for the modern Javascript world
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/object-hash-map">
    <img src="https://img.shields.io/npm/v/object-hash-map" alt="npm" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/github/languages/top/nitzanhen/object-hash-map" alt="typescript" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/github/license/nitzanhen/object-hash-map" alt="license" />
  </a>
</p>

```
npm install object-hash-map
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

// ... but has a lot more to offer
// todo
```

```ts
// Features a `Set` implementation, too

const friends = new ObjectSet<{ name: string }>();
friends.add({ name: "Foo" });

// In ES2015's Set, this returns `false`
console.log(friends.has({ name: "Foo" })) // `true`

// And immutable versions, too
// todo
```

## Features
- **⚡ Compare keys by value, not by reference**: Referential equality is outdated - JavaScript objects are nowadays compared by the information they engrain.  
`object-hash-map`'s crown feature is hashing and comparing objects by value rather than their place in memory; you'll find that `ObjectMap` and `ObjectSet` are a natural fit where the native `Map` and `Set` should have been (read more [below]()).
- **🧰 Equipped with utilities**: alongside the standard `Map` and `Set` interfaces, `object-hash-map` provides convenient methods for dealing with collections ([filter()](), [map()](), [reduce()](), [sort()](), etc.), factories (*todo*) and others.
- **💯 Has all the numbers**: `object-hash-map` is fast, small, thoroughly tested, side effect free, and is written in TypeScript.

## 🌟 Why Value-Based Comparison Matters
In the modern JavaScript world, *an object is almost always determined solely by information that it contains* - two objects with the same keys and values are considered equal, for virtually all intents and purposes.  
This is not surprising, given some of the common actions modern applications perform on data: they transfer it between services, serialize & deserialize it, and mutate it in a functional flavor (i.e. creating new objects rather than changing the existing onces).  
Together with the increasingly large scale of apps, *referential equality* - that is, declaring that two objects are equal only if they are the very same instance, stored in the same place in memory - is *obsolete*.  
However, JavaScript has no standard way of checking equality of two objects by their data. When dealing with objects directly, you can use an npm package (e.g. [fast-deep-equal](https://www.npmjs.com/package/fast-deep-equal)), but more complex structures such as `Map`s and `Set`s still rely on referential identity (and can't be effectively overriden), making them useless in many situations where they would otherwise be a great fit.

`object-hash-map` was created with this problem exactly in mind - instead of using a kludge to turn objects into primitive values and using those as a map keys, or inefficiently using an array, you can work with complex objects and arrays as keys.


## API
todo