import { describe, it, expect } from 'vitest';
import { createCacheStatsTracker, computeHitRate } from './cache-statistics';

describe('createCacheStatsTracker', () => {
  it('starts with zero counters and 0 hit rate', () => {
    const tracker = createCacheStatsTracker();
    const snap = tracker.snapshot();
    expect(snap).toEqual({ hits: 0, misses: 0, totalLookups: 0, hitRate: 0 });
  });

  it('records hits and misses', () => {
    const tracker = createCacheStatsTracker();
    tracker.recordHit();
    tracker.recordHit();
    tracker.recordMiss();
    const snap = tracker.snapshot();
    expect(snap.hits).toBe(2);
    expect(snap.misses).toBe(1);
    expect(snap.totalLookups).toBe(3);
    expect(snap.hitRate).toBeCloseTo(2 / 3);
  });

  it('reset() clears the counters', () => {
    const tracker = createCacheStatsTracker();
    tracker.recordHit();
    tracker.reset();
    expect(tracker.snapshot()).toEqual({ hits: 0, misses: 0, totalLookups: 0, hitRate: 0 });
  });
});

describe('computeHitRate', () => {
  it('returns 0 when there are no lookups', () => {
    expect(computeHitRate(0, 0)).toBe(0);
  });

  it('returns the hit ratio', () => {
    expect(computeHitRate(3, 1)).toBe(0.75);
    expect(computeHitRate(1, 0)).toBe(1);
  });
});
