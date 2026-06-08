import { describe, it, expect } from 'vitest';
import { shallowEqual } from './compare';

describe('shallowEqual', () => {
  it('returns true for the same reference', () => {
    const obj = { a: 1 };
    expect(shallowEqual(obj, obj)).toBe(true);
  });

  it('returns true for structurally identical primitives', () => {
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual('a', 'a')).toBe(true);
    expect(shallowEqual(null, null)).toBe(true);
    expect(shallowEqual(undefined, undefined)).toBe(true);
  });

  it('returns false for different primitive types', () => {
    expect(shallowEqual(1, '1')).toBe(false);
    expect(shallowEqual(null, undefined)).toBe(false);
  });

  it('returns true for shallowly equal objects', () => {
    expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  });

  it('returns false for objects with different keys', () => {
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('returns false when a value differs', () => {
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('returns false when comparing an object to null', () => {
    expect(shallowEqual({ a: 1 }, null)).toBe(false);
  });

  it('returns true for shallowly equal arrays', () => {
    expect(shallowEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });
});
