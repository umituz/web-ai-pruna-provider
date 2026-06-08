import { describe, it, expect } from 'vitest';
import {
  deriveRequestDeduplicationKey,
  deriveGenerationCacheKey,
} from './cache-key-derivation';

describe('deriveRequestDeduplicationKey', () => {
  it('includes method and url in the key', () => {
    const key = deriveRequestDeduplicationKey({ method: 'POST', url: 'https://api/x' });
    expect(key.startsWith('POST:https://api/x:')).toBe(true);
  });

  it('produces the same key regardless of body key order', () => {
    const k1 = deriveRequestDeduplicationKey({ method: 'POST', url: 'https://api/x', body: { a: 1, b: 2 } });
    const k2 = deriveRequestDeduplicationKey({ method: 'POST', url: 'https://api/x', body: { b: 2, a: 1 } });
    expect(k1).toBe(k2);
  });

  it('produces different keys for different bodies', () => {
    const k1 = deriveRequestDeduplicationKey({ method: 'POST', url: 'https://api/x', body: { a: 1 } });
    const k2 = deriveRequestDeduplicationKey({ method: 'POST', url: 'https://api/x', body: { a: 2 } });
    expect(k1).not.toBe(k2);
  });

  it('handles missing body gracefully', () => {
    const key = deriveRequestDeduplicationKey({ method: 'GET', url: 'https://api/x' });
    expect(key).toBe('GET:https://api/x:');
  });
});

describe('deriveGenerationCacheKey', () => {
  it('prefixes with the API key', () => {
    const key = deriveGenerationCacheKey('my-key', { model: 'p-image', prompt: 'hi' });
    expect(key.startsWith('my-key:')).toBe(true);
  });

  it('is stable across key reordering in the input', () => {
    const k1 = deriveGenerationCacheKey('k', { a: 1, b: 2 } as Record<string, unknown>);
    const k2 = deriveGenerationCacheKey('k', { b: 2, a: 1 } as Record<string, unknown>);
    expect(k1).toBe(k2);
  });

  it('changes when the API key changes', () => {
    const k1 = deriveGenerationCacheKey('k1', { x: 1 });
    const k2 = deriveGenerationCacheKey('k2', { x: 1 });
    expect(k1).not.toBe(k2);
  });
});
