/**
 * Deterministic Object Hash
 * @description Produces a stable string representation of an object for use in
 *              cache keys and request deduplication. Sorts keys recursively so
 *              that {a:1, b:2} and {b:2, a:1} hash the same, including for
 *              nested objects and arrays of objects.
 */

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep(record[key]);
        return acc;
      }, {});
  }
  return value;
}

/**
 * Convert any value into a deterministic string suitable for hashing.
 * Primitives stringify directly; objects are JSON-serialized with sorted keys.
 */
export function hashValue(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return String(value);
  }

  try {
    return JSON.stringify(sortKeysDeep(value));
  } catch {
    return String(value);
  }
}

/**
 * Hash multiple values into a single composite hash.
 * Useful for React dependency arrays or multi-argument cache keys.
 */
export function compositeHash(...values: unknown[]): string {
  return values.map(hashValue).join('|');
}
