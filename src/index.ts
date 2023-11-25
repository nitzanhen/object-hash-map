import { hash } from './hash';

export const x = 4;

console.log(hash({ x: 3 }));
console.log(hash({ x: 4 }));

class Foo {
  constructor(public x: number) {}
}

console.log(hash(new Foo(3)));



