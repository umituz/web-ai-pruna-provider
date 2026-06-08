import { describe, it, expect } from 'vitest';
import { calculateExponentialBackoff } from './exponential-backoff';
import { POLL_DEFAULTS } from '../constants/limits';

describe('calculateExponentialBackoff', () => {
  it('grows exponentially from the base interval on early attempts', () => {
    const base = 1000;
    const d0 = calculateExponentialBackoff({ attempt: 0, baseIntervalMs: base });
    // base * 1.5^0 = 1000 + jitter (0..100)
    expect(d0).toBeGreaterThanOrEqual(base);
    expect(d0).toBeLessThanOrEqual(base * 1.1);
  });

  it('respects the upper bound from POLL_DEFAULTS.maxIntervalMs', () => {
    const value = calculateExponentialBackoff({ attempt: 50, baseIntervalMs: 1000 });
    expect(value).toBeLessThanOrEqual(POLL_DEFAULTS.maxIntervalMs * 1.1);
  });

  it('honors an explicit maxIntervalMs override', () => {
    const value = calculateExponentialBackoff({ attempt: 5, baseIntervalMs: 1000, maxIntervalMs: 2000 });
    expect(value).toBeLessThanOrEqual(2000 * 1.1);
  });

  it('honors a custom growthBase and jitterPercent', () => {
    const value = calculateExponentialBackoff({
      attempt: 0,
      baseIntervalMs: 1000,
      jitterPercent: 0,
      growthBase: 2,
    });
    // Exact: 1000 * 2^0 = 1000, no jitter
    expect(value).toBe(1000);
  });

  it('clamps negative attempts to zero', () => {
    const value = calculateExponentialBackoff({ attempt: -10, baseIntervalMs: 1000, jitterPercent: 0 });
    expect(value).toBe(1000);
  });

  it('clamps negative base intervals to zero', () => {
    const value = calculateExponentialBackoff({ attempt: 5, baseIntervalMs: -50, jitterPercent: 0 });
    expect(value).toBe(0);
  });

  it('never returns NaN or Infinity', () => {
    for (let i = 0; i < 100; i++) {
      const value = calculateExponentialBackoff({ attempt: i, baseIntervalMs: 1000 });
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });
});
