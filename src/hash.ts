
type Hash = number;

export function hash(value: unknown): Hash {
  switch (typeof value) {
    case 'string':
      return hashString(value);
    case 'number':
    case 'bigint':
    case 'boolean':
    case 'symbol':
    case 'undefined':
    case 'function':
      return hashString(String(value));
    case 'object':
      if (value === null) {
        return hashString('null');
      }
      return hashObject(value as Record<string, unknown>);
  }
}

/**
 * See 
 * https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
 * https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 * https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
 */
function hashString(value: string): Hash {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch; i < value.length; i++) {
    ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Expects a non-null object
 */
function hashObject(value: Record<string, unknown>): Hash {
  if (Array.isArray(value)) {
    return hashArray(value);
  }

  const data: unknown[] = [];
  if (value.constructor !== Object) {
    data.push(value.constructor.name);
  }
  for (const key of Object.keys(value).sort()) {
    data.push(hash(key), hash(value[key]));
  }

  return hashArray(data);
}

function hashArray(value: unknown[]): Hash {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = 92821 * h + hash(value[i]);
    h |= 0; // Convert to 32bit integer
  }

  return h;
}

