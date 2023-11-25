
const isObject = (x: unknown): x is object => !!x && typeof x === 'object';

/**
 * Deep equality function. Draws inspiration from `fast-deep-equal`'s implementation.
 */
export function equals(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (!isObject(a) || !isObject(b)) {
    // a and b are not both objects, and not strictly equal;
    // return `true` only if they're both NaN (tested by `x !== x`)
    return a !== a && b !== b;
  }

  // a and b are both objects.
  if (a.constructor !== b.constructor) {
    return false;
  }

  // Array

  // This is equivalent to `isArray(a) || isArray(b)`, since a and b have the same constuctor;
  // A `&&` check is used here (and below) for the type checker.
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    const length = a.length; // === b.length
    for (let i = 0; i < length; i++) {
      if (!equals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  // Set

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) {
      return false;
    }

    // Two sets of equal size - they're equal iff a is contained in b.
    for (const x of a.values()) {
      if (!b.has(x)) {
        return false;
      }
    }
    return true;
  }

  // Map
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) {
      // Only one is a map but not both, or they have different size
      return false;
    }

    // Two maps of the same size - they're equal iff a is contained in b.
    for (const [key, value] of a.entries()) {
      if (!b.has(key) || !equals(b.get(key), value)) {
        return false;
      }
    }
    return true;
  }

  // Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Regex - equality means equality of source and flags
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  // Compare keys & values directly
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) {
    return false;
  }

  // Both key sets have the same size - they're equal iff a is contained in b.
  for (const key of keys) {
    if (
      !Object.hasOwn(b, key) ||
      !equals((b as any)[key], (a as any)[key])) {
      return false;
    }
  }

  return true;
}