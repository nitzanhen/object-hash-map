import { describe, expect, vi } from 'vitest';
import { ImmutableMap, equals, hash } from '../src';

type ObjectKey = { id: number };

// copy the default functions, so that we don't get a false-positive that they're preserved
function _equals(a: unknown, b: unknown) {
  return equals(a, b)
}
function _hash(value: unknown) {
  return hash(value)
}

describe('ImmutableMap', () => {
  describe('Constructor & internal logic', test => {
    test('reads iterable entries, if passed', () => {
      const fromArray = new ImmutableMap([[1, 'a'], [2, 'b']]);
      expect(fromArray.size).toBe(2);
      expect(fromArray.get(1)).toBe('a');
      expect(fromArray.get(2)).toBe('b');

      const fromMap = new ImmutableMap(new Map([[1, 'a'], [2, 'b']]));
      expect(fromMap.size).toBe(2);
      expect(fromMap.get(1)).toBe('a');
      expect(fromMap.get(2)).toBe('b');

      function* generator(): Generator<[number, string]> {
        yield [1, 'a'];
        yield [2, 'b'];
      }
      const fromGenerator = new ImmutableMap(generator());
      expect(fromGenerator.size).toBe(2);
      expect(fromGenerator.get(1)).toBe('a');
      expect(fromGenerator.get(2)).toBe('b');

      const fromImmutableMap = new ImmutableMap(fromArray);
      expect(fromImmutableMap.size).toBe(2);
      expect(fromImmutableMap.get(1)).toBe('a');
      expect(fromImmutableMap.get(2)).toBe('b');
    })
    test('handles options', () => {
      const customOptions = new ImmutableMap(undefined, {
        initialCapacity: 1,
        loadFactor: 2,
        hash: _hash,
        equals: _equals,
      });

      expect(customOptions.options).toEqual({
        loadFactor: 2,
        hash: _hash,
        equals: _equals,
      });
    })
    test('copy constructor', () => {
      const map = new ImmutableMap([[1, 'a'], [2, 'b']]);
      const copy = new ImmutableMap(map);

      expect(copy).toBeInstanceOf(ImmutableMap);
      expect(copy === map).toBe(false);
      expect(copy.equals(map)).toBe(true);
      expect(copy.options).toEqual(map.options);
      expect(copy.size).toBe(2);

      expect(copy.get(1)).toBe('a');
      expect(copy.get(2)).toBe('b');
    })
    test('copy constructor with options', () => {
      const map = new ImmutableMap([[1, 'a'], [2, 'b']]);
      const copy = new ImmutableMap(map, {
        initialCapacity: 1,
        loadFactor: 1,
        hash: _hash,
        equals: _equals,
      });

      expect(copy).toBeInstanceOf(ImmutableMap);
      expect(copy === map).toBe(false);

      expect(copy.options).toEqual({
        loadFactor: 1,
        hash: _hash,
        equals: _equals,
      });
      expect(copy.size).toBe(2);

      expect(copy.get(1)).toBe('a');
      expect(copy.get(2)).toBe('b');
    })

    test('options carry over to clones', () => {
      const options = {
        loadFactor: 1,
        hash: _hash,
        equals: _equals,
      };

      const map = new ImmutableMap([[1, 'a'], [2, 'b']], options);
      expect(map.options).toEqual(options);

      const clone = map.clone();
      expect(clone.options).toEqual(options);

      const emptyClone = map.clear();
      expect(emptyClone.options).toEqual(options);

      const fromSet = ImmutableMap.fromSet(new Set([1, 2, 3]), v => v, options);
      expect(fromSet.options).toEqual(options);
    })
  })

  describe('ES6 Map methods', test => {
    test('get() & set()', () => {
      const primitive = new ImmutableMap<number, string>([[1, 'a'], [2, 'b']]);
      expect(primitive.get(1)).toBe('a');
      expect(primitive.get(2)).toBe('b');
      expect(primitive.get(3)).toBe(undefined);

      const primitive2 = primitive.set(1, 'c');
      expect(primitive2 === primitive).toBe(false);
      expect(primitive2.equals(primitive)).toBe(false);
      expect(primitive2.get(1)).toBe('c');
      expect(primitive2.get(2)).toBe('b');

      const object = new ImmutableMap<ObjectKey, string>([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      expect(object.get({ id: 1 })).toBe('a');
      expect(object.get({ id: 2 })).toBe('b');
      expect(object.get({ id: 3 })).toBe(undefined);

      const object2 = object.set({ id: 1 }, 'c');
      expect(object2 === object).toBe(false);
      expect(object2.equals(object)).toBe(false);
      expect(object2.get({ id: 1 })).toBe('c');
      expect(object2.get({ id: 2 })).toBe('b');
    });

    test('delete()', () => {
      const primitive = new ImmutableMap([[1, 'a'], [2, 'b']]);
      const primitive2 = primitive.delete(1);
      expect(primitive2 === primitive).toBe(false);
      expect(primitive2.equals(primitive)).toBe(false);
      expect(primitive2.get(1)).toBe(undefined);
      expect(primitive2.get(2)).toBe('b');
      const primitive3 = primitive2.delete(1);
      expect(primitive3 === primitive2).toBe(false);
      expect(primitive3.equals(primitive2)).toBe(true);

      const object = new ImmutableMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      const object2 = object.delete({ id: 1 });
      expect(object2 === object).toBe(false);
      expect(object2.equals(object)).toBe(false);
      expect(object2.get({ id: 1 })).toBe(undefined);
      expect(object2.get({ id: 2 })).toBe('b');
    });

    test('has()', () => {
      const primitive = new ImmutableMap([[1, 'a'], [2, 'b']]);
      expect(primitive.has(1)).toBe(true);
      expect(primitive.has(2)).toBe(true);
      expect(primitive.has(3)).toBe(false);

      const primitive2 = primitive.set(1, 'c');
      expect(primitive2.has(1)).toBe(true);
      expect(primitive2.has(2)).toBe(true);

      const primitive3 = primitive.delete(1);
      expect(primitive3.has(1)).toBe(false);
      expect(primitive3.has(2)).toBe(true);

      const object = new ImmutableMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      expect(object.has({ id: 1 })).toBe(true);
      expect(object.has({ id: 2 })).toBe(true);
      expect(object.has({ id: 3 })).toBe(false);

      const object2 = object.set({ id: 1 }, 'c');
      expect(object2.has({ id: 1 })).toBe(true);
      expect(object2.has({ id: 2 })).toBe(true);

      const object3 = object.delete({ id: 1 });
      expect(object3.has({ id: 1 })).toBe(false);
      expect(object3.has({ id: 2 })).toBe(true);
    });

    test('clear()', () => {
      const primitive = new ImmutableMap([[1, 'a'], [2, 'b']]);
      const primitive2 = primitive.clear();
      expect(primitive2 === primitive).toBe(false);
      expect(primitive2.equals(primitive)).toBe(false);

      expect(primitive2.size).toBe(0);
      expect(primitive2.has(1)).toBe(false);
      expect(primitive2.has(2)).toBe(false);

      expect(primitive.size).toBe(2);
      expect(primitive.has(1)).toBe(true);
      expect(primitive.has(2)).toBe(true);

      const object = new ImmutableMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
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
      const primitive = new ImmutableMap<number, string>();
      expect(primitive.size).toBe(0);
      const primitive2 = primitive.set(1, 'a');
      expect(primitive2.size).toBe(1);
      const primitive3 = primitive2.set(2, 'b');
      expect(primitive3.size).toBe(2);
      const primitive4 = primitive3.delete(1);
      expect(primitive4.size).toBe(1);
      const primitive5 = primitive4.clear();
      expect(primitive5.size).toBe(0);

      const object = new ImmutableMap<ObjectKey, string>();
      expect(object.size).toBe(0);
      const object2 = object.set({ id: 1 }, 'a');
      expect(object2.size).toBe(1);
      const object3 = object2.set({ id: 2 }, 'b');
      expect(object3.size).toBe(2);
      const object4 = object3.delete({ id: 1 });
      expect(object4.size).toBe(1);
      const object5 = object4.clear();
      expect(object5.size).toBe(0);
    });

    test('keys()', () => {
      const primitive = new ImmutableMap<number, string>();
      expect([...primitive.keys()]).toEqual([]);
      const primitive2 = primitive.set(1, 'a');
      expect([...primitive2.keys()]).toEqual([1]);
      const primitive3 = primitive2.set(2, 'b');
      expect([...primitive3.keys()]).toEqual([1, 2]);
      const primitive4 = primitive3.set(1, 'c');
      expect([...primitive4.keys()]).toEqual([1, 2]);
      const primitive5 = primitive4.delete(1);
      expect([...primitive5.keys()]).toEqual([2]);

      const object = new ImmutableMap<ObjectKey, string>();
      expect([...object.keys()]).toEqual([]);
      const object2 = object.set({ id: 1 }, 'a');
      expect([...object2.keys()]).toEqual([{ id: 1 }]);
      const object3 = object2.set({ id: 2 }, 'b');
      expect([...object3.keys()]).toEqual([{ id: 1 }, { id: 2 }]);
      const object4 = object3.set({ id: 1 }, 'c');
      expect([...object4.keys()]).toEqual([{ id: 1 }, { id: 2 }]);
      const object5 = object4.delete({ id: 1 });
      expect([...object5.keys()]).toEqual([{ id: 2 }]);
    });

    test('values()', () => {
      const primitive = new ImmutableMap<number, string>();
      expect([...primitive.values()]).toEqual([]);
      const primitive2 = primitive.set(1, 'a');
      expect([...primitive2.values()]).toEqual(['a']);
      const primitive3 = primitive2.set(2, 'b');
      expect([...primitive3.values()]).toEqual(['a', 'b']);
      const primitive4 = primitive3.set(1, 'c');
      expect([...primitive4.values()]).toEqual(['c', 'b']);
      const primitive5 = primitive4.delete(1);
      expect([...primitive5.values()]).toEqual(['b']);

      const object = new ImmutableMap<ObjectKey, string>();
      expect([...object.values()]).toEqual([]);
      const object2 = object.set({ id: 1 }, 'a');
      expect([...object2.values()]).toEqual(['a']);
      const object3 = object2.set({ id: 2 }, 'b');
      expect([...object3.values()]).toEqual(['a', 'b']);
      const object4 = object3.set({ id: 1 }, 'c');
      expect([...object4.values()]).toEqual(['c', 'b']);
      const object5 = object4.delete({ id: 1 });
      expect([...object5.values()]).toEqual(['b']);
    });

    test('entries()', () => {
      const primitive = new ImmutableMap<number, string>();
      expect([...primitive.entries()]).toEqual([]);
      const primitive2 = primitive.set(1, 'a');
      expect([...primitive2.entries()]).toEqual([[1, 'a']]);
      const primitive3 = primitive2.set(2, 'b');
      expect([...primitive3.entries()]).toEqual([[1, 'a'], [2, 'b']]);
      const primitive4 = primitive3.set(1, 'c');
      expect([...primitive4.entries()]).toEqual([[1, 'c'], [2, 'b']]);
      const primitive5 = primitive4.delete(1);
      expect([...primitive5.entries()]).toEqual([[2, 'b']]);

      const object = new ImmutableMap<ObjectKey, string>();
      expect([...object.entries()]).toEqual([]);
      const object2 = object.set({ id: 1 }, 'a');
      expect([...object2.entries()]).toEqual([[{ id: 1 }, 'a']]);
      const object3 = object2.set({ id: 2 }, 'b');
      expect([...object3.entries()]).toEqual([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      const object4 = object3.set({ id: 1 }, 'c');
      expect([...object4.entries()]).toEqual([[{ id: 1 }, 'c'], [{ id: 2 }, 'b']]);
      const object5 = object4.delete({ id: 1 });
      expect([...object5.entries()]).toEqual([[{ id: 2 }, 'b']]);
    });

    test('forEach()', () => {
      const primitive = new ImmutableMap([[1, 'a'], [2, 'b']]);
      const primitiveCallback = vi.fn<[v: string, k: number, map: Map<number, string>], void>();
      primitive.forEach(primitiveCallback);
      expect(primitiveCallback).toHaveBeenCalledTimes(2);
      expect(primitiveCallback).toHaveBeenCalledWith('a', 1, expect.anything());
      expect(primitiveCallback).toHaveBeenCalledWith('b', 2, expect.anything());

      const object = new ImmutableMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      const objectCallback = vi.fn<[v: string, k: ObjectKey, map: Map<ObjectKey, string>], void>();
      object.forEach(objectCallback);
      expect(objectCallback).toHaveBeenCalledTimes(2);
      expect(objectCallback).toHaveBeenCalledWith('a', { id: 1 }, expect.anything());
      expect(objectCallback).toHaveBeenCalledWith('b', { id: 2 }, expect.anything());
    });

    test('toStringTag', () => {
      const primitive = new ImmutableMap<number, string>();
      expect(primitive.toString()).toBe('[object ImmutableMap]');

      const object = new ImmutableMap<ObjectKey, string>();
      expect(object.toString()).toBe('[object ImmutableMap]');
    });
  })

  describe('Additional methods', test => {
    test('isEmpty()', () => {
      const primitive = new ImmutableMap<number, string>();
      expect(primitive.isEmpty()).toBe(true);
      const primitive2 = primitive.set(1, 'a');
      expect(primitive2.isEmpty()).toBe(false);
      const primitive3 = primitive2.delete(1);
      expect(primitive3.isEmpty()).toBe(true);

      const object = new ImmutableMap<ObjectKey, string>();
      expect(object.isEmpty()).toBe(true);
      const object2 = object.set({ id: 1 }, 'a');
      expect(object2.isEmpty()).toBe(false);
      const object3 = object2.delete({ id: 1 });
      expect(object3.isEmpty()).toBe(true);
    });

    test('equals()', () => {
      const primitive = new ImmutableMap([[1, 'a'], [2, 'b']]);
      const primitive2 = new ImmutableMap([[1, 'a'], [2, 'b']]);
      const primitive3 = new ImmutableMap([[1, 'a'], [2, 'c']]);
      const primitive4 = new ImmutableMap([[1, 'a'], [2, 'b'], [3, 'c']]);
      expect(primitive.equals(primitive2)).toBe(true);
      expect(primitive.equals(primitive3)).toBe(false);
      expect(primitive.equals(primitive4)).toBe(false);

      const object = new ImmutableMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      const object2 = new ImmutableMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      const object3 = new ImmutableMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'c']]);
      const object4 = new ImmutableMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b'], [{ id: 3 }, 'c']]);
      expect(object.equals(object2)).toBe(true);
      expect(object.equals(object3)).toBe(false);
      expect(object.equals(object4)).toBe(false);
    });

    test('clone()', () => {
      const primitive = new ImmutableMap([[1, 'a'], [2, 'b']]);
      const primitive2 = primitive.clone();

      expect(primitive2).toBeInstanceOf(ImmutableMap);
      expect(primitive2 === primitive).toBe(false);
      expect(primitive2.equals(primitive)).toBe(true);

      expect(primitive2.options).toEqual(primitive.options);
      expect(primitive2.size).toBe(2);
      expect(primitive2.get(1)).toBe('a');
      expect(primitive2.get(2)).toBe('b');

      const object = new ImmutableMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      const object2 = object.clone();

      expect(object2).toBeInstanceOf(ImmutableMap);
      expect(object2 === object).toBe(false);
      expect(object2.equals(object)).toBe(true);

      expect(object2.options).toEqual(object.options);
      expect(object2.size).toBe(2);
      expect(object2.get({ id: 1 })).toBe('a');
      expect(object2.get({ id: 2 })).toBe('b');
    });

    test('filter()', () => {
      const primitive = new ImmutableMap([[1, 1], [2, 4], [3, 9]]);

      const primitiveOdds = primitive.filter(v => v % 2 === 1);
      expect(primitiveOdds).toBeInstanceOf(ImmutableMap);
      expect(primitiveOdds === primitive).toBe(false);
      expect(primitiveOdds.size).toBe(2);
      expect([...primitiveOdds.entries()]).toEqual([[1, 1], [3, 9]]);

      const primitiveEvens = primitive.filter((_, k) => k % 2 === 0);
      expect(primitiveEvens).toBeInstanceOf(ImmutableMap);
      expect(primitiveEvens === primitive).toBe(false);
      expect(primitiveEvens.size).toBe(1);
      expect([...primitiveEvens.entries()]).toEqual([[2, 4]]);

      const object = new ImmutableMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);

      const objectOdds = object.filter(v => v % 2 === 1);
      expect(objectOdds).toBeInstanceOf(ImmutableMap);
      expect(objectOdds === object).toBe(false);
      expect(objectOdds.size).toBe(2);
      expect([...objectOdds.entries()]).toEqual([[{ id: 1 }, 1], [{ id: 3 }, 9]]);

      const objectEvens = object.filter((_, k) => k.id % 2 === 0);
      expect(objectEvens).toBeInstanceOf(ImmutableMap);
      expect(objectEvens === object).toBe(false);
      expect(objectEvens.size).toBe(1);
      expect([...objectEvens.entries()]).toEqual([[{ id: 2 }, 4]]);
    });

    test('map()', () => {
      const primitive = new ImmutableMap([[1, 1], [2, 4], [3, 9]]);

      const primitiveSquares = primitive.map(v => v * v);
      expect(primitiveSquares).toBeInstanceOf(ImmutableMap);
      expect(primitiveSquares === primitive).toBe(false);
      expect(primitiveSquares.size).toBe(3);
      expect([...primitiveSquares.entries()]).toEqual([[1, 1], [2, 16], [3, 81]]);

      const primitiveDoubles = primitive.map((v, k) => v + k);
      expect(primitiveDoubles).toBeInstanceOf(ImmutableMap);
      expect(primitiveDoubles === primitive).toBe(false);
      expect(primitiveDoubles.size).toBe(3);
      expect([...primitiveDoubles.entries()]).toEqual([[1, 2], [2, 6], [3, 12]]);

      const object = new ImmutableMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);

      const objectSquares = object.map(v => v * v);
      expect(objectSquares).toBeInstanceOf(ImmutableMap);
      expect(objectSquares === object).toBe(false);
      expect(objectSquares.size).toBe(3);
      expect([...objectSquares.entries()]).toEqual([[{ id: 1 }, 1], [{ id: 2 }, 16], [{ id: 3 }, 81]]);

      const objectDoubles = object.map((v, k) => v + k.id);
      expect(objectDoubles).toBeInstanceOf(ImmutableMap);
      expect(objectDoubles === object).toBe(false);
      expect(objectDoubles.size).toBe(3);
      expect([...objectDoubles.entries()]).toEqual([[{ id: 1 }, 2], [{ id: 2 }, 6], [{ id: 3 }, 12]]);
    });

    test('reduce()', () => {
      const primitive = new ImmutableMap([[1, 1], [2, 4], [3, 9]]);

      const primitiveSum = primitive.reduce((acc, v) => acc + v, 0);
      expect(primitiveSum).toBe(14);

      const primitiveProduct = primitive.reduce((acc, v) => acc * v, 1);
      expect(primitiveProduct).toBe(36);

      const object = new ImmutableMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);

      const objectSum = object.reduce((acc, v) => acc + v, 0);
      expect(objectSum).toBe(14);

      const objectProduct = object.reduce((acc, v) => acc * v, 1);
      expect(objectProduct).toBe(36);
    });

    test('some()', () => {
      const primitive = new ImmutableMap([[1, 1], [2, 4], [3, 9]]);

      const primitiveSome = primitive.some(v => v > 5);
      expect(primitiveSome).toBe(true);

      const primitiveSome2 = primitive.some(v => v > 10);
      expect(primitiveSome2).toBe(false);

      const object = new ImmutableMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);

      const objectSome = object.some(v => v > 5);
      expect(objectSome).toBe(true);

      const objectSome2 = object.some(v => v > 10);
      expect(objectSome2).toBe(false);
    });

    test('every()', () => {
      const primitive = new ImmutableMap([[1, 1], [2, 4], [3, 9]]);

      const primitiveEvery = primitive.every(v => v > 0);
      expect(primitiveEvery).toBe(true);

      const primitiveEvery2 = primitive.every(v => v > 1);
      expect(primitiveEvery2).toBe(false);

      const object = new ImmutableMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);

      const objectEvery = object.every(v => v > 0);
      expect(objectEvery).toBe(true);

      const objectEvery2 = object.every(v => v > 1);
      expect(objectEvery2).toBe(false);
    });

    test('sort()', () => {
      const primitive = new ImmutableMap([[1, 1], [2, 4], [3, 9]]);

      const primitiveSorted = primitive.sort(([, a], [, b]) => b - a);
      expect(primitiveSorted).toBeInstanceOf(ImmutableMap);
      expect(primitiveSorted === primitive).toBe(false);
      expect([...primitiveSorted.entries()]).toEqual([[3, 9], [2, 4], [1, 1]]);

      const object = new ImmutableMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);

      const objectSorted = object.sort(([a], [b]) => b.id - a.id);
      expect(objectSorted).toBeInstanceOf(ImmutableMap);
      expect(objectSorted === object).toBe(false);
      expect([...objectSorted.entries()]).toEqual([[{ id: 3 }, 9], [{ id: 2 }, 4], [{ id: 1 }, 1]]);
    });

    test('update()', () => {
      const primitive = new ImmutableMap([[1, 1], [2, 4], [3, 9]]);
      const primitive2 = primitive.update(1, v => {
        expect(v).toBe(1);
        return v! + 1;
      });
      expect(primitive2 === primitive).toBe(false);
      expect(primitive2.equals(primitive)).toBe(false);
      expect([...primitive2.entries()]).toEqual([[1, 2], [2, 4], [3, 9]]);
      const primitive3 = primitive2.update(4, v => {
        expect(v).toBe(undefined);
        return 4;
      });
      expect(primitive3 === primitive2).toBe(false);
      expect(primitive3.equals(primitive2)).toBe(false);
      expect([...primitive3.entries()]).toEqual([[1, 2], [2, 4], [3, 9], [4, 4]]);

      const object = new ImmutableMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
      const object2 = object.update({ id: 1 }, v => {
        expect(v).toBe(1);
        return v! + 1;
      });
      expect(object2 === object).toBe(false);
      expect(object2.equals(object)).toBe(false);
      expect([...object2.entries()]).toEqual([[{ id: 1 }, 2], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
      const object3 = object2.update({ id: 4 }, v => {
        expect(v).toBe(undefined);
        return 4;
      });
      expect(object3 === object2).toBe(false);
      expect(object3.equals(object2)).toBe(false);
      expect([...object3.entries()]).toEqual([[{ id: 1 }, 2], [{ id: 2 }, 4], [{ id: 3 }, 9], [{ id: 4 }, 4]]);
    });
  })

  describe('Static methods', test => {
    test('fromSet()', () => {
      const numbers = new Set([1, 2, 3]);
      const primitive = ImmutableMap.fromSet(numbers, v => v ** 2);
      expect(primitive).toBeInstanceOf(ImmutableMap);
      expect(primitive.size).toBe(3);
      expect([...primitive.entries()]).toEqual([[1, 1], [2, 4], [3, 9]]);

      const objects = new Set([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object = ImmutableMap.fromSet(objects, v => v.id ** 2);
      expect(object).toBeInstanceOf(ImmutableMap);
      expect(object.size).toBe(3);
      expect([...object.entries()]).toEqual([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
    });
  })
});