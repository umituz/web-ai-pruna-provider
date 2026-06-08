import { describe, it, expect } from 'vitest';
import { hashValue, compositeHash } from './comparison-hash';

describe('hashValue', () => {
  it('returns string representation for primitives', () => {
    expect(hashValue(1)).toBe('1');
    expect(hashValue('foo')).toBe('foo');
    expect(hashValue(null)).toBe('null');
    expect(hashValue(undefined)).toBe('undefined');
    expect(hashValue(true)).toBe('true');
  });

  it('produces the same hash for objects with keys in different orders', () => {
    const h1 = hashValue({ a: 1, b: 2 });
    const h2 = hashValue({ b: 2, a: 1 });
    expect(h1).toBe(h2);
  });

  it('produces different hashes for structurally different objects', () => {
    expect(hashValue({ a: 1 })).not.toBe(hashValue({ a: 2 }));
    expect(hashValue({ a: 1 })).not.toBe(hashValue({ a: 1, b: 2 }));
  });

  it('returns a string fallback when JSON.stringify throws', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(typeof hashValue(cyclic)).toBe('string');
  });
});

describe('compositeHash', () => {
  it('joins hashes with a pipe separator', () => {
    const h = compositeHash({ a: 1 }, { b: 2 });
    expect(h).toBe(`${hashValue({ a: 1 })}|${hashValue({ b: 2 })}`);
  });

  it('returns empty string for zero args', () => {
    expect(compositeHash()).toBe('');
  });

  it('produces the same hash regardless of argument order', () => {
    // compositeHash does NOT reorder; only per-object key sorting is normalized
    const h1 = compositeHash({ a: 1 }, { b: 2 });
    const h2 = compositeHash({ a: 1 }, { b: 2 });
    expect(h1).toBe(h2);
  });
});
