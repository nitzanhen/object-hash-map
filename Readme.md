<h1 align="center">ObjectMap</h1>

<p align="center">
  A HashMap for the modern Javascript world
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nitzanhen/objectmap">
    <img src="https://img.shields.io/npm/v/@nitzanhen/objectmap" alt="npm" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/github/languages/top/nitzanhen/objectmap" alt="typescript" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/github/license/nitzanhen/objectmap" alt="license" />
  </a>
</p>

<br/>

```
npm install @nitzanhen/objectmap
```

```ts
// Compares keys by *data*, not by object identity

const friendCounts = new ObjectMap<{ name: string }, number>();
friendCounts.set({ name: "Foo" }, 4);
friendCounts.set({ name: "Bar" }, 6);

// In ES2015's Map, these return "undefined"
console.log(friendCoutns.get({ name: "Foo" })) // 4
console.log(friendCoutns.get({ name: "Bar" })) // 6

// Features a `Set` implementation, too
const friends = new ObjectSet<{ name: string }>();

```

```ts
// Compliant with ES2015's Map API
const om = new ObjectMap();


// ... but has a lot more to offer
om.map()
om.filter()


```



## Features