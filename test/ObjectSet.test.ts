import { describe, test, expect, vi } from 'vitest';
import { ObjectMap, ObjectSet, equals, hash } from '../src';

type ObjectKey = { id: number };

function _equals(a: unknown, b: unknown) {
  return equals(a, b);
}
function _hash(value: unknown) {
  return hash(value);
}

describe('ObjectSet', () => {
  describe('Constructor & internal logic', test => {
    test('reads iterable entries, if passed', () => {
      const fromArray = new ObjectSet([1, 2]);
      expect(fromArray.size).toBe(2);
      expect(fromArray.has(1)).toBe(true);
      expect(fromArray.has(2)).toBe(true);

      const fromSet = new ObjectSet(new Set([1, 2]));
      expect(fromSet.size).toBe(2);
      expect(fromSet.has(1)).toBe(true);
      expect(fromSet.has(2)).toBe(true);

      function* generator() {
        yield 1;
        yield 2;
      }
      const fromGenerator = new ObjectSet(generator());
      expect(fromGenerator.size).toBe(2);
      expect(fromGenerator.has(1)).toBe(true);
      expect(fromGenerator.has(2)).toBe(true);

      const fromObjectSet = new ObjectSet(fromArray);
      expect(fromObjectSet.size).toBe(2);
      expect(fromObjectSet.has(1)).toBe(true);
      expect(fromObjectSet.has(2)).toBe(true);
    })
    test('handles options', () => {
      const customOptions = new ObjectSet(undefined, {
        initialCapacity: 1,
        loadFactor: 2,
        hash: _hash,
        equals: _equals,
      })

      expect(customOptions.options).toEqual({
        loadFactor: 2,
        hash: _hash,
        equals: _equals,
      });
    })
    test('copy constructor', () => {
      const set = new ObjectSet([1, 2]);
      const copy = new ObjectSet(set);

      expect(copy).toBeInstanceOf(ObjectSet);
      expect(copy === set).toBe(false);
      expect(copy.equals(set)).toBe(true);

      expect(copy.options).toEqual(set.options);
      expect(copy.size).toBe(2);

      expect(copy.has(1)).toBe(true);
      expect(copy.has(2)).toBe(true);
    })
    test('copy constructor with options', () => {
      const set = new ObjectSet([1, 2]);
      const copy = new ObjectSet(set, {
        initialCapacity: 100,
        loadFactor: 1,
        hash: _hash,
        equals: _equals,
      });

      expect(copy).toBeInstanceOf(ObjectSet);
      expect(copy === set).toBe(false);

      expect(copy.options).toEqual({
        loadFactor: 1,
        hash: _hash,
        equals: _equals,
      });
      expect(copy.size).toBe(2);

      expect(copy.has(1)).toBe(true);
      expect(copy.has(2)).toBe(true);
    })

    test('options carry over to clones', () => {
      const options = {
        loadFactor: 1,
        hash: _hash,
        equals: _equals,
      };

      const set = new ObjectSet([1, 2], options);
      expect(set.options).toEqual(options);

      const clone = set.clone();
      expect(clone.options).toEqual(options);

      const emptyClone = set.emptyClone();
      expect(emptyClone.options).toEqual(options);

      const keys1 = ObjectSet.keysOf(new Map([['a', 1], ['b', 2]]), options);
      expect(keys1.options).toEqual(options);
      const keys2 = ObjectSet.keysOf({ a: 1, b: 2 }, options);
      expect(keys2.options).toEqual(options);

      const values1 = ObjectSet.valuesOf(new Map([['a', 1], ['b', 2]]), options);
      expect(values1.options).toEqual(options);
      const values2 = ObjectSet.valuesOf({ a: 1, b: 2 }, options);
      expect(values2.options).toEqual(options);
    })
  })

  describe('ES6 Set API', test => {
    test('add() & has()', () => {
      const primitive = new ObjectSet<number>();

      primitive.add(1);
      expect(primitive.has(1)).toBe(true);

      primitive.add(2);
      expect(primitive.size).toBe(2);
      expect(primitive.has(2)).toBe(true);

      primitive.add(1);
      expect(primitive.has(1)).toBe(true);

      expect(primitive.has(3)).toBe(false);

      const object = new ObjectSet<ObjectKey>();
      object.add({ id: 1 });
      expect(object.has({ id: 1 })).toBe(true);

      object.add({ id: 2 });
      expect(object.has({ id: 2 })).toBe(true);

      object.add({ id: 1 });
      expect(object.has({ id: 1 })).toBe(true);

      expect(object.has({ id: 3 })).toBe(false);
    });

    test('delete()', () => {
      const primitive = new ObjectSet<number>();
      primitive.add(1);
      expect(primitive.delete(1)).toBe(true);
      expect(primitive.has(1)).toBe(false);
      expect(primitive.delete(2)).toBe(false);

      const object = new ObjectSet<ObjectKey>();
      object.add({ id: 1 });
      expect(object.delete({ id: 1 })).toBe(true);
      expect(object.has({ id: 1 })).toBe(false);
      expect(object.delete({ id: 2 })).toBe(false);
    });

    test('clear()', () => {
      const primitive = new ObjectSet<number>();
      primitive.add(1);
      primitive.add(2);
      primitive.clear();
      expect(primitive.has(1)).toBe(false);
      expect(primitive.has(2)).toBe(false);

      const object = new ObjectSet<ObjectKey>();
      object.add({ id: 1 });
      object.add({ id: 2 });
      object.clear();
      expect(object.has({ id: 1 })).toBe(false);
      expect(object.has({ id: 2 })).toBe(false);
    });

    test('size', () => {
      const primitive = new ObjectSet<number>();
      expect(primitive.size).toBe(0);
      primitive.add(1);
      expect(primitive.size).toBe(1);
      primitive.add(2);
      expect(primitive.size).toBe(2);
      primitive.add(1);
      expect(primitive.size).toBe(2);
      primitive.clear();
      expect(primitive.size).toBe(0);

      const object = new ObjectSet<ObjectKey>();
      expect(object.size).toBe(0);
      object.add({ id: 1 });
      expect(object.size).toBe(1);
      object.add({ id: 2 });
      expect(object.size).toBe(2);
      object.add({ id: 1 });
      expect(object.size).toBe(2);
      object.clear();
      expect(object.size).toBe(0);
    });

    test('keys()', () => {
      const primitive = new ObjectSet<number>();
      primitive.add(1);
      primitive.add(2);
      expect([...primitive.keys()]).toEqual([1, 2]);
      primitive.add(1);
      expect([...primitive.keys()]).toEqual([1, 2]);
      primitive.delete(1);
      expect([...primitive.keys()]).toEqual([2]);

      const object = new ObjectSet<ObjectKey>();
      object.add({ id: 1 });
      object.add({ id: 2 });
      expect([...object.keys()]).toEqual([{ id: 1 }, { id: 2 }]);
      object.add({ id: 1 });
      expect([...object.keys()]).toEqual([{ id: 1 }, { id: 2 }]);
      object.delete({ id: 1 });
      expect([...object.keys()]).toEqual([{ id: 2 }]);
    });

    test('values()', () => {
      const primitive = new ObjectSet<number>();
      primitive.add(1);
      primitive.add(2);
      expect([...primitive.values()]).toEqual([1, 2]);
      primitive.add(1);
      expect([...primitive.values()]).toEqual([1, 2]);
      primitive.delete(1);
      expect([...primitive.values()]).toEqual([2]);

      const object = new ObjectSet<ObjectKey>();
      object.add({ id: 1 });
      object.add({ id: 2 });
      expect([...object.values()]).toEqual([{ id: 1 }, { id: 2 }]);
      object.add({ id: 1 });
      expect([...object.values()]).toEqual([{ id: 1 }, { id: 2 }]);
      object.delete({ id: 1 });
      expect([...object.values()]).toEqual([{ id: 2 }]);
    });

    test('entries()', () => {
      const primitive = new ObjectSet<number>();
      primitive.add(1);
      primitive.add(2);
      expect([...primitive.entries()]).toEqual([[1, 1], [2, 2]]);
      primitive.add(1);
      expect([...primitive.entries()]).toEqual([[1, 1], [2, 2]]);
      primitive.delete(1);
      expect([...primitive.entries()]).toEqual([[2, 2]]);

      const object = new ObjectSet<ObjectKey>();
      object.add({ id: 1 });
      object.add({ id: 2 });
      expect([...object.entries()]).toEqual([[{ id: 1 }, { id: 1 }], [{ id: 2 }, { id: 2 }]]);
      object.add({ id: 1 });
      expect([...object.entries()]).toEqual([[{ id: 1 }, { id: 1 }], [{ id: 2 }, { id: 2 }]]);
      object.delete({ id: 1 });
      expect([...object.entries()]).toEqual([[{ id: 2 }, { id: 2 }]]);
    });

    test('forEach()', () => {
      const primitive = new ObjectSet<number>();
      primitive.add(1);
      primitive.add(2);
      const primitiveCallback = vi.fn<[v: number, k: number, set: Set<number>], void>();
      primitive.forEach(primitiveCallback);
      expect(primitiveCallback).toHaveBeenCalledTimes(2);
      expect(primitiveCallback).toHaveBeenCalledWith(1, 1, primitive);
      expect(primitiveCallback).toHaveBeenCalledWith(2, 2, primitive);

      const object = new ObjectSet<ObjectKey>();
      object.add({ id: 1 });
      object.add({ id: 2 });
      const objectCallback = vi.fn<[v: ObjectKey, k: ObjectKey, set: Set<ObjectKey>], void>();
      object.forEach(objectCallback);
      expect(objectCallback).toHaveBeenCalledTimes(2);
      expect(objectCallback).toHaveBeenCalledWith({ id: 1 }, { id: 1 }, object);
      expect(objectCallback).toHaveBeenCalledWith({ id: 2 }, { id: 2 }, object);
    });

    test('toStringTag', () => {
      const primitive = new ObjectSet<number>();
      expect(primitive.toString()).toBe('[object ObjectSet]');

      const object = new ObjectSet<ObjectKey>();
      expect(object.toString()).toBe('[object ObjectSet]');
    });
  })

  describe('Additional methods', test => {
    test('isEmpty()', () => {
      const primitive = new ObjectSet<number>();
      expect(primitive.isEmpty()).toBe(true);
      primitive.add(1);
      expect(primitive.isEmpty()).toBe(false);
      primitive.delete(1);
      expect(primitive.isEmpty()).toBe(true);

      const object = new ObjectSet<ObjectKey>();
      expect(object.isEmpty()).toBe(true);
      object.add({ id: 1 });
      expect(object.isEmpty()).toBe(false);
      object.delete({ id: 1 });
      expect(object.isEmpty()).toBe(true);
    });

    test('equals()', () => {
      const primitive1 = new ObjectSet<number>([1, 2]);
      const primitive2 = new ObjectSet<number>([1, 2]);
      const primitive3 = new ObjectSet<number>([1, 3]);
      const primitive4 = new ObjectSet<number>([1, 2, 3]);
      expect(primitive1.equals(primitive2)).toBe(true);
      expect(primitive1.equals(primitive3)).toBe(false);
      expect(primitive1.equals(primitive4)).toBe(false);

      const object1 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }]);
      const object2 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }]);
      const object3 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 3 }]);
      const object4 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      expect(object1.equals(object2)).toBe(true);
      expect(object1.equals(object3)).toBe(false);
      expect(object1.equals(object4)).toBe(false);
    });

    test('clone()', () => {
      const primitive = new ObjectSet<number>([1, 2]);
      const primitiveClone = primitive.clone();

      expect(primitiveClone).toBeInstanceOf(ObjectSet);
      expect(primitiveClone === primitive).toBe(false);
      expect(primitiveClone.equals(primitive)).toBe(true);
      expect(primitiveClone.size).toBe(2);

      expect(primitiveClone.has(1)).toBe(true);
      expect(primitiveClone.has(2)).toBe(true);

      const object = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }]);
      const objectClone = object.clone();

      expect(objectClone).toBeInstanceOf(ObjectSet);
      expect(objectClone === object).toBe(false);
      expect(objectClone.equals(object)).toBe(true);
      expect(objectClone.size).toBe(2);

      expect(objectClone.has({ id: 1 })).toBe(true);
      expect(objectClone.has({ id: 2 })).toBe(true);
    });

    test('emptyClone()', () => {
      const primitive = new ObjectSet<number>([1, 2]);
      const primitiveClone = primitive.emptyClone();

      expect(primitiveClone).toBeInstanceOf(ObjectSet);
      expect(primitiveClone === primitive).toBe(false);
      expect(primitiveClone.equals(primitive)).toBe(false);

      expect(primitiveClone.options).toEqual(primitive.options);
      expect(primitiveClone.size).toBe(0);

      expect(primitiveClone.has(1)).toBe(false);
      expect(primitiveClone.has(2)).toBe(false);

      const object = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }]);
      const objectClone = object.emptyClone();

      expect(objectClone).toBeInstanceOf(ObjectSet);
      expect(objectClone === object).toBe(false);
      expect(objectClone.equals(object)).toBe(false);

      expect(objectClone.options).toEqual(object.options);
      expect(objectClone.size).toBe(0);

      expect(objectClone.has({ id: 1 })).toBe(false);
      expect(objectClone.has({ id: 2 })).toBe(false);
    });

    test('filter()', () => {
      const primitive = new ObjectSet<number>([1, 2, 3]);
      const primitiveOdds = primitive.filter(v => v % 2 !== 0);
      expect(primitiveOdds).toBeInstanceOf(ObjectSet);
      expect(primitiveOdds === primitive).toBe(false);
      expect(primitiveOdds.size).toBe(2);
      expect([...primitiveOdds.keys()]).toEqual([1, 3]);

      const object = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const objectFiltered = object.filter(v => v.id % 2 === 1);
      expect(objectFiltered).toBeInstanceOf(ObjectSet);
      expect(objectFiltered === object).toBe(false);
      expect(objectFiltered.size).toBe(2);
      expect([...objectFiltered.keys()]).toEqual([{ id: 1 }, { id: 3 }]);
    });

    test('map()', () => {
      const primitive = new ObjectSet<number>([1, 2, 3]);
      const primitiveMapped = primitive.map(v => v ** 2);
      expect(primitiveMapped).toBeInstanceOf(ObjectSet);
      expect(primitiveMapped === primitive).toBe(false);
      expect(primitiveMapped.size).toBe(3);
      expect([...primitiveMapped.keys()]).toEqual([1, 4, 9]);

      const object = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const objectMapped = object.map(v => ({ id: v.id ** 2 }));
      expect(objectMapped).toBeInstanceOf(ObjectSet);
      expect(objectMapped === object).toBe(false);
      expect(objectMapped.size).toBe(3);
      expect([...objectMapped.keys()]).toEqual([{ id: 1 }, { id: 4 }, { id: 9 }]);
    });

    test('reduce()', () => {
      const primitive = new ObjectSet<number>([1, 2, 3]);
      const primitiveSum = primitive.reduce((acc, v) => acc + v, 0);
      expect(primitiveSum).toBe(6);
      const primitiveProduct = primitive.reduce((acc, v) => acc * v, 1);
      expect(primitiveProduct).toBe(6);

      const object = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const sum = object.reduce((acc, v) => acc + v.id, 0);
      expect(sum).toBe(6);
      const product = object.reduce((acc, v) => acc * v.id, 1);
      expect(product).toBe(6);
    });

    test('some()', () => {
      const primitive = new ObjectSet<number>([1, 2, 3]);
      const primitiveSome = primitive.some(v => v % 2 === 0);
      expect(primitiveSome).toBe(true);
      const primitiveNone = primitive.some(v => v % 4 === 0);
      expect(primitiveNone).toBe(false);

      const object = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const objectSome = object.some(v => v.id % 2 === 0);
      expect(objectSome).toBe(true);
      const objectNone = object.some(v => v.id % 4 === 0);
      expect(objectNone).toBe(false);
    });

    test('every()', () => {
      const primitive = new ObjectSet<number>([1, 2, 3]);
      const primitiveEvery = primitive.every(v => v < 4);
      expect(primitiveEvery).toBe(true);
      const primitiveNotEvery = primitive.every(v => v < 3);
      expect(primitiveNotEvery).toBe(false);

      const object = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const objectEvery = object.every(v => v.id < 4);
      expect(objectEvery).toBe(true);
      const objectNotEvery = object.every(v => v.id < 3);
      expect(objectNotEvery).toBe(false);
    });

    test('sort()', () => {
      const primitive = new ObjectSet<number>([1, 2, 3]);
      const primitiveSorted = primitive.sort((a, b) => b - a);
      expect(primitiveSorted === primitive).toBe(true);
      expect([...primitiveSorted.keys()]).toEqual([3, 2, 1]);

      const object = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const objectSorted = object.sort((a, b) => b.id - a.id);
      expect(objectSorted === object).toBe(true);
      expect([...objectSorted.keys()]).toEqual([{ id: 3 }, { id: 2 }, { id: 1 }]);
    });
  })

  describe('Set operations', test => {
    test('intersection()', () => {
      const primitive1 = new ObjectSet<number>([1, 2, 3]);
      const primitive2 = new ObjectSet<number>([2, 3, 4]);
      const primitive3 = new ObjectSet<number>([4, 5, 6]);

      const primitiveIntersection12 = primitive1.intersection(primitive2);
      expect(primitiveIntersection12).toBeInstanceOf(ObjectSet);
      expect(primitiveIntersection12 === primitive1).toBe(false);
      expect(primitiveIntersection12 === primitive2).toBe(false);
      expect(primitiveIntersection12.size).toBe(2);
      expect([...primitiveIntersection12.keys()]).toEqual([2, 3]);

      const primitiveIntersection13 = primitive1.intersection(primitive3);
      expect(primitiveIntersection13).toBeInstanceOf(ObjectSet);
      expect(primitiveIntersection13 === primitive1).toBe(false);
      expect(primitiveIntersection13 === primitive3).toBe(false);
      expect(primitiveIntersection13.size).toBe(0);
      expect([...primitiveIntersection13.keys()]).toEqual([]);

      const object1 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ObjectSet<ObjectKey>([{ id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ObjectSet<ObjectKey>([{ id: 4 }, { id: 5 }, { id: 6 }]);

      const objectIntersection12 = object1.intersection(object2);
      expect(objectIntersection12).toBeInstanceOf(ObjectSet);
      expect(objectIntersection12 === object1).toBe(false);
      expect(objectIntersection12 === object2).toBe(false);
      expect(objectIntersection12.size).toBe(2);
      expect([...objectIntersection12.keys()]).toEqual([{ id: 2 }, { id: 3 }]);

      const objectIntersection13 = object1.intersection(object3);
      expect(objectIntersection13).toBeInstanceOf(ObjectSet);
      expect(objectIntersection13 === object1).toBe(false);
      expect(objectIntersection13 === object3).toBe(false);
      expect(objectIntersection13.size).toBe(0);
      expect([...objectIntersection13.keys()]).toEqual([]);
    });

    test('union()', () => {
      const primitive1 = new ObjectSet<number>([1, 2, 3]);
      const primitive2 = new ObjectSet<number>([2, 3, 4]);
      const primitive3 = new ObjectSet<number>([4, 5, 6]);

      const primitiveUnion12 = primitive1.union(primitive2);
      expect(primitiveUnion12).toBeInstanceOf(ObjectSet);
      expect(primitiveUnion12 === primitive1).toBe(false);
      expect(primitiveUnion12 === primitive2).toBe(false);
      expect(primitiveUnion12.size).toBe(4);
      expect([...primitiveUnion12.keys()]).toEqual([1, 2, 3, 4]);

      const primitiveUnion13 = primitive1.union(primitive3);
      expect(primitiveUnion13).toBeInstanceOf(ObjectSet);
      expect(primitiveUnion13 === primitive1).toBe(false);
      expect(primitiveUnion13 === primitive3).toBe(false);
      expect(primitiveUnion13.size).toBe(6);
      expect([...primitiveUnion13.keys()]).toEqual([1, 2, 3, 4, 5, 6]);

      const object1 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ObjectSet<ObjectKey>([{ id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ObjectSet<ObjectKey>([{ id: 4 }, { id: 5 }, { id: 6 }]);

      const objectUnion12 = object1.union(object2);
      expect(objectUnion12).toBeInstanceOf(ObjectSet);
      expect(objectUnion12 === object1).toBe(false);
      expect(objectUnion12 === object2).toBe(false);
      expect(objectUnion12.size).toBe(4);
      expect([...objectUnion12.keys()]).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);

      const objectUnion13 = object1.union(object3);
      expect(objectUnion13).toBeInstanceOf(ObjectSet);
      expect(objectUnion13 === object1).toBe(false);
      expect(objectUnion13 === object3).toBe(false);
      expect(objectUnion13.size).toBe(6);
      expect([...objectUnion13.keys()]).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }]);
    });

    test('difference()', () => {
      const primitive1 = new ObjectSet<number>([1, 2, 3]);
      const primitive2 = new ObjectSet<number>([2, 3, 4]);
      const primitive3 = new ObjectSet<number>([4, 5, 6]);

      const primitiveDifference12 = primitive1.difference(primitive2);
      expect(primitiveDifference12).toBeInstanceOf(ObjectSet);
      expect(primitiveDifference12 === primitive1).toBe(false);
      expect(primitiveDifference12 === primitive2).toBe(false);
      expect(primitiveDifference12.size).toBe(1);
      expect([...primitiveDifference12.keys()]).toEqual([1]);

      const primitiveDifference13 = primitive1.difference(primitive3);
      expect(primitiveDifference13).toBeInstanceOf(ObjectSet);
      expect(primitiveDifference13 === primitive1).toBe(false);
      expect(primitiveDifference13 === primitive3).toBe(false);
      expect(primitiveDifference13.size).toBe(3);
      expect([...primitiveDifference13.keys()]).toEqual([1, 2, 3]);

      const object1 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ObjectSet<ObjectKey>([{ id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ObjectSet<ObjectKey>([{ id: 4 }, { id: 5 }, { id: 6 }]);

      const objectDifference12 = object1.difference(object2);
      expect(objectDifference12).toBeInstanceOf(ObjectSet);
      expect(objectDifference12 === object1).toBe(false);
      expect(objectDifference12 === object2).toBe(false);
      expect(objectDifference12.size).toBe(1);
      expect([...objectDifference12.keys()]).toEqual([{ id: 1 }]);

      const objectDifference13 = object1.difference(object3);
      expect(objectDifference13).toBeInstanceOf(ObjectSet);
      expect(objectDifference13 === object1).toBe(false);
      expect(objectDifference13 === object3).toBe(false);
      expect(objectDifference13.size).toBe(3);
      expect([...objectDifference13.keys()]).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    test('symmetricDifference()', () => {
      const primitive1 = new ObjectSet<number>([1, 2, 3]);
      const primitive2 = new ObjectSet<number>([2, 3, 4]);
      const primitive3 = new ObjectSet<number>([4, 5, 6]);

      const primitiveSymmetricDifference12 = primitive1.symmetricDifference(primitive2);
      expect(primitiveSymmetricDifference12).toBeInstanceOf(ObjectSet);
      expect(primitiveSymmetricDifference12 === primitive1).toBe(false);
      expect(primitiveSymmetricDifference12 === primitive2).toBe(false);
      expect(primitiveSymmetricDifference12.size).toBe(2);
      expect([...primitiveSymmetricDifference12.keys()]).toEqual([1, 4]);

      const primitiveSymmetricDifference13 = primitive1.symmetricDifference(primitive3);
      expect(primitiveSymmetricDifference13).toBeInstanceOf(ObjectSet);
      expect(primitiveSymmetricDifference13 === primitive1).toBe(false);
      expect(primitiveSymmetricDifference13 === primitive3).toBe(false);
      expect(primitiveSymmetricDifference13.size).toBe(6);
      expect([...primitiveSymmetricDifference13.keys()]).toEqual([1, 2, 3, 4, 5, 6]);

      const primitiveSymmetricDifference23 = primitive2.symmetricDifference(primitive3);
      expect(primitiveSymmetricDifference23).toBeInstanceOf(ObjectSet);
      expect(primitiveSymmetricDifference23 === primitive2).toBe(false);
      expect(primitiveSymmetricDifference23 === primitive3).toBe(false);
      expect(primitiveSymmetricDifference23.size).toBe(4);
      expect([...primitiveSymmetricDifference23.keys()]).toEqual([2, 3, 5, 6]);

      const object1 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ObjectSet<ObjectKey>([{ id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ObjectSet<ObjectKey>([{ id: 4 }, { id: 5 }, { id: 6 }]);

      const objectSymmetricDifference12 = object1.symmetricDifference(object2);
      expect(objectSymmetricDifference12).toBeInstanceOf(ObjectSet);
      expect(objectSymmetricDifference12 === object1).toBe(false);
      expect(objectSymmetricDifference12 === object2).toBe(false);
      expect(objectSymmetricDifference12.size).toBe(2);
      expect([...objectSymmetricDifference12.keys()]).toEqual([{ id: 1 }, { id: 4 }]);

      const objectSymmetricDifference13 = object1.symmetricDifference(object3);
      expect(objectSymmetricDifference13).toBeInstanceOf(ObjectSet);
      expect(objectSymmetricDifference13 === object1).toBe(false);
      expect(objectSymmetricDifference13 === object3).toBe(false);
      expect(objectSymmetricDifference13.size).toBe(6);
      expect([...objectSymmetricDifference13.keys()]).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }]);

      const objectSymmetricDifference23 = object2.symmetricDifference(object3);
      expect(objectSymmetricDifference23).toBeInstanceOf(ObjectSet);
      expect(objectSymmetricDifference23 === object2).toBe(false);
      expect(objectSymmetricDifference23 === object3).toBe(false);
      expect(objectSymmetricDifference23.size).toBe(4);
      expect([...objectSymmetricDifference23.keys()]).toEqual([{ id: 2 }, { id: 3 }, { id: 5 }, { id: 6 }]);
    });

    test('isSubsetOf()', () => {
      const primitive1 = new ObjectSet<number>([1, 2, 3]);
      const primitive2 = new ObjectSet<number>([1, 2, 3, 4]);
      const primitive3 = new ObjectSet<number>([4, 5, 6]);

      expect(primitive1.isSubsetOf(primitive1)).toBe(true);
      expect(primitive1.isSubsetOf(primitive2)).toBe(true);
      expect(primitive1.isSubsetOf(primitive3)).toBe(false);

      expect(primitive2.isSubsetOf(primitive1)).toBe(false);
      expect(primitive2.isSubsetOf(primitive2)).toBe(true);
      expect(primitive2.isSubsetOf(primitive3)).toBe(false);

      expect(primitive3.isSubsetOf(primitive1)).toBe(false);
      expect(primitive3.isSubsetOf(primitive2)).toBe(false);
      expect(primitive3.isSubsetOf(primitive3)).toBe(true);

      const object1 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ObjectSet<ObjectKey>([{ id: 4 }, { id: 5 }, { id: 6 }]);

      expect(object1.isSubsetOf(object1)).toBe(true);
      expect(object1.isSubsetOf(object2)).toBe(true);
      expect(object1.isSubsetOf(object3)).toBe(false);

      expect(object2.isSubsetOf(object1)).toBe(false);
      expect(object2.isSubsetOf(object2)).toBe(true);
      expect(object2.isSubsetOf(object3)).toBe(false);

      expect(object3.isSubsetOf(object1)).toBe(false);
      expect(object3.isSubsetOf(object2)).toBe(false);
      expect(object3.isSubsetOf(object3)).toBe(true);
    });

    test('isSupersetOf()', () => {
      const primitive1 = new ObjectSet<number>([1, 2, 3]);
      const primitive2 = new ObjectSet<number>([1, 2, 3, 4]);
      const primitive3 = new ObjectSet<number>([4, 5, 6]);

      expect(primitive1.isSupersetOf(primitive1)).toBe(true);
      expect(primitive1.isSupersetOf(primitive2)).toBe(false);
      expect(primitive1.isSupersetOf(primitive3)).toBe(false);

      expect(primitive2.isSupersetOf(primitive1)).toBe(true);
      expect(primitive2.isSupersetOf(primitive2)).toBe(true);
      expect(primitive2.isSupersetOf(primitive3)).toBe(false);

      expect(primitive3.isSupersetOf(primitive1)).toBe(false);
      expect(primitive3.isSupersetOf(primitive2)).toBe(false);
      expect(primitive3.isSupersetOf(primitive3)).toBe(true);

      const object1 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ObjectSet<ObjectKey>([{ id: 4 }, { id: 5 }, { id: 6 }]);

      expect(object1.isSupersetOf(object1)).toBe(true);
      expect(object1.isSupersetOf(object2)).toBe(false);
      expect(object1.isSupersetOf(object3)).toBe(false);

      expect(object2.isSupersetOf(object1)).toBe(true);
      expect(object2.isSupersetOf(object2)).toBe(true);
      expect(object2.isSupersetOf(object3)).toBe(false);

      expect(object3.isSupersetOf(object1)).toBe(false);
      expect(object3.isSupersetOf(object2)).toBe(false);
      expect(object3.isSupersetOf(object3)).toBe(true);
    });

    test('isDisjointFrom()', () => {
      const primitive1 = new ObjectSet<number>([1, 2, 3]);
      const primitive2 = new ObjectSet<number>([2, 3, 4]);
      const primitive3 = new ObjectSet<number>([4, 5, 6]);

      expect(primitive1.isDisjointFrom(primitive1)).toBe(false);
      expect(primitive1.isDisjointFrom(primitive2)).toBe(false);
      expect(primitive1.isDisjointFrom(primitive3)).toBe(true);

      expect(primitive2.isDisjointFrom(primitive1)).toBe(false);
      expect(primitive2.isDisjointFrom(primitive2)).toBe(false);
      expect(primitive2.isDisjointFrom(primitive3)).toBe(false);

      expect(primitive3.isDisjointFrom(primitive1)).toBe(true);
      expect(primitive3.isDisjointFrom(primitive2)).toBe(false);
      expect(primitive3.isDisjointFrom(primitive3)).toBe(false);

      const object1 = new ObjectSet<ObjectKey>([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ObjectSet<ObjectKey>([{ id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ObjectSet<ObjectKey>([{ id: 4 }, { id: 5 }, { id: 6 }]);

      expect(object1.isDisjointFrom(object1)).toBe(false);
      expect(object1.isDisjointFrom(object2)).toBe(false);
      expect(object1.isDisjointFrom(object3)).toBe(true);

      expect(object2.isDisjointFrom(object1)).toBe(false);
      expect(object2.isDisjointFrom(object2)).toBe(false);
      expect(object2.isDisjointFrom(object3)).toBe(false);

      expect(object3.isDisjointFrom(object1)).toBe(true);
      expect(object3.isDisjointFrom(object2)).toBe(false);
      expect(object3.isDisjointFrom(object3)).toBe(false);
    });
  })

  describe('static factories', test => {
    test('keysOf()', () => {
      const map = new Map<number, string>([[1, 'a'], [2, 'b']]);
      const keys = ObjectSet.keysOf(map);
      expect(keys).toBeInstanceOf(ObjectSet);
      expect(keys.size).toBe(2);
      expect([...keys.keys()]).toEqual([1, 2]);

      const objectMap = new ObjectMap<ObjectKey, string>([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      const objectKeys = ObjectSet.keysOf(objectMap);
      expect(objectKeys).toBeInstanceOf(ObjectSet);
      expect(objectKeys.size).toBe(2);
      expect([...objectKeys.keys()]).toEqual([{ id: 1 }, { id: 2 }]);

      const object = { a: 1, b: 2 };
      const objectKeys2 = ObjectSet.keysOf(object);
      expect(objectKeys2).toBeInstanceOf(ObjectSet);
      expect(objectKeys2.size).toBe(2);
      expect([...objectKeys2.keys()]).toEqual(['a', 'b']);
    })

    test('valuesOf()', () => {
      const map = new Map<number, string>([[1, 'a'], [2, 'b']]);
      const values = ObjectSet.valuesOf(map);
      expect(values).toBeInstanceOf(ObjectSet);
      expect(values.size).toBe(2);
      expect([...values.keys()]).toEqual(['a', 'b']);

      const objectMap = new ObjectMap<ObjectKey, string>([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      const objectValues = ObjectSet.valuesOf(objectMap);
      expect(objectValues).toBeInstanceOf(ObjectSet);
      expect(objectValues.size).toBe(2);
      expect([...objectValues.keys()]).toEqual(['a', 'b']);

      const object = { a: 1, b: 2 };
      const objectValues2 = ObjectSet.valuesOf(object);
      expect(objectValues2).toBeInstanceOf(ObjectSet);
      expect(objectValues2.size).toBe(2);
      expect([...objectValues2.keys()]).toEqual([1, 2]);
    })
  })
})