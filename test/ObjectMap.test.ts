import { expect, describe, vi } from 'vitest';
import { ObjectMap, equals, hash } from '../src';

type ObjectKey = { id: number };

// copy the default functions, so that we don't get a false-positive that they're preserved
function _equals(a: unknown, b: unknown) {
  return equals(a, b)
}
function _hash(value: unknown) {
  return hash(value)
}

describe('ObjectMap', () => {
  describe('Constructor & internal logic', test => {
    test('reads iterable entries, if passed', () => {
      const fromArray = new ObjectMap([[1, 'a'], [2, 'b']]);
      expect(fromArray.size).toBe(2);
      expect(fromArray.get(1)).toBe('a');
      expect(fromArray.get(2)).toBe('b');

      const fromMap = new ObjectMap(new Map([[1, 'a'], [2, 'b']]));
      expect(fromMap.size).toBe(2);
      expect(fromMap.get(1)).toBe('a');
      expect(fromMap.get(2)).toBe('b');

      function* generator(): Generator<[number, string]> {
        yield [1, 'a'];
        yield [2, 'b'];
      }
      const fromGenerator = new ObjectMap(generator());
      expect(fromGenerator.size).toBe(2);
      expect(fromGenerator.get(1)).toBe('a');
      expect(fromGenerator.get(2)).toBe('b');

      const fromObjectMap = new ObjectMap(fromArray);
      expect(fromObjectMap.size).toBe(2);
      expect(fromObjectMap.get(1)).toBe('a');
      expect(fromObjectMap.get(2)).toBe('b');
    })
    test('handles options', () => {
      const customOptions = new ObjectMap(undefined, {
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
      expect(customOptions.capacity).toBe(1);
    })
    test('initialCapacity', () => {
      const defaultCapacity = new ObjectMap();
      expect(defaultCapacity.capacity).toBe(16);

      const customCapacity = new ObjectMap(undefined, { initialCapacity: 1 });
      expect(customCapacity.capacity).toBe(1);

      const iterWithLength = (function* (): Generator<[number, string]> { yield [1, 'a']; yield [2, 'b']; })();
      (iterWithLength as any).length = 2;
      const fromIterableWithLength = new ObjectMap(iterWithLength, { loadFactor: 1 });
      expect(fromIterableWithLength.capacity).toBe(2);
      const fromIterableWithLength2 = new ObjectMap(iterWithLength, { initialCapacity: 1, loadFactor: 1 });
      expect(fromIterableWithLength2.capacity).toBe(1);

      const iterWithSize = (function* (): Generator<[number, string]> { yield [1, 'a']; yield [2, 'b']; })();
      (iterWithSize as any).size = 2;
      const fromIterableWithSize = new ObjectMap(iterWithSize, { loadFactor: 1 });
      expect(fromIterableWithSize.capacity).toBe(2);
      const fromIterableWithSize2 = new ObjectMap(iterWithSize, { initialCapacity: 1, loadFactor: 1 });
      expect(fromIterableWithSize2.capacity).toBe(1);
    })
    test('copy constructor', () => {
      const map = new ObjectMap([[1, 'a'], [2, 'b']]);
      const copy = new ObjectMap(map);

      expect(copy).toBeInstanceOf(ObjectMap);
      expect(copy === map).toBe(false);
      expect(copy.equals(map)).toBe(true);

      expect(copy.options).toEqual(map.options);
      expect(copy.capacity).toBe(map.capacity);
      expect(copy.size).toBe(2);

      expect(copy.get(1)).toBe('a');
      expect(copy.get(2)).toBe('b');
    })

    test('copy constructor with options', () => {
      const map = new ObjectMap([[1, 'a'], [2, 'b']]);
      const copy = new ObjectMap(map, {
        initialCapacity: 100,
        loadFactor: 1,
        equals: _equals,
        hash: _hash,
      });

      expect(copy).toBeInstanceOf(ObjectMap);
      expect(copy === map).toBe(false);

      expect(copy.options).toEqual({
        loadFactor: 1,
        equals: _equals,
        hash: _hash,
      });
      expect(copy.capacity).toBe(100);
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

      const map = new ObjectMap([[1, 'a'], [2, 'b']], options);
      expect(map.options).toEqual(options);

      const clone = map.clone();
      expect(clone.options).toEqual(options);

      const emptyClone = map.emptyClone();
      expect(emptyClone.options).toEqual(options);

      const fromSet = ObjectMap.fromSet(new Set([1, 2, 3]), v => v, options);
      expect(fromSet.options).toEqual(options);
    })
  })

  describe('ES6 Map API', test => {
    test('get() & set()', () => {
      const primitive = new ObjectMap<number, string>();
      primitive.set(1, 'a');
      expect(primitive.get(1)).toBe('a');
      primitive.set(2, 'b');
      expect(primitive.get(2)).toBe('b');
      primitive.set(1, 'c');
      expect(primitive.get(1)).toBe('c');

      expect(primitive.get(3)).toBe(undefined);

      const object = new ObjectMap<ObjectKey, string>();
      object.set({ id: 1 }, 'a');
      expect(object.get({ id: 1 })).toBe('a');
      object.set({ id: 2 }, 'b');
      expect(object.get({ id: 2 })).toBe('b');
      object.set({ id: 1 }, 'c');
      expect(object.get({ id: 1 })).toBe('c');

      expect(object.get({ id: 3 })).toBe(undefined);
    });

    test('delete()', () => {
      const primitive = new ObjectMap<number, string>();
      primitive.set(1, 'a');
      expect(primitive.delete(1)).toBe(true);
      expect(primitive.has(1)).toBe(false);
      expect(primitive.delete(2)).toBe(false);

      const object = new ObjectMap<ObjectKey, string>();
      object.set({ id: 1 }, 'a');
      expect(object.delete({ id: 1 })).toBe(true);
      expect(object.has({ id: 1 })).toBe(false);
      expect(object.delete({ id: 2 })).toBe(false);
    });

    test('has()', () => {
      const primitive = new ObjectMap<number, string>();
      primitive.set(1, 'a');
      expect(primitive.has(1)).toBe(true);
      expect(primitive.has(2)).toBe(false);
      primitive.set(1, 'b');
      expect(primitive.has(1)).toBe(true);

      const object = new ObjectMap<ObjectKey, string>();
      object.set({ id: 1 }, 'a');
      expect(object.has({ id: 1 })).toBe(true);
      expect(object.has({ id: 2 })).toBe(false);
      object.set({ id: 1 }, 'b');
      expect(object.has({ id: 1 })).toBe(true);
    });

    test('clear()', () => {
      const primitive = new ObjectMap<number, string>();
      primitive.set(1, 'a');
      primitive.set(2, 'b');
      primitive.clear();
      expect(primitive.has(1)).toBe(false);
      expect(primitive.has(2)).toBe(false);

      const object = new ObjectMap<ObjectKey, string>();
      object.set({ id: 1 }, 'a');
      object.set({ id: 2 }, 'b');
      object.clear();
      expect(object.has({ id: 1 })).toBe(false);
      expect(object.has({ id: 2 })).toBe(false);
    });

    test('size', () => {
      const primitive = new ObjectMap<number, string>();
      expect(primitive.size).toBe(0);
      primitive.set(1, 'a');
      expect(primitive.size).toBe(1);
      primitive.set(2, 'b');
      expect(primitive.size).toBe(2);
      primitive.clear();
      expect(primitive.size).toBe(0);

      const object = new ObjectMap<ObjectKey, string>();
      expect(object.size).toBe(0);
      object.set({ id: 1 }, 'a');
      expect(object.size).toBe(1);
      object.set({ id: 2 }, 'b');
      expect(object.size).toBe(2);
      object.clear();
      expect(object.size).toBe(0);
    });

    test('keys()', () => {
      const primitive = new ObjectMap<number, string>();
      primitive.set(1, 'a');
      primitive.set(2, 'b');
      expect([...primitive.keys()]).toEqual([1, 2]);
      primitive.set(1, 'c');
      expect([...primitive.keys()]).toEqual([1, 2]);
      primitive.delete(1);
      expect([...primitive.keys()]).toEqual([2]);

      const object = new ObjectMap<ObjectKey, string>();
      object.set({ id: 1 }, 'a');
      object.set({ id: 2 }, 'b');
      expect([...object.keys()]).toEqual([{ id: 1 }, { id: 2 }]);
      object.set({ id: 1 }, 'c');
      expect([...object.keys()]).toEqual([{ id: 1 }, { id: 2 }]);
      object.delete({ id: 1 });
      expect([...object.keys()]).toEqual([{ id: 2 }]);
    });

    test('values()', () => {
      const primitive = new ObjectMap<number, string>();
      primitive.set(1, 'a');
      primitive.set(2, 'b');
      expect([...primitive.values()]).toEqual(['a', 'b']);
      primitive.set(1, 'c');
      expect([...primitive.values()]).toEqual(['c', 'b']);
      primitive.delete(1);
      expect([...primitive.values()]).toEqual(['b']);

      const object = new ObjectMap<ObjectKey, string>();
      object.set({ id: 1 }, 'a');
      object.set({ id: 2 }, 'b');
      expect([...object.values()]).toEqual(['a', 'b']);
      object.set({ id: 1 }, 'c');
      expect([...object.values()]).toEqual(['c', 'b']);
      object.delete({ id: 1 });
      expect([...object.values()]).toEqual(['b']);
    });

    test('entries()', () => {
      const primitive = new ObjectMap<number, string>();
      primitive.set(1, 'a');
      primitive.set(2, 'b');
      expect([...primitive.entries()]).toEqual([[1, 'a'], [2, 'b']]);
      primitive.set(1, 'c');
      expect([...primitive.entries()]).toEqual([[1, 'c'], [2, 'b']]);
      primitive.delete(1);
      expect([...primitive.entries()]).toEqual([[2, 'b']]);

      const object = new ObjectMap<ObjectKey, string>();
      object.set({ id: 1 }, 'a');
      object.set({ id: 2 }, 'b');
      expect([...object.entries()]).toEqual([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      object.set({ id: 1 }, 'c');
      expect([...object.entries()]).toEqual([[{ id: 1 }, 'c'], [{ id: 2 }, 'b']]);
      object.delete({ id: 1 });
      expect([...object.entries()]).toEqual([[{ id: 2 }, 'b']]);
    });

    test('forEach()', () => {
      const primitive = new ObjectMap<number, string>();
      primitive.set(1, 'a');
      primitive.set(2, 'b');
      const primitiveCallback = vi.fn<[v: string, k: number, map: Map<number, string>], void>();
      primitive.forEach(primitiveCallback);
      expect(primitiveCallback).toHaveBeenCalledTimes(2);
      expect(primitiveCallback).toHaveBeenCalledWith('a', 1, primitive);
      expect(primitiveCallback).toHaveBeenCalledWith('b', 2, primitive);

      const object = new ObjectMap<ObjectKey, string>();
      object.set({ id: 1 }, 'a');
      object.set({ id: 2 }, 'b');
      const objectCallback = vi.fn<[v: string, k: ObjectKey, map: Map<ObjectKey, string>], void>();
      object.forEach(objectCallback);
      expect(objectCallback).toHaveBeenCalledTimes(2);
      expect(objectCallback).toHaveBeenCalledWith('a', { id: 1 }, object);
      expect(objectCallback).toHaveBeenCalledWith('b', { id: 2 }, object);
    });

    test('toStringTag', () => {
      const primitive = new ObjectMap<number, string>();
      expect(primitive.toString()).toBe('[object ObjectMap]');

      const object = new ObjectMap<ObjectKey, string>();
      expect(object.toString()).toBe('[object ObjectMap]');
    });
  })

  describe('Additional methods', test => {
    test('isEmpty()', () => {
      const primitive = new ObjectMap<number, string>();
      expect(primitive.isEmpty()).toBe(true);
      primitive.set(1, 'a');
      expect(primitive.isEmpty()).toBe(false);
      primitive.delete(1);
      expect(primitive.isEmpty()).toBe(true);

      const object = new ObjectMap<ObjectKey, string>();
      expect(object.isEmpty()).toBe(true);
      object.set({ id: 1 }, 'a');
      expect(object.isEmpty()).toBe(false);
      object.delete({ id: 1 });
      expect(object.isEmpty()).toBe(true);
    });

    test('equals()', () => {
      const primitive1 = new ObjectMap([[1, 'a'], [2, 'b']]);
      const primitive2 = new ObjectMap([[1, 'a'], [2, 'b']]);
      const primitive3 = new ObjectMap([[1, 'a'], [2, 'c']]);
      const primitive4 = new ObjectMap([[1, 'a'], [2, 'b'], [3, 'c']]);
      expect(primitive1.equals(primitive2)).toBe(true);
      expect(primitive1.equals(primitive3)).toBe(false);
      expect(primitive1.equals(primitive4)).toBe(false);

      const object1 = new ObjectMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      const object2 = new ObjectMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      const object3 = new ObjectMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'c']]);
      const object4 = new ObjectMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b'], [{ id: 3 }, 'c']]);
      expect(object1.equals(object2)).toBe(true);
      expect(object1.equals(object3)).toBe(false);
      expect(object1.equals(object4)).toBe(false);
    });

    test('clone()', () => {
      const primitive = new ObjectMap([[1, 'a'], [2, 'b']]);
      const primitiveClone = primitive.clone();

      expect(primitiveClone).toBeInstanceOf(ObjectMap);
      expect(primitiveClone === primitive).toBe(false);
      expect(primitiveClone.equals(primitive)).toBe(true);

      expect(primitiveClone.options).toEqual(primitive.options);
      expect(primitiveClone.capacity).toBe(primitive.capacity);
      expect(primitiveClone.size).toBe(2);

      expect(primitiveClone.get(1)).toBe('a');
      expect(primitiveClone.get(2)).toBe('b');


      const object = new ObjectMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      const objectClone = object.clone();

      expect(objectClone).toBeInstanceOf(ObjectMap);
      expect(objectClone === object).toBe(false);
      expect(objectClone.equals(object)).toBe(true);

      expect(objectClone.options).toEqual(object.options);
      expect(objectClone.capacity).toBe(object.capacity);
      expect(objectClone.size).toBe(2);

      expect(objectClone.get({ id: 1 })).toBe('a');
      expect(objectClone.get({ id: 2 })).toBe('b');
    });

    test('emptyClone()', () => {
      const primitive = new ObjectMap([[1, 'a'], [2, 'b']]);
      const primitiveClone = primitive.emptyClone();

      expect(primitiveClone).toBeInstanceOf(ObjectMap);
      expect(primitiveClone === primitive).toBe(false);
      expect(primitiveClone.equals(primitive)).toBe(false);

      expect(primitiveClone.options).toEqual(primitive.options);
      expect(primitiveClone.capacity).toBe(primitive.capacity);
      expect(primitiveClone.size).toBe(0);

      expect(primitiveClone.has(1)).toBe(false);
      expect(primitiveClone.has(2)).toBe(false);


      const object = new ObjectMap([[{ id: 1 }, 'a'], [{ id: 2 }, 'b']]);
      const objectClone = object.emptyClone();

      expect(objectClone).toBeInstanceOf(ObjectMap);
      expect(objectClone === object).toBe(false);
      expect(objectClone.equals(object)).toBe(false);

      expect(objectClone.options).toEqual(object.options);
      expect(objectClone.capacity).toBe(object.capacity);
      expect(objectClone.size).toBe(0);

      expect(objectClone.has({ id: 1 })).toBe(false);
      expect(objectClone.has({ id: 2 })).toBe(false);
    });

    test('filter()', () => {
      const primitive = new ObjectMap([[1, 1], [2, 4], [3, 9]]);
      const primitiveOdds = primitive.filter(v => v % 2 === 1);
      expect(primitiveOdds).toBeInstanceOf(ObjectMap);
      expect(primitiveOdds === primitive).toBe(false);
      expect(primitiveOdds.size).toBe(2);
      expect([...primitiveOdds.entries()]).toEqual([[1, 1], [3, 9]]);

      const primitiveEvens = primitive.filter((_, k) => k % 2 === 0);
      expect(primitiveEvens).toBeInstanceOf(ObjectMap);
      expect(primitiveEvens === primitive).toBe(false);
      expect(primitiveEvens.size).toBe(1);
      expect([...primitiveEvens.entries()]).toEqual([[2, 4]]);

      const object = new ObjectMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
      const objectOdds = object.filter(v => v % 2 === 1);
      expect(objectOdds).toBeInstanceOf(ObjectMap);
      expect(objectOdds === object).toBe(false);
      expect(objectOdds.size).toBe(2);
      expect([...objectOdds.entries()]).toEqual([[{ id: 1 }, 1], [{ id: 3 }, 9]]);

      const objectEvens = object.filter((_, k) => k.id % 2 === 0);
      expect(objectEvens).toBeInstanceOf(ObjectMap);
      expect(objectEvens === object).toBe(false);
      expect(objectEvens.size).toBe(1);
      expect([...objectEvens.entries()]).toEqual([[{ id: 2 }, 4]]);
    });

    test('map()', () => {
      const primitive = new ObjectMap([[1, 1], [2, 4], [3, 9]]);
      const primitiveSquares = primitive.map(v => v ** 2);

      expect(primitiveSquares).toBeInstanceOf(ObjectMap);
      expect(primitiveSquares === primitive).toBe(false);
      expect(primitiveSquares.size).toBe(3);
      expect([...primitiveSquares.entries()]).toEqual([[1, 1], [2, 16], [3, 81]]);

      const primitiveDoubles = primitive.map((v, k) => v + k);
      expect(primitiveDoubles).toBeInstanceOf(ObjectMap);
      expect(primitiveDoubles === primitive).toBe(false);
      expect(primitiveDoubles.size).toBe(3);
      expect([...primitiveDoubles.entries()]).toEqual([[1, 2], [2, 6], [3, 12]]);

      const object = new ObjectMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
      const objectSquares = object.map(v => v ** 2);

      expect(objectSquares).toBeInstanceOf(ObjectMap);
      expect(objectSquares === object).toBe(false);
      expect(objectSquares.size).toBe(3);
      expect([...objectSquares.entries()]).toEqual([[{ id: 1 }, 1], [{ id: 2 }, 16], [{ id: 3 }, 81]]);

      const objectDoubles = object.map((v, k) => v + k.id);
      expect(objectDoubles).toBeInstanceOf(ObjectMap);
      expect(objectDoubles === object).toBe(false);
      expect(objectDoubles.size).toBe(3);
      expect([...objectDoubles.entries()]).toEqual([[{ id: 1 }, 2], [{ id: 2 }, 6], [{ id: 3 }, 12]]);
    });

    test('reduce()', () => {
      const primitive = new ObjectMap([[1, 1], [2, 4], [3, 9]]);
      const primitiveSum = primitive.reduce((acc, v) => acc + v, 0);

      expect(primitiveSum).toBe(14);

      const primitiveProduct = primitive.reduce((acc, v) => acc * v, 1);
      expect(primitiveProduct).toBe(36);

      const object = new ObjectMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
      const objectSum = object.reduce((acc, v) => acc + v, 0);

      expect(objectSum).toBe(14);

      const objectProduct = object.reduce((acc, v) => acc * v, 1);
      expect(objectProduct).toBe(36);

    });

    test('some()', () => {
      const primitive = new ObjectMap([[1, 1], [2, 4], [3, 9]]);
      const primitiveSome = primitive.some(v => v ** 2 === v);
      expect(primitiveSome).toBe(true);

      const primitiveNone = primitive.some((v, k) => v === k + 1);
      expect(primitiveNone).toBe(false);


      const object = new ObjectMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
      const objectSome = object.some(v => v ** 2 === v);
      expect(objectSome).toBe(true);

      const objectNone = object.some((v, k) => v === k.id + 1);
      expect(objectNone).toBe(false);
    });

    test('every()', () => {
      const primitive = new ObjectMap([[1, 1], [2, 4], [3, 9]]);
      const primitiveEvery = primitive.every(v => v ** 2 === v);
      expect(primitiveEvery).toBe(false);

      const primitiveAll = primitive.every((v, k) => v + k < 100);
      expect(primitiveAll).toBe(true);


      const object = new ObjectMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
      const objectEvery = object.every(v => v ** 2 === v);
      expect(objectEvery).toBe(false);

      const objectAll = object.every((v, k) => v + k.id < 100);
      expect(objectAll).toBe(true);
    });

    test('sort()', () => {
      const primitive = new ObjectMap([[1, 1], [2, 4], [3, 9]]);
      const primitiveSorted = primitive.sort(([keyA, valueA], [keyB, valueB]) => (valueB + keyB) - (valueA + keyA));
      expect(primitiveSorted === primitive).toBe(true);
      expect([...primitiveSorted.entries()]).toEqual([[3, 9], [2, 4], [1, 1]]);

      const object = new ObjectMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
      const objectSorted = object.sort(([keyA, valueA], [keyB, valueB]) => (valueB + keyB.id) - (valueA + keyA.id));
      expect(objectSorted === object).toBe(true);
      expect([...objectSorted.entries()]).toEqual([[{ id: 3 }, 9], [{ id: 2 }, 4], [{ id: 1 }, 1]]);
    });

    test('pop()', () => {
      const primitive = new ObjectMap([[1, 1], [2, 4], [3, 9]]);
      const result = primitive.pop(1);
      expect(result).toBe(1);
      expect(primitive.size).toBe(2);
      expect(primitive.has(1)).toBe(false);
      expect(primitive.pop(1)).toBe(undefined);

      const object = new ObjectMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
      const objectResult = object.pop({ id: 1 });
      expect(objectResult).toBe(1);
      expect(object.size).toBe(2);
      expect(object.has({ id: 1 })).toBe(false);
      expect(object.pop({ id: 1 })).toBe(undefined);
    })

    test('update()', () => {
      const primitive = new ObjectMap([[1, 1], [2, 4], [3, 9]]);
      primitive.update(1, v => {
        expect(v).toBe(1);
        return v! + 1;
      });
      expect([...primitive.entries()]).toEqual([[1, 2], [2, 4], [3, 9]]);
      primitive.update(4, v => {
        expect(v).toBe(undefined);
        return 4;
      });
      expect([...primitive.entries()]).toEqual([[1, 2], [2, 4], [3, 9], [4, 4]]);

      const object = new ObjectMap([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
      object.update({ id: 1 }, v => {
        expect(v).toBe(1);
        return v! + 1;
      });
      expect([...object.entries()]).toEqual([[{ id: 1 }, 2], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
      object.update({ id: 4 }, v => {
        expect(v).toBe(undefined);
        return 4;
      });
      expect([...object.entries()]).toEqual([[{ id: 1 }, 2], [{ id: 2 }, 4], [{ id: 3 }, 9], [{ id: 4 }, 4]]);
    })
  })

  describe('static factories', test => {
    test('fromSet()', () => {
      const numbers = new Set([1, 2, 3]);
      const primitive = ObjectMap.fromSet(numbers, v => v ** 2);
      expect(primitive).toBeInstanceOf(ObjectMap);
      expect(primitive.size).toBe(3);
      expect([...primitive.entries()]).toEqual([[1, 1], [2, 4], [3, 9]]);

      const objects = new Set([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const object = ObjectMap.fromSet(objects, v => v.id ** 2);
      expect(object).toBeInstanceOf(ObjectMap);
      expect(object.size).toBe(3);
      expect([...object.entries()]).toEqual([[{ id: 1 }, 1], [{ id: 2 }, 4], [{ id: 3 }, 9]]);
    })
  })
})