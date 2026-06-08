import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LRUCache } from './lru-cache';

describe('LRUCache', () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache<string, number>({ maxSize: 3, ttl: 1000 });
  });

  it('stores and retrieves values', () => {
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
  });

  it('returns undefined for missing keys', () => {
    expect(cache.get('missing')).toBeUndefined();
  });

  it('evicts the least recently used entry when full', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4); // Should evict 'a'

    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
    expect(cache.get('d')).toBe(4);
  });

  it('promotes accessed entries to most recently used', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.get('a'); // 'a' is now most recently used
    cache.set('d', 4); // Should evict 'b'

    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
  });

  it('updates the value when set is called with an existing key', () => {
    cache.set('a', 1);
    cache.set('a', 2);
    expect(cache.get('a')).toBe(2);
    expect(cache.size()).toBe(1);
  });

  it('expires entries after TTL', () => {
    vi.useFakeTimers();
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);

    vi.advanceTimersByTime(1500);
    expect(cache.get('a')).toBeUndefined();
    vi.useRealTimers();
  });

  it('invokes onEvict callback when an entry is evicted', () => {
    const evicted: Array<[string, number]> = [];
    const c = new LRUCache<string, number>({
      maxSize: 2,
      onEvict: (k, v) => evicted.push([k, v]),
    });
    c.set('a', 1);
    c.set('b', 2);
    c.set('c', 3);

    expect(evicted).toEqual([['a', 1]]);
  });

  it('deletes a key and returns true when present', () => {
    cache.set('a', 1);
    expect(cache.delete('a')).toBe(true);
    expect(cache.get('a')).toBeUndefined();
  });

  it('returns false when deleting a missing key', () => {
    expect(cache.delete('missing')).toBe(false);
  });

  it('clears all entries', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('a')).toBeUndefined();
  });

  it('cleanup() removes expired entries', () => {
    vi.useFakeTimers();
    cache.set('a', 1);
    vi.advanceTimersByTime(1500);
    cache.cleanup();
    expect(cache.size()).toBe(0);
    vi.useRealTimers();
  });
});
