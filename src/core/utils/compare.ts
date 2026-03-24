/**
 * Deep Comparison Utilities
 * @description Tree-shakeable comparison functions for React memoization
 */

/**
 * Fast shallow comparison for objects and arrays
 * @returns boolean - true if objects are shallowly equal
 */
export function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if ((a as Record<string, unknown>)[key] !== (b as Record<string, unknown>)[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Generate a hash from an object for quick comparison
 * Uses JSON.stringify but with sorted keys for consistency
 * @returns string - Hash string for comparison
 */
export function hashObject(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return String(obj);
  }

  try {
    return JSON.stringify(obj, Object.keys(obj).sort());
  } catch {
    return String(obj);
  }
}

/**
 * Memoization hash for React dependencies
 * @returns string - Deterministic hash for memoization
 */
export function memoHash(...args: unknown[]): string {
  return args.map(hashObject).join('|');
}
