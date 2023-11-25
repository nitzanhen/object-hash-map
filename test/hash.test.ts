import { expect, test, describe } from 'vitest';
import { hash } from '../src/hash';

describe('hash()', () => {
  test('hashes strings', () => {
    const input = 'test';
    const result = hash(input);
    expect(typeof result).toBe('number');
  });

  test('hashes numbers', () => {
    const input = 123;
    const result = hash(input);
    expect(typeof result).toBe('number');
  });

  test('hashes bigints', () => {
    const input = BigInt(123);
    const result = hash(input);
    expect(typeof result).toBe('number');
  });

  test('hashes booleans', () => {
    const input = true;
    const result = hash(input);
    expect(typeof result).toBe('number');
  });

  test('hashes symbols', () => {
    const input = Symbol('test');
    const result = hash(input);
    expect(typeof result).toBe('number');
  });

  test('hashes undefined', () => {
    const input = undefined;
    const result = hash(input);
    expect(typeof result).toBe('number');
  });

  test('hashes functions', () => {
    const input = function() {};
    const result = hash(input);
    expect(typeof result).toBe('number');
  });

  test('hashes null', () => {
    const input = null;
    const result = hash(input);
    expect(typeof result).toBe('number');
  });

  test('hashes objects', () => {
    const input = { a: 1, b: '2' };
    const result = hash(input);
    expect(typeof result).toBe('number');
  });
});