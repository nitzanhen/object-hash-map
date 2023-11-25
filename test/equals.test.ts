import { expect, test, describe } from 'vitest';
import { equals } from '../src';

// Tests shamefully stolen from `fast-deep-equal`'s tests

// Convert this data into a test suite

describe('equals()', test => {
  test('Scalars', () => {
    // Equal numbers
    expect(equals(1, 1)).toBe(true);

    // Not equal numbers
    expect(equals(1, 2)).toBe(false);

    // Number and array are not equal
    expect(equals(1, [])).toBe(false);

    // 0 and null are not equal
    expect(equals(0, null)).toBe(false);

    // Equal strings
    expect(equals('a', 'a')).toBe(true);

    // Not equal strings
    expect(equals('a', 'b')).toBe(false);

    // Empty string and null are not equal
    expect(equals('', null)).toBe(false);

    // Null is equal to null
    expect(equals(null, null)).toBe(true);

    // Equal booleans (true)
    expect(equals(true, true)).toBe(true);

    // Equal booleans (false)
    expect(equals(false, false)).toBe(true);

    // Not equal booleans
    expect(equals(true, false)).toBe(false);

    // 1 and true are not equal
    expect(equals(1, true)).toBe(false);

    // 0 and false are not equal
    expect(equals(0, false)).toBe(false);

    // NaN and NaN are equal
    expect(equals(NaN, NaN)).toBe(true);

    // 0 and -0 are equal
    expect(equals(0, -0)).toBe(true);

    // Infinity and Infinity are equal
    expect(equals(Infinity, Infinity)).toBe(true);

    // Infinity and -Infinity are not equal
    expect(equals(Infinity, -Infinity)).toBe(false);
  });

  test('Objects', () => {
    // Empty objects are equal
    expect(equals({}, {})).toBe(true);

    // Equal objects (same properties "order")
    expect(equals({ a: 1, b: '2' }, { a: 1, b: '2' })).toBe(true);

    // Equal objects (different properties "order")
    expect(equals({ a: 1, b: '2' }, { b: '2', a: 1 })).toBe(true);

    // Not equal objects (extra property)
    expect(equals({ a: 1, b: '2' }, { a: 1, b: '2', c: [] })).toBe(false);

    // Not equal objects (different property values)
    expect(equals({ a: 1, b: '2', c: 3 }, { a: 1, b: '2', c: 4 })).toBe(false);

    // Not equal objects (different properties)
    expect(equals({ a: 1, b: '2', c: 3 }, { a: 1, b: '2', d: 3 })).toBe(false);

    // Equal objects (same sub-properties)
    expect(equals({ a: [{ b: 'c' }] }, { a: [{ b: 'c' }] })).toBe(true);

    // Not equal objects (different sub-property value)
    expect(equals({ a: [{ b: 'c' }] }, { a: [{ b: 'd' }] })).toBe(false);

    // Not equal objects (different sub-property)
    expect(equals({ a: [{ b: 'c' }] }, { a: [{ c: 'c' }] })).toBe(false);

    // Empty array and empty object are not equal
    expect(equals({}, [])).toBe(false);

    // Object with extra undefined properties are not equal #1
    expect(equals({}, { foo: undefined })).toBe(false);

    // Object with extra undefined properties are not equal #2
    expect(equals({ foo: undefined }, {})).toBe(false);

    // Object with extra undefined properties are not equal #3
    expect(equals({ foo: undefined }, { bar: undefined })).toBe(false);

    // Nulls are equal
    expect(equals(null, null)).toBe(true);

    // Null and undefined are not equal
    expect(equals(null, undefined)).toBe(false);

    // Null and empty object are not equal
    expect(equals(null, {})).toBe(false);

    // Undefined and empty object are not equal
    expect(equals(undefined, {})).toBe(false);
  });

  test('Arrays', () => {
    // Two empty arrays are equal
    expect(equals([], [])).toBe(true);

    // Equal arrays
    expect(equals([1, 2, 3], [1, 2, 3])).toBe(true);

    // Not equal arrays (different item)
    expect(equals([1, 2, 3], [1, 2, 4])).toBe(false);

    // Not equal arrays (different length)
    expect(equals([1, 2, 3], [1, 2])).toBe(false);

    // Equal arrays of objects
    expect(equals([{ a: 'a' }, { b: 'b' }], [{ a: 'a' }, { b: 'b' }])).toBe(true);

    // Not equal arrays of objects
    expect(equals([{ a: 'a' }, { b: 'b' }], [{ a: 'a' }, { b: 'c' }])).toBe(false);

    // Pseudo array and equivalent array are not equal
    expect(equals({ '0': 0, '1': 1, length: 2 }, [0, 1])).toBe(false);
  });

  test('Date objects', () => {
    // Equal date objects
    expect(equals(new Date('2023-11-25T21:36:48.362Z'), new Date('2023-11-25T21:36:48.362Z'))).toBe(true);

    // Not equal date objects
    expect(equals(new Date('2023-11-25T21:36:48.362Z'), new Date('2023-01-01T00:00:00.000Z'))).toBe(false);

    // Date and string are not equal
    expect(equals(new Date('2023-11-25T21:36:48.362Z'), '2023-11-25T21:36:48.362Z')).toBe(false);

    // Date and object are not equal
    expect(equals(new Date('2023-11-25T21:36:48.362Z'), {})).toBe(false);
  });

  test('RegExp objects', () => {
    // Equal RegExp objects
    expect(equals(/foo/, /foo/)).toBe(true);

    // Not equal RegExp objects (different pattern)
    expect(equals(/foo/, /bar/)).toBe(false);

    // Not equal RegExp objects (different flags)
    expect(equals(/foo/, /foo/i)).toBe(false);

    // RegExp and string are not equal
    expect(equals(/foo/, 'foo')).toBe(false);

    // RegExp and object are not equal
    expect(equals(/foo/, {})).toBe(false);
  });

  test('Functions', () => {
    function func1() { }
    function func2() { }

    // Same function is equal
    expect(equals(func1, func1)).toBe(true);

    // Different functions are not equal
    expect(equals(func1, func2)).toBe(false);
  });

  test('Sample objects', () => {
    // Big object
    expect(equals(
      {
        prop1: 'value1',
        prop2: 'value2',
        prop3: 'value3',
        prop4: {
          subProp1: 'sub value1',
          subProp2: {
            subSubProp1: 'sub sub value1',
            subSubProp2: [1, 2, { prop2: 1, prop: 2 }, 4, 5]
          }
        },
        prop5: 1000,
        prop6: new Date(2023, 10, 25)
      },
      {
        prop5: 1000,
        prop3: 'value3',
        prop1: 'value1',
        prop2: 'value2',
        prop6: new Date('2023/11/25'),
        prop4: {
          subProp2: {
            subSubProp1: 'sub sub value1',
            subSubProp2: [1, 2, { prop2: 1, prop: 2 }, 4, 5]
          },
          subProp1: 'sub value1'
        }
      }
    )).toBe(true);
  });
});