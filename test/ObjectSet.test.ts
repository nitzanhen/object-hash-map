import { describe, test, expect } from 'vitest';
import { ObjectSet } from '../src';

describe('ObjectSet', () => {
  describe('Primitive values', () => {
    test('add()', () => {
      const set = new ObjectSet<string>();
      set.add('a');
      expect(set.has('a')).toBe(true);
      set.add('b');
      expect(set.has('b')).toBe(true);
      set.add('a');
      expect(set.has('a')).toBe(true);
    });

    test('has()', () => {
      const set = new ObjectSet<string>();
      set.add('a');
      expect(set.has('a')).toBe(true);
      expect(set.has('b')).toBe(false);
      set.add('b');
      expect(set.has('b')).toBe(true);
    });

    test('delete()', () => {
      const set = new ObjectSet<string>();
      set.add('a');
      expect(set.delete('a')).toBe(true);
      expect(set.has('a')).toBe(false);
      expect(set.delete('b')).toBe(false);
    });

    test('clear()', () => {
      const set = new ObjectSet<string>();
      set.add('a');
      set.add('b');
      set.clear();
      expect(set.has('a')).toBe(false);
      expect(set.has('b')).toBe(false);
    });

    test('size', () => {
      const set = new ObjectSet<string>();
      expect(set.size).toBe(0);
      set.add('a');
      expect(set.size).toBe(1);
      set.add('b');
      expect(set.size).toBe(2);
    });

    test('values()', () => {
      const set = new ObjectSet<string>();
      set.add('a');
      set.add('b');
      expect([...set.values()]).toEqual(['a', 'b']);

      set.delete('a');
      expect([...set.values()]).toEqual(['b']);
    });
  });

  describe('Object values', () => {
    test('add()', () => {
      const set = new ObjectSet<{ a: number }>();
      set.add({ a: 1 });
      expect(set.has({ a: 1 })).toBe(true);
      set.add({ a: 2 });
      expect(set.has({ a: 2 })).toBe(true);
      set.add({ a: 1 });
      expect(set.has({ a: 1 })).toBe(true);
    });

    test('has()', () => {
      const set = new ObjectSet<{ a: number }>();
      set.add({ a: 1 });
      expect(set.has({ a: 1 })).toBe(true);
      expect(set.has({ a: 2 })).toBe(false);
      set.add({ a: 2 });
      expect(set.has({ a: 2 })).toBe(true);
    });

    test('delete()', () => {
      const set = new ObjectSet<{ a: number }>();
      set.add({ a: 1 });
      expect(set.delete({ a: 1 })).toBe(true);
      expect(set.has({ a: 1 })).toBe(false);
      expect(set.delete({ a: 2 })).toBe(false);
    });

    test('clear()', () => {
      const set = new ObjectSet<{ a: number }>();
      set.add({ a: 1 });
      set.add({ a: 2 });
      set.clear();
      expect(set.has({ a: 1 })).toBe(false);
      expect(set.has({ a: 2 })).toBe(false);
    });

    test('size', () => {
      const set = new ObjectSet<{ a: number }>();
      expect(set.size).toBe(0);
      set.add({ a: 1 });
      expect(set.size).toBe(1);
      set.add({ a: 2 });
      expect(set.size).toBe(2);
    });

    test('values()', () => {
      const set = new ObjectSet<{ a: number }>();
      set.add({ a: 1 });
      set.add({ a: 2 });
      expect([...set.values()]).toEqual([{ a: 1 }, { a: 2 }]);

      set.delete({ a: 1 });
      expect([...set.values()]).toEqual([{ a: 2 }]);
    });
  });
})