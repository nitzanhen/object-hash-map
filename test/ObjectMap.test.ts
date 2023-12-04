import { expect, describe } from 'vitest';
import { ObjectMap } from '../src';

describe('ObjectMap', () => {
  describe('Primitive keys', test => {
    test('get() & set()', () => {
      const map = new ObjectMap<number, string>();
      map.set(1, 'a');
      expect(map.get(1)).toBe('a');
      map.set(2, 'b');
      expect(map.get(2)).toBe('b');
      map.set(1, 'c');
      expect(map.get(1)).toBe('c');
    })

    test('has()', () => {
      const map = new ObjectMap<number, string>();
      map.set(1, 'a');
      expect(map.has(1)).toBe(true);
      expect(map.has(2)).toBe(false);
      map.set(1, 'b')
      expect(map.has(1)).toBe(true);
    })

    test('delete()', () => {
      const map = new ObjectMap<number, string>();
      map.set(1, 'a');
      expect(map.delete(1)).toBe(true);
      expect(map.has(1)).toBe(false);
      expect(map.delete(2)).toBe(false);
    })

    test('clear()', () => {
      const map = new ObjectMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.clear();
      expect(map.has(1)).toBe(false);
      expect(map.has(2)).toBe(false);
    })

    test('size', () => {
      const map = new ObjectMap<number, string>();
      expect(map.size).toBe(0);
      map.set(1, 'a');
      expect(map.size).toBe(1);
      map.set(2, 'b');
      expect(map.size).toBe(2);
    })

    test('keys()', () => {
      const map = new ObjectMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      expect([...map.keys()]).toEqual([1, 2]);

      map.delete(1);
      expect([...map.keys()]).toEqual([2]);
    })

    test('values()', () => {
      const map = new ObjectMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      expect([...map.values()]).toEqual(['a', 'b']);

      map.delete(1);
      expect([...map.values()]).toEqual(['b']);
    })

    test('entries()', () => {
      const map = new ObjectMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      expect([...map.entries()]).toEqual([[1, 'a'], [2, 'b']]);

      map.delete(1);
      expect([...map.entries()]).toEqual([[2, 'b']]);
    })

    test('string keys', () => {
      const map = new ObjectMap<string, string>();
      map.set('a', 'a');
      expect(map.get('a')).toBe('a');
      map.set('b', 'b');
      expect(map.get('b')).toBe('b');
      map.set('a', 'c');
      expect(map.get('a')).toBe('c');

      expect(map.has('a')).toBe(true);
      expect(map.has('b')).toBe(true);
      expect(map.has('c')).toBe(false);

      expect([...map.entries()]).toEqual([['a', 'c'], ['b', 'b']]);
      expect(map.size).toBe(2);

      expect(map.delete('a')).toBe(true);
      expect(map.has('a')).toBe(false);

      expect([...map.entries()]).toEqual([['b', 'b']]);
      expect(map.size).toBe(1);

      map.clear();

      expect([...map.entries()]).toEqual([]);
      expect(map.size).toBe(0);

      expect(map.has('a')).toBe(false);
      expect(map.has('b')).toBe(false);
    })
  })

  describe('Object keys', test => {
    test('get() & set()', () => {
      const map = new ObjectMap<{ a: number }, string>();
      map.set({ a: 1 }, 'a');
      expect(map.get({ a: 1 })).toBe('a');

      map.set({ a: 2 }, 'b');
      expect(map.get({ a: 2 })).toBe('b');

      map.set({ a: 1 }, 'c');
      expect(map.get({ a: 1 })).toBe('c');
    })

    test('has()', () => {
      const map = new ObjectMap<{ a: number }, string>();
      map.set({ a: 1 }, 'a');
      expect(map.has({ a: 1 })).toBe(true);
      expect(map.has({ a: 2 })).toBe(false);

      map.set({ a: 1 }, 'b');
      expect(map.has({ a: 1 })).toBe(true);
    })

    test('delete()', () => {
      const map = new ObjectMap<{ a: number }, string>();
      map.set({ a: 1 }, 'a');
      expect(map.delete({ a: 1 })).toBe(true);
      expect(map.has({ a: 1 })).toBe(false);
      expect(map.delete({ a: 2 })).toBe(false);
    })

    test('clear()', () => {
      const map = new ObjectMap<{ a: number }, string>();
      map.set({ a: 1 }, 'a');
      map.set({ a: 2 }, 'b');
      map.clear();
      expect(map.has({ a: 1 })).toBe(false);
      expect(map.has({ a: 2 })).toBe(false);
    })

    test('size', () => {
      const map = new ObjectMap<{ a: number }, string>();
      expect(map.size).toBe(0);
      map.set({ a: 1 }, 'a');
      expect(map.size).toBe(1);
      map.set({ a: 2 }, 'b');
      expect(map.size).toBe(2);
    })

    test('keys()', () => {
      const map = new ObjectMap<{ a: number }, string>();
      map.set({ a: 1 }, 'a');
      map.set({ a: 2 }, 'b');
      expect([...map.keys()]).toEqual([{ a: 1 }, { a: 2 }]);

      map.delete({ a: 1 });
      expect([...map.keys()]).toEqual([{ a: 2 }]);
    })

    test('values()', () => {
      const map = new ObjectMap<{ a: number }, string>();
      map.set({ a: 1 }, 'a');
      map.set({ a: 2 }, 'b');
      expect([...map.values()]).toEqual(['a', 'b']);

      map.delete({ a: 1 });
      expect([...map.values()]).toEqual(['b']);
    })

    test('entries()', () => {
      const map = new ObjectMap<{ a: number }, string>();
      map.set({ a: 1 }, 'a');
      map.set({ a: 2 }, 'b');
      expect([...map.entries()]).toEqual([[{ a: 1 }, 'a'], [{ a: 2 }, 'b']]);

      map.delete({ a: 1 });
      expect([...map.entries()]).toEqual([[{ a: 2 }, 'b']]);
    })

    test('complex sample', () => {
      const map = new ObjectMap<{ a: number }, string>();
      map.set({ a: 1 }, 'a');
      expect(map.get({ a: 1 })).toBe('a');
      map.set({ a: 2 }, 'b');
      expect(map.get({ a: 2 })).toBe('b');
      map.set({ a: 1 }, 'c');
      expect(map.get({ a: 1 })).toBe('c');

      expect(map.has({ a: 1 })).toBe(true);
      expect(map.has({ a: 2 })).toBe(true);
      expect(map.has({ a: 3 })).toBe(false);

      expect([...map.entries()]).toEqual([[{ a: 1 }, 'c'], [{ a: 2 }, 'b']]);
      expect(map.size).toBe(2);

      expect(map.delete({ a: 1 })).toBe(true);
      expect(map.has({ a: 1 })).toBe(false);

      expect([...map.entries()]).toEqual([[{ a: 2 }, 'b']]);
      expect(map.size).toBe(1);

      map.clear();

      expect([...map.entries()]).toEqual([]);
      expect(map.size).toBe(0);

      expect(map.has({ a: 1 })).toBe(false);
      expect(map.has({ a: 2 })).toBe(false);
    })
  })
})