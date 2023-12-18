import { describe, expect, vi } from 'vitest';
import { ImmutableMap, ImmutableSet, ObjectMap, equals, hash } from '../src';

type ObjectKey = { id: number };

// copy the default functions, so that we don't get a false-positive that they're preserved
function _equals(a: unknown, b: unknown) {
  return equals(a, b)
}
function _hash(value: unknown) {
  return hash(value)
}

describe('ImmutableSet', () => {
  describe('Constructor & internal logic', test => {
    test('reads iterable entries, if passed', () => {
      const fromArray = new ImmutableSet([1, 2]);
      expect(fromArray.size).toBe(2);
      expect(fromArray.has(1)).toBe(true);
      expect(fromArray.has(2)).toBe(true);

      const fromSet = new ImmutableSet(new Set([1, 2]));
      expect(fromSet.size).toBe(2);
      expect(fromSet.has(1)).toBe(true);
      expect(fromSet.has(2)).toBe(true);

      function* generator() {
        yield 1;
        yield 2;
      }
      const fromGenerator = new ImmutableSet(generator());
      expect(fromGenerator.size).toBe(2);
      expect(fromGenerator.has(1)).toBe(true);
      expect(fromGenerator.has(2)).toBe(true);

      const fromImmutableSet = new ImmutableSet(fromArray);
      expect(fromImmutableSet.size).toBe(2);
      expect(fromImmutableSet.has(1)).toBe(true);
      expect(fromImmutableSet.has(2)).toBe(true);
    })

    test('handles options', () => {
      const customOptions = new ImmutableSet(undefined, {
        initialCapacity: 1,
        loadFactor: 2,
        hash: _hash,
        equals: _equals,
      })

      expect(customOptions.options).toEqual({
        loadFactor: 2,
        hash: _hash,
        equals: _equals,
      })
    })

    test('copy constructor', () => {
      const map = new ImmutableSet([1, 2]);
      const copy = new ImmutableSet(map);

      expect(copy).toBeInstanceOf(ImmutableSet);
      expect(copy === map).toBe(false);
      expect(copy.equals(map)).toBe(true);
      expect(copy.options).toEqual(map.options);
      expect(copy.size).toBe(2);

      expect(copy.has(1)).toBe(true);
      expect(copy.has(2)).toBe(true);
    })
    test('copy constructor with options', () => {
      const map = new ImmutableSet([1, 2]);
      const copy = new ImmutableSet(map, {
        initialCapacity: 1,
        loadFactor: 1,
        hash: _hash,
        equals: _equals,
      });

      expect(copy).toBeInstanceOf(ImmutableSet);
      expect(copy === map).toBe(false);

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

      const map = new ImmutableSet([1, 2], options);
      expect(map.options).toEqual(options);

      const clone = map.clone();
      expect(clone.options).toEqual(options);

      const emptyClone = map.clear();
      expect(emptyClone.options).toEqual(options);

      const keys1 = ImmutableSet.keysOf(new Map([['a', 1], ['b', 2]]), options);
      expect(keys1.options).toEqual(options);
      const keys2 = ImmutableSet.keysOf({ a: 1, b: 2 }, options);
      expect(keys2.options).toEqual(options);

      const values1 = ImmutableSet.valuesOf(new Map([['a', 1], ['b', 2]]), options);
      expect(values1.options).toEqual(options);
      const values2 = ImmutableSet.valuesOf({ a: 1, b: 2 }, options);
      expect(values2.options).toEqual(options);
    })
  })

  describe('ES6 Set methods', test => {
    test('add() & has()', () => {
      const primitive = new ImmutableSet([1])
      expect(primitive.has(1)).toBe(true);
      expect(primitive.has(2)).toBe(false);
      const primitive2 = primitive.add(2);
      expect(primitive2 === primitive).toBe(false);
      expect(primitive2.equals(primitive)).toBe(false);
      expect(primitive2.has(1)).toBe(true);
      expect(primitive2.has(2)).toBe(true);
      expect(primitive.has(1)).toBe(true);

      const primitive3 = primitive2.add(1);
      expect(primitive3 === primitive2).toBe(false);
      expect(primitive3.equals(primitive2)).toBe(true);
      expect(primitive3.has(1)).toBe(true);
      expect(primitive3.has(2)).toBe(true);

      const object = new ImmutableSet([{ id: 1 }]);
      expect(object.has({ id: 1 })).toBe(true);
      expect(object.has({ id: 2 })).toBe(false);

      const object2 = object.add({ id: 2 });
      expect(object2 === object).toBe(false);
      expect(object2.equals(object)).toBe(false);
      expect(object2.has({ id: 1 })).toBe(true);
      expect(object2.has({ id: 2 })).toBe(true);
      expect(object.has({ id: 2 })).toBe(false);

      const object3 = object2.add({ id: 1 });
      expect(object3 === object2).toBe(false);
      expect(object3.equals(object2)).toBe(true);
      expect(object3.has({ id: 1 })).toBe(true);
      expect(object3.has({ id: 2 })).toBe(true);
    });

    test('delete()', () => {
      const primitive = new ImmutableSet([1, 2]);

      const primitive2 = primitive.delete(1);
      expect(primitive2 === primitive).toBe(false);
      expect(primitive2.equals(primitive)).toBe(false);
      expect(primitive2.has(1)).toBe(false);
      expect(primitive2.has(2)).toBe(true);
      expect(primitive.has(1)).toBe(true);

      const primitive3 = primitive2.delete(1);
      expect(primitive3 === primitive2).toBe(false);
      expect(primitive3.equals(primitive2)).toBe(true);

      const object = new ImmutableSet([{ id: 1 }, { id: 2 }]);
      const object2 = object.delete({ id: 1 });
      expect(object2 === object).toBe(false);
      expect(object2.equals(object)).toBe(false);
      expect(object2.has({ id: 1 })).toBe(false);
      expect(object2.has({ id: 2 })).toBe(true);
      expect(object.has({ id: 1 })).toBe(true);

      const object3 = object2.delete({ id: 1 });
      expect(object3 === object2).toBe(false);
      expect(object3.equals(object2)).toBe(true);
    });

    test('clear()', () => {
      const primitive = new ImmutableSet([1, 2]);
      const primitive2 = primitive.clear();
      expect(primitive2 === primitive).toBe(false);
      expect(primitive2.equals(primitive)).toBe(false);

      expect(primitive2.size).toBe(0);
      expect(primitive2.has(1)).toBe(false);
      expect(primitive2.has(2)).toBe(false);

      expect(primitive.size).toBe(2);
      expect(primitive.has(1)).toBe(true);
      expect(primitive.has(2)).toBe(true);

      const object = new ImmutableSet([{ id: 1 }, { id: 2 }]);
      const object2 = object.clear();
      expect(object2 === object).toBe(false);
      expect(object2.equals(object)).toBe(false);

      expect(object2.size).toBe(0);
      expect(object2.has({ id: 1 })).toBe(false);
      expect(object2.has({ id: 2 })).toBe(false);

      expect(object.size).toBe(2);
      expect(object.has({ id: 1 })).toBe(true);
      expect(object.has({ id: 2 })).toBe(true);
    });

    test('size', () => {
      const primitive = new ImmutableSet<number>();
      expect(primitive.size).toBe(0);
      const primitive2 = primitive.add(1);
      expect(primitive2.size).toBe(1);
      expect(primitive.size).toBe(0);
      const primitive3 = primitive2.add(2);
      expect(primitive3.size).toBe(2);
      expect(primitive2.size).toBe(1);
      const primitive4 = primitive3.add(1);
      expect(primitive4.size).toBe(2);
      expect(primitive3.size).toBe(2);
      const primitive5 = primitive4.delete(1);
      expect(primitive5.size).toBe(1);
      expect(primitive4.size).toBe(2);

      const object = new ImmutableSet<ObjectKey>();
      expect(object.size).toBe(0);
      const object2 = object.add({ id: 1 });
      expect(object2.size).toBe(1);
      expect(object.size).toBe(0);
      const object3 = object2.add({ id: 2 });
      expect(object3.size).toBe(2);
      expect(object2.size).toBe(1);
      const object4 = object3.add({ id: 1 });
      expect(object4.size).toBe(2);
      expect(object3.size).toBe(2);
      const object5 = object4.delete({ id: 1 });
      expect(object5.size).toBe(1);
      expect(object4.size).toBe(2);
    });

    test('keys()', () => {
      const primitive = new ImmutableSet<number>();
      expect([...primitive.keys()]).toEqual([]);
      const primitive2 = primitive.add(1);
      expect([...primitive2.keys()]).toEqual([1]);
      expect([...primitive.keys()]).toEqual([]);
      const primitive3 = primitive2.add(2);
      expect([...primitive3.keys()]).toEqual([1, 2]);
      expect([...primitive2.keys()]).toEqual([1]);
      const primitive4 = primitive3.add(1);
      expect([...primitive4.keys()]).toEqual([1, 2]);
      expect([...primitive3.keys()]).toEqual([1, 2]);
      const primitive5 = primitive4.delete(1);
      expect([...primitive5.keys()]).toEqual([2]);
      expect([...primitive4.keys()]).toEqual([1, 2]);

      const object = new ImmutableSet<ObjectKey>();
      expect([...object.keys()]).toEqual([]);
      const object2 = object.add({ id: 1 });
      expect([...object2.keys()]).toEqual([{ id: 1 }]);
      expect([...object.keys()]).toEqual([]);
      const object3 = object2.add({ id: 2 });
      expect([...object3.keys()]).toEqual([{ id: 1 }, { id: 2 }]);
      expect([...object2.keys()]).toEqual([{ id: 1 }]);
      const object4 = object3.add({ id: 1 });
      expect([...object4.keys()]).toEqual([{ id: 1 }, { id: 2 }]);
      expect([...object3.keys()]).toEqual([{ id: 1 }, { id: 2 }]);
      const object5 = object4.delete({ id: 1 });
      expect([...object5.keys()]).toEqual([{ id: 2 }]);
      expect([...object4.keys()]).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('values()', () => {
      const primitive = new ImmutableSet<number>();
      expect([...primitive.values()]).toEqual([]);
      const primitive2 = primitive.add(1);
      expect([...primitive2.values()]).toEqual([1]);
      expect([...primitive.values()]).toEqual([]);
      const primitive3 = primitive2.add(2);
      expect([...primitive3.values()]).toEqual([1, 2]);
      expect([...primitive2.values()]).toEqual([1]);
      const primitive4 = primitive3.add(1);
      expect([...primitive4.values()]).toEqual([1, 2]);
      expect([...primitive3.values()]).toEqual([1, 2]);
      const primitive5 = primitive4.delete(1);
      expect([...primitive5.values()]).toEqual([2]);
      expect([...primitive4.values()]).toEqual([1, 2]);

      const object = new ImmutableSet<ObjectKey>();
      expect([...object.values()]).toEqual([]);
      const object2 = object.add({ id: 1 });
      expect([...object2.values()]).toEqual([{ id: 1 }]);
      expect([...object.values()]).toEqual([]);
      const object3 = object2.add({ id: 2 });
      expect([...object3.values()]).toEqual([{ id: 1 }, { id: 2 }]);
      expect([...object2.values()]).toEqual([{ id: 1 }]);
      const object4 = object3.add({ id: 1 });
      expect([...object4.values()]).toEqual([{ id: 1 }, { id: 2 }]);
      expect([...object3.values()]).toEqual([{ id: 1 }, { id: 2 }]);
      const object5 = object4.delete({ id: 1 });
      expect([...object5.values()]).toEqual([{ id: 2 }]);
      expect([...object4.values()]).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('entries()', () => {
      const primitive = new ImmutableSet<number>();
      expect([...primitive.entries()]).toEqual([]);
      const primitive2 = primitive.add(1);
      expect([...primitive2.entries()]).toEqual([[1, 1]]);
      expect([...primitive.entries()]).toEqual([]);
      const primitive3 = primitive2.add(2);
      expect([...primitive3.entries()]).toEqual([[1, 1], [2, 2]]);
      expect([...primitive2.entries()]).toEqual([[1, 1]]);
      const primitive4 = primitive3.add(1);
      expect([...primitive4.entries()]).toEqual([[1, 1], [2, 2]]);
      expect([...primitive3.entries()]).toEqual([[1, 1], [2, 2]]);
      const primitive5 = primitive4.delete(1);
      expect([...primitive5.entries()]).toEqual([[2, 2]]);
      expect([...primitive4.entries()]).toEqual([[1, 1], [2, 2]]);

      const object = new ImmutableSet<ObjectKey>();
      expect([...object.entries()]).toEqual([]);
      const object2 = object.add({ id: 1 });
      expect([...object2.entries()]).toEqual([[{ id: 1 }, { id: 1 }]]);
      expect([...object.entries()]).toEqual([]);
      const object3 = object2.add({ id: 2 });
      expect([...object3.entries()]).toEqual([[{ id: 1 }, { id: 1 }], [{ id: 2 }, { id: 2 }]]);
      expect([...object2.entries()]).toEqual([[{ id: 1 }, { id: 1 }]]);
      const object4 = object3.add({ id: 1 });
      expect([...object4.entries()]).toEqual([[{ id: 1 }, { id: 1 }], [{ id: 2 }, { id: 2 }]]);
      expect([...object3.entries()]).toEqual([[{ id: 1 }, { id: 1 }], [{ id: 2 }, { id: 2 }]]);
      const object5 = object4.delete({ id: 1 });
      expect([...object5.entries()]).toEqual([[{ id: 2 }, { id: 2 }]]);
      expect([...object4.entries()]).toEqual([[{ id: 1 }, { id: 1 }], [{ id: 2 }, { id: 2 }]]);
    });

    test('forEach()', () => {
      const primitive = new ImmutableSet([1, 2]);
      const primitiveCallback = vi.fn<[v: number, k: number, set: Set<number>], void>();
      primitive.forEach(primitiveCallback);
      expect(primitiveCallback).toHaveBeenCalledTimes(2);
      expect(primitiveCallback).toHaveBeenCalledWith(1, 1, expect.anything());
      expect(primitiveCallback).toHaveBeenCalledWith(2, 2, expect.anything());

      const object = new ImmutableSet([{ id: 1 }, { id: 2 }]);
      const objectCallback = vi.fn<[v: ObjectKey, k: ObjectKey, set: Set<ObjectKey>], void>();
      object.forEach(objectCallback);
      expect(objectCallback).toHaveBeenCalledTimes(2);
      expect(objectCallback).toHaveBeenCalledWith({ id: 1 }, { id: 1 }, expect.anything());
      expect(objectCallback).toHaveBeenCalledWith({ id: 2 }, { id: 2 }, expect.anything());
    });

    test('toStringTag', () => {
      const primitive = new ImmutableSet<number>();
      expect(primitive.toString()).toBe('[object ImmutableSet]');

      const object = new ImmutableSet<ObjectKey>();
      expect(object.toString()).toBe('[object ImmutableSet]');
    });
  })

  describe('Additional methods', test => {
    test('isEmpty()', () => {
      const primitive = new ImmutableSet<number>();
      expect(primitive.isEmpty()).toBe(true);
      const primitive2 = primitive.add(1);
      expect(primitive2.isEmpty()).toBe(false);
      const primitive3 = primitive2.delete(1);
      expect(primitive3.isEmpty()).toBe(true);

      const object = new ImmutableSet<ObjectKey>();
      expect(object.isEmpty()).toBe(true);
      const object2 = object.add({ id: 1 });
      expect(object2.isEmpty()).toBe(false);
      const object3 = object2.delete({ id: 1 });
      expect(object3.isEmpty()).toBe(true);
    });

    test('equals()', () => {
      const primitive = new ImmutableSet([1, 2]);
      const primitive2 = new ImmutableSet([2, 1]);
      const primitive3 = new ImmutableSet([1, 3]);
      const primitive4 = new ImmutableSet([1, 2, 3]);
      expect(primitive.equals(primitive)).toBe(true);
      expect(primitive.equals(primitive2)).toBe(true);
      expect(primitive.equals(primitive3)).toBe(false);
      expect(primitive.equals(primitive4)).toBe(false);

      const object = new ImmutableSet([{ id: 1 }, { id: 2 }]);
      const object2 = new ImmutableSet([{ id: 2 }, { id: 1 }]);
      const object3 = new ImmutableSet([{ id: 1 }, { id: 3 }]);
      const object4 = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      expect(object.equals(object)).toBe(true);
      expect(object.equals(object2)).toBe(true);
      expect(object.equals(object3)).toBe(false);
      expect(object.equals(object4)).toBe(false);
    });

    test('clone()', () => {
      const primitive = new ImmutableSet([1, 2]);
      const primitive2 = primitive.clone();

      expect(primitive2).toBeInstanceOf(ImmutableSet);
      expect(primitive2 === primitive).toBe(false);
      expect(primitive2.equals(primitive)).toBe(true);

      expect(primitive2.options).toEqual(primitive.options);
      expect(primitive2.size).toBe(2);
      expect(primitive2.has(1)).toBe(true);
      expect(primitive2.has(2)).toBe(true);

      const object = new ImmutableSet([{ id: 1 }, { id: 2 }]);
      const object2 = object.clone();

      expect(object2).toBeInstanceOf(ImmutableSet);
      expect(object2 === object).toBe(false);
      expect(object2.equals(object)).toBe(true);

      expect(object2.options).toEqual(object.options);
      expect(object2.size).toBe(2);
      expect(object2.has({ id: 1 })).toBe(true);
      expect(object2.has({ id: 2 })).toBe(true);
    });

    test('filter()', () => {
      const primitive = new ImmutableSet([1, 2, 3]);
      const primitiveOdds = primitive.filter(v => v % 2 === 1);

      expect(primitiveOdds).toBeInstanceOf(ImmutableSet);
      expect(primitiveOdds === primitive).toBe(false);
      expect(primitiveOdds.equals(primitive)).toBe(false);

      expect(primitiveOdds.size).toBe(2);
      expect([...primitiveOdds.values()]).toEqual([1, 3]);

      const object = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const objectOdds = object.filter(v => v.id % 2 === 1);

      expect(objectOdds).toBeInstanceOf(ImmutableSet);
      expect(objectOdds === object).toBe(false);
      expect(objectOdds.equals(object)).toBe(false);

      expect(objectOdds.size).toBe(2);
      expect([...objectOdds.values()]).toEqual([{ id: 1 }, { id: 3 }]);
    });

    test('map()', () => {
      const primitive = new ImmutableSet([1, 2, 3]);

      const primitiveSquares = primitive.map(v => v * v);
      expect(primitiveSquares).toBeInstanceOf(ImmutableSet);
      expect(primitiveSquares === primitive).toBe(false);
      expect(primitiveSquares.equals(primitive)).toBe(false);

      expect(primitiveSquares.size).toBe(3);
      expect([...primitiveSquares.values()]).toEqual([1, 4, 9]);

      const primitiveDoubles = primitive.map(v => v * 2);
      expect(primitiveDoubles.size).toBe(3);
      expect([...primitiveDoubles.values()]).toEqual([2, 4, 6]);

      const object = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);

      const objectSquares = object.map(v => ({ id: v.id ** 2 }));
      expect(objectSquares).toBeInstanceOf(ImmutableSet);
      expect(objectSquares === object).toBe(false);
      expect(objectSquares.equals(object)).toBe(false);

      expect(objectSquares.size).toBe(3);
      expect([...objectSquares.values()]).toEqual([{ id: 1 }, { id: 4 }, { id: 9 }]);

      const objectDoubles = object.map(v => ({ id: v.id * 2 }));
      expect(objectDoubles.size).toBe(3);
      expect([...objectDoubles.values()]).toEqual([{ id: 2 }, { id: 4 }, { id: 6 }]);
    });

    test('reduce()', () => {
      const primitive = new ImmutableSet([1, 2, 3]);
      const primitiveSum = primitive.reduce((acc, v) => acc + v, 0);
      expect(primitiveSum).toBe(6);

      const primitiveProduct = primitive.reduce((acc, v) => acc * v, 1);
      expect(primitiveProduct).toBe(6);

      const object = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const objectSum = object.reduce((acc, v) => acc + v.id, 0);
      expect(objectSum).toBe(6);

      const objectProduct = object.reduce((acc, v) => acc * v.id, 1);
      expect(objectProduct).toBe(6);
    });

    test('some()', () => {
      const primitive = new ImmutableSet([1, 2, 3]);
      const primitiveSome = primitive.some(v => v < 3);
      expect(primitiveSome).toBe(true);

      const primitiveSome2 = primitive.some(v => v > 3);
      expect(primitiveSome2).toBe(false);

      const object = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const objectSome = object.some(v => v.id < 3);
      expect(objectSome).toBe(true);

      const objectSome2 = object.some(v => v.id > 3);
      expect(objectSome2).toBe(false);
    });

    test('every()', () => {
      const primitive = new ImmutableSet([1, 2, 3]);
      const primitiveEvery = primitive.every(v => v < 3);
      expect(primitiveEvery).toBe(false);

      const primitiveEvery2 = primitive.every(v => v > 0);
      expect(primitiveEvery2).toBe(true);

      const object = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const objectEvery = object.every(v => v.id < 3);
      expect(objectEvery).toBe(false);

      const objectEvery2 = object.every(v => v.id > 0);
      expect(objectEvery2).toBe(true);
    });

    test('sort()', () => {
      const primitive = new ImmutableSet([1, 2, 3]);
      const primitiveSorted = primitive.sort((a, b) => b - a);
      expect(primitiveSorted).toBeInstanceOf(ImmutableSet);
      expect(primitiveSorted === primitive).toBe(false);
      expect([...primitiveSorted.values()]).toEqual([3, 2, 1]);

      const object = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const objectSorted = object.sort((a, b) => b.id - a.id);
      expect(objectSorted).toBeInstanceOf(ImmutableSet);
      expect(objectSorted === object).toBe(false);
      expect([...objectSorted.values()]).toEqual([{ id: 3 }, { id: 2 }, { id: 1 }]);
    });
  })

  describe('Set operations', test => {
    test('intersection()', () => {
      const primitive1 = new ImmutableSet([1, 2, 3]);
      const primitive2 = new ImmutableSet([2, 3, 4]);
      const primitive3 = new ImmutableSet([4, 5, 6]);

      const primitiveIntersection12 = primitive1.intersection(primitive2);
      expect(primitiveIntersection12).toBeInstanceOf(ImmutableSet);
      expect(primitiveIntersection12 === primitive1).toBe(false);
      expect(primitiveIntersection12 === primitive2).toBe(false);
      expect(primitiveIntersection12.size).toBe(2);
      expect([...primitiveIntersection12.values()]).toEqual([2, 3]);

      const primitiveIntersection13 = primitive1.intersection(primitive3);
      expect(primitiveIntersection13).toBeInstanceOf(ImmutableSet);
      expect(primitiveIntersection13 === primitive1).toBe(false);
      expect(primitiveIntersection13 === primitive3).toBe(false);
      expect(primitiveIntersection13.size).toBe(0);
      expect([...primitiveIntersection13.values()]).toEqual([]);

      const object1 = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ImmutableSet([{ id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ImmutableSet([{ id: 4 }, { id: 5 }, { id: 6 }]);

      const objectIntersection12 = object1.intersection(object2);
      expect(objectIntersection12).toBeInstanceOf(ImmutableSet);
      expect(objectIntersection12 === object1).toBe(false);
      expect(objectIntersection12 === object2).toBe(false);
      expect(objectIntersection12.size).toBe(2);
      expect([...objectIntersection12.values()]).toEqual([{ id: 2 }, { id: 3 }]);

      const objectIntersection13 = object1.intersection(object3);
      expect(objectIntersection13).toBeInstanceOf(ImmutableSet);
      expect(objectIntersection13 === object1).toBe(false);
      expect(objectIntersection13 === object3).toBe(false);
      expect(objectIntersection13.size).toBe(0);
      expect([...objectIntersection13.values()]).toEqual([]);
    })

    test('union()', () => {
      const primitive1 = new ImmutableSet([1, 2, 3]);
      const primitive2 = new ImmutableSet([2, 3, 4]);
      const primitive3 = new ImmutableSet([4, 5, 6]);

      const primitiveUnion12 = primitive1.union(primitive2);
      expect(primitiveUnion12).toBeInstanceOf(ImmutableSet);
      expect(primitiveUnion12 === primitive1).toBe(false);
      expect(primitiveUnion12 === primitive2).toBe(false);
      expect(primitiveUnion12.size).toBe(4);
      expect([...primitiveUnion12.values()]).toEqual([1, 2, 3, 4]);

      const primitiveUnion13 = primitive1.union(primitive3);
      expect(primitiveUnion13).toBeInstanceOf(ImmutableSet);
      expect(primitiveUnion13 === primitive1).toBe(false);
      expect(primitiveUnion13 === primitive3).toBe(false);
      expect(primitiveUnion13.size).toBe(6);
      expect([...primitiveUnion13.values()]).toEqual([1, 2, 3, 4, 5, 6]);

      const object1 = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ImmutableSet([{ id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ImmutableSet([{ id: 4 }, { id: 5 }, { id: 6 }]);

      const objectUnion12 = object1.union(object2);
      expect(objectUnion12).toBeInstanceOf(ImmutableSet);
      expect(objectUnion12 === object1).toBe(false);
      expect(objectUnion12 === object2).toBe(false);
      expect(objectUnion12.size).toBe(4);
      expect([...objectUnion12.values()]).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);

      const objectUnion13 = object1.union(object3);
      expect(objectUnion13).toBeInstanceOf(ImmutableSet);
      expect(objectUnion13 === object1).toBe(false);
      expect(objectUnion13 === object3).toBe(false);
      expect(objectUnion13.size).toBe(6);
      expect([...objectUnion13.values()]).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }]);
    })

    test('difference()', () => {
      const primitive1 = new ImmutableSet([1, 2, 3]);
      const primitive2 = new ImmutableSet([2, 3, 4]);
      const primitive3 = new ImmutableSet([4, 5, 6]);

      const primitiveDifference12 = primitive1.difference(primitive2);
      expect(primitiveDifference12).toBeInstanceOf(ImmutableSet);
      expect(primitiveDifference12 === primitive1).toBe(false);
      expect(primitiveDifference12 === primitive2).toBe(false);
      expect(primitiveDifference12.size).toBe(1);
      expect([...primitiveDifference12.values()]).toEqual([1]);

      const primitiveDifference13 = primitive1.difference(primitive3);
      expect(primitiveDifference13).toBeInstanceOf(ImmutableSet);
      expect(primitiveDifference13 === primitive1).toBe(false);
      expect(primitiveDifference13 === primitive3).toBe(false);
      expect(primitiveDifference13.size).toBe(3);
      expect([...primitiveDifference13.values()]).toEqual([1, 2, 3]);

      const object1 = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ImmutableSet([{ id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ImmutableSet([{ id: 4 }, { id: 5 }, { id: 6 }]);

      const objectDifference12 = object1.difference(object2);
      expect(objectDifference12).toBeInstanceOf(ImmutableSet);
      expect(objectDifference12 === object1).toBe(false);
      expect(objectDifference12 === object2).toBe(false);
      expect(objectDifference12.size).toBe(1);
      expect([...objectDifference12.values()]).toEqual([{ id: 1 }]);

      const objectDifference13 = object1.difference(object3);
      expect(objectDifference13).toBeInstanceOf(ImmutableSet);
      expect(objectDifference13 === object1).toBe(false);
      expect(objectDifference13 === object3).toBe(false);
      expect(objectDifference13.size).toBe(3);
      expect([...objectDifference13.values()]).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    })

    test('symmetricDifference()', () => {
      const primitive1 = new ImmutableSet([1, 2, 3]);
      const primitive2 = new ImmutableSet([2, 3, 4]);
      const primitive3 = new ImmutableSet([4, 5, 6]);

      const primitiveSymmetricDifference12 = primitive1.symmetricDifference(primitive2);
      expect(primitiveSymmetricDifference12).toBeInstanceOf(ImmutableSet);
      expect(primitiveSymmetricDifference12 === primitive1).toBe(false);
      expect(primitiveSymmetricDifference12 === primitive2).toBe(false);
      expect(primitiveSymmetricDifference12.size).toBe(2);
      expect([...primitiveSymmetricDifference12.values()]).toEqual([1, 4]);

      const primitiveSymmetricDifference13 = primitive1.symmetricDifference(primitive3);
      expect(primitiveSymmetricDifference13).toBeInstanceOf(ImmutableSet);
      expect(primitiveSymmetricDifference13 === primitive1).toBe(false);
      expect(primitiveSymmetricDifference13 === primitive3).toBe(false);
      expect(primitiveSymmetricDifference13.size).toBe(6);
      expect([...primitiveSymmetricDifference13.values()]).toEqual([1, 2, 3, 4, 5, 6]);

      const primitiveSymmetricDifference23 = primitive2.symmetricDifference(primitive3);
      expect(primitiveSymmetricDifference23).toBeInstanceOf(ImmutableSet);
      expect(primitiveSymmetricDifference23 === primitive2).toBe(false);
      expect(primitiveSymmetricDifference23 === primitive3).toBe(false);
      expect(primitiveSymmetricDifference23.size).toBe(4);
      expect([...primitiveSymmetricDifference23.values()]).toEqual([2, 3, 5, 6]);

      const object1 = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ImmutableSet([{ id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ImmutableSet([{ id: 4 }, { id: 5 }, { id: 6 }]);

      const objectSymmetricDifference12 = object1.symmetricDifference(object2);
      expect(objectSymmetricDifference12).toBeInstanceOf(ImmutableSet);
      expect(objectSymmetricDifference12 === object1).toBe(false);
      expect(objectSymmetricDifference12 === object2).toBe(false);
      expect(objectSymmetricDifference12.size).toBe(2);
      expect([...objectSymmetricDifference12.values()]).toEqual([{ id: 1 }, { id: 4 }]);

      const objectSymmetricDifference13 = object1.symmetricDifference(object3);
      expect(objectSymmetricDifference13).toBeInstanceOf(ImmutableSet);
      expect(objectSymmetricDifference13 === object1).toBe(false);
      expect(objectSymmetricDifference13 === object3).toBe(false);
      expect(objectSymmetricDifference13.size).toBe(6);
      expect([...objectSymmetricDifference13.values()]).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }]);
    
      const objectSymmetricDifference23 = object2.symmetricDifference(object3);
      expect(objectSymmetricDifference23).toBeInstanceOf(ImmutableSet);
      expect(objectSymmetricDifference23 === object2).toBe(false);
      expect(objectSymmetricDifference23 === object3).toBe(false);
      expect(objectSymmetricDifference23.size).toBe(4);
      expect([...objectSymmetricDifference23.values()]).toEqual([{ id: 2 }, { id: 3 }, { id: 5 }, { id: 6 }]);
    })

    test('isSubsetOf()', () => {
      const primitive1 = new ImmutableSet([1, 2, 3]);
      const primitive2 = new ImmutableSet([1, 2, 3, 4]);
      const primitive3 = new ImmutableSet([4, 5, 6]);

      expect(primitive1.isSubsetOf(primitive1)).toBe(true);
      expect(primitive1.isSubsetOf(primitive2)).toBe(true);
      expect(primitive1.isSubsetOf(primitive3)).toBe(false);

      expect(primitive2.isSubsetOf(primitive1)).toBe(false);
      expect(primitive2.isSubsetOf(primitive2)).toBe(true);
      expect(primitive2.isSubsetOf(primitive3)).toBe(false);

      expect(primitive3.isSubsetOf(primitive1)).toBe(false);
      expect(primitive3.isSubsetOf(primitive2)).toBe(false);
      expect(primitive3.isSubsetOf(primitive3)).toBe(true);

      const object1 = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ImmutableSet([{ id: 4 }, { id: 5 }, { id: 6 }]);

      expect(object1.isSubsetOf(object1)).toBe(true);
      expect(object1.isSubsetOf(object2)).toBe(true);
      expect(object1.isSubsetOf(object3)).toBe(false);

      expect(object2.isSubsetOf(object1)).toBe(false);
      expect(object2.isSubsetOf(object2)).toBe(true);
      expect(object2.isSubsetOf(object3)).toBe(false);

      expect(object3.isSubsetOf(object1)).toBe(false);
      expect(object3.isSubsetOf(object2)).toBe(false);
      expect(object3.isSubsetOf(object3)).toBe(true);
    })

    test('isSupersetOf()', () => {
      const primitive1 = new ImmutableSet([1, 2, 3]);
      const primitive2 = new ImmutableSet([1, 2, 3, 4]);
      const primitive3 = new ImmutableSet([4, 5, 6]);

      expect(primitive1.isSupersetOf(primitive1)).toBe(true);
      expect(primitive1.isSupersetOf(primitive2)).toBe(false);
      expect(primitive1.isSupersetOf(primitive3)).toBe(false);

      expect(primitive2.isSupersetOf(primitive1)).toBe(true);
      expect(primitive2.isSupersetOf(primitive2)).toBe(true);
      expect(primitive2.isSupersetOf(primitive3)).toBe(false);

      expect(primitive3.isSupersetOf(primitive1)).toBe(false);
      expect(primitive3.isSupersetOf(primitive2)).toBe(false);
      expect(primitive3.isSupersetOf(primitive3)).toBe(true);

      const object1 = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ImmutableSet([{ id: 4 }, { id: 5 }, { id: 6 }]);

      expect(object1.isSupersetOf(object1)).toBe(true);
      expect(object1.isSupersetOf(object2)).toBe(false);
      expect(object1.isSupersetOf(object3)).toBe(false);

      expect(object2.isSupersetOf(object1)).toBe(true);
      expect(object2.isSupersetOf(object2)).toBe(true);
      expect(object2.isSupersetOf(object3)).toBe(false);

      expect(object3.isSupersetOf(object1)).toBe(false);
      expect(object3.isSupersetOf(object2)).toBe(false);
      expect(object3.isSupersetOf(object3)).toBe(true);
    })

    test('isDisjointFrom()', () => {
      const primitive1 = new ImmutableSet([1, 2, 3]);
      const primitive2 = new ImmutableSet([1, 2, 3, 4]);
      const primitive3 = new ImmutableSet([4, 5, 6]);

      expect(primitive1.isDisjointFrom(primitive1)).toBe(false);
      expect(primitive1.isDisjointFrom(primitive2)).toBe(false);
      expect(primitive1.isDisjointFrom(primitive3)).toBe(true);

      expect(primitive2.isDisjointFrom(primitive1)).toBe(false);
      expect(primitive2.isDisjointFrom(primitive2)).toBe(false);
      expect(primitive2.isDisjointFrom(primitive3)).toBe(false);

      expect(primitive3.isDisjointFrom(primitive1)).toBe(true);
      expect(primitive3.isDisjointFrom(primitive2)).toBe(false);
      expect(primitive3.isDisjointFrom(primitive3)).toBe(false);

      const object1 = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object2 = new ImmutableSet([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
      const object3 = new ImmutableSet([{ id: 4 }, { id: 5 }, { id: 6 }]);

      expect(object1.isDisjointFrom(object1)).toBe(false);
      expect(object1.isDisjointFrom(object2)).toBe(false);
      expect(object1.isDisjointFrom(object3)).toBe(true);

      expect(object2.isDisjointFrom(object1)).toBe(false);
      expect(object2.isDisjointFrom(object2)).toBe(false);
      expect(object2.isDisjointFrom(object3)).toBe(false);

      expect(object3.isDisjointFrom(object1)).toBe(true);
      expect(object3.isDisjointFrom(object2)).toBe(false);
      expect(object3.isDisjointFrom(object3)).toBe(false);
    })
  })

  describe('Static methods', test => {
    test('keysOf()', () => {
      const map = new Map([[1, 'a'], [2, 'b']])
      const keys = ImmutableSet.keysOf(map)
      expect(keys).toBeInstanceOf(ImmutableSet)
      expect(keys.size).toBe(2)
      expect([...keys.keys()]).toEqual([1, 2])

      const objectMap = new ObjectMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']])
      const objectKeys = ImmutableSet.keysOf(objectMap)
      expect(objectKeys).toBeInstanceOf(ImmutableSet)
      expect(objectKeys.size).toBe(2)
      expect([...objectKeys.keys()]).toEqual([{ id: 1 }, { id: 2 }])

      const object = { a: 1, b: 2 };
      const objectKeys2 = ImmutableSet.keysOf(object)
      expect(objectKeys2).toBeInstanceOf(ImmutableSet)
      expect(objectKeys2.size).toBe(2)
      expect([...objectKeys2.values()]).toEqual(['a', 'b'])
    })

    test('valuesOf()', () => {
      const map = new Map([[1, 'a'], [2, 'b']])
      const values = ImmutableSet.valuesOf(map)
      expect(values).toBeInstanceOf(ImmutableSet)
      expect(values.size).toBe(2)
      expect([...values.values()]).toEqual(['a', 'b'])

      const objectMap = new ObjectMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']])
      const objectValues = ImmutableSet.valuesOf(objectMap)
      expect(objectValues).toBeInstanceOf(ImmutableSet)
      expect(objectValues.size).toBe(2)
      expect([...objectValues.values()]).toEqual(['a', 'b'])

      const object = { a: 1, b: 2 };
      const objectValues2 = ImmutableSet.valuesOf(object)
      expect(objectValues2).toBeInstanceOf(ImmutableSet)
      expect(objectValues2.size).toBe(2)
      expect([...objectValues2.values()]).toEqual([1, 2])
    })
  })
})