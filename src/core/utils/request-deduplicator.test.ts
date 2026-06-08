import { describe, it, expect, beforeEach } from 'vitest';
import { RequestDeduplicator, globalDeduplicator, createDeduplicationKey } from './request-deduplicator';

describe('RequestDeduplicator', () => {
  let dedup: RequestDeduplicator;

  beforeEach(() => {
    dedup = new RequestDeduplicator(1000);
  });

  it('executes a new request when none is in flight', async () => {
    const result = await dedup.execute('k1', () => Promise.resolve('ok'));
    expect(result).toBe('ok');
  });

  it('coalesces concurrent calls with the same key into the same promise', async () => {
    let resolveFn: (v: string) => void = () => {};
    const fn = (): Promise<string> => new Promise(resolve => { resolveFn = resolve; });

    const p1 = dedup.execute('k1', fn);
    const p2 = dedup.execute('k1', fn);

    // Both consumers receive the same in-flight promise
    expect(p1).toBe(p2);

    resolveFn('done');
    await expect(p1).resolves.toBe('done');
    await expect(p2).resolves.toBe('done');
  });

  it('clears in-flight entries after the grace period', async () => {
    await dedup.execute('k1', () => Promise.resolve(1));
    // Entry is cleared via setTimeout(CLEANUP_GRACE_MS). Wait for that.
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(dedup.size()).toBe(0);
  });

  it('creates a fresh promise after the TTL window has elapsed', async () => {
    const dedupShort = new RequestDeduplicator(50);
    let firstCalled = 0;
    let secondCalled = 0;

    const p1 = dedupShort.execute('k1', () => {
      firstCalled += 1;
      return new Promise<number>(() => { /* never resolves */ });
    });
    // Wait past the TTL
    await new Promise(resolve => setTimeout(resolve, 80));
    const p2 = dedupShort.execute('k1', () => {
      secondCalled += 1;
      return Promise.resolve(99);
    });

    expect(firstCalled).toBe(1);
    expect(secondCalled).toBe(1);
    expect(p1).not.toBe(p2);
    await expect(p2).resolves.toBe(99);
  });

  it('clear() drops all entries', () => {
    dedup.execute('k1', () => new Promise(() => {})); // never resolves
    dedup.clear();
    expect(dedup.size()).toBe(0);
  });

  it('globalDeduplicator is an instance of RequestDeduplicator', () => {
    expect(globalDeduplicator).toBeInstanceOf(RequestDeduplicator);
  });
});

describe('createDeduplicationKey', () => {
  it('includes method and url in the key', () => {
    const key = createDeduplicationKey('POST', 'https://api/x');
    expect(key.startsWith('POST:https://api/x:')).toBe(true);
  });

  it('produces the same key regardless of body key order', () => {
    const k1 = createDeduplicationKey('POST', 'https://api/x', { a: 1, b: 2 });
    const k2 = createDeduplicationKey('POST', 'https://api/x', { b: 2, a: 1 });
    expect(k1).toBe(k2);
  });

  it('produces different keys for different bodies', () => {
    const k1 = createDeduplicationKey('POST', 'https://api/x', { a: 1 });
    const k2 = createDeduplicationKey('POST', 'https://api/x', { a: 2 });
    expect(k1).not.toBe(k2);
  });

  it('handles missing body gracefully', () => {
    const key = createDeduplicationKey('GET', 'https://api/x');
    expect(key).toBe('GET:https://api/x:');
  });
});
