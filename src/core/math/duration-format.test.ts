import { describe, it, expect } from 'vitest';
import { formatDuration, elapsedMilliseconds, totalBackoffDelayMs } from './duration-format';

describe('formatDuration', () => {
  it('returns 0s for invalid input', () => {
    expect(formatDuration(NaN)).toBe('0s');
    expect(formatDuration(-1)).toBe('0s');
  });

  it('formats sub-second values in ms', () => {
    expect(formatDuration(0)).toBe('0ms');
    expect(formatDuration(500)).toBe('500ms');
  });

  it('formats seconds', () => {
    expect(formatDuration(1500)).toBe('1s');
    expect(formatDuration(59_000)).toBe('59s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(60_000)).toBe('1m');
    expect(formatDuration(65_000)).toBe('1m 5s');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(3_600_000)).toBe('1h');
    expect(formatDuration(3_900_000)).toBe('1h 5m');
  });

  it('formats days and hours', () => {
    expect(formatDuration(86_400_000)).toBe('1d');
    expect(formatDuration(90_000_000)).toBe('1d 1h');
  });
});

describe('elapsedMilliseconds', () => {
  it('returns the difference when end > start', () => {
    expect(elapsedMilliseconds(100, 250)).toBe(150);
  });

  it('clamps negative differences to 0', () => {
    expect(elapsedMilliseconds(500, 100)).toBe(0);
  });
});

describe('totalBackoffDelayMs', () => {
  it('returns 0 for 0 attempts', () => {
    expect(totalBackoffDelayMs(0, 1000)).toBe(0);
  });

  it('sums the geometric series for the given attempts', () => {
    // 1000 * (2^0 + 2^1 + 2^2) = 1000 + 2000 + 4000 = 7000
    expect(totalBackoffDelayMs(3, 1000)).toBe(7000);
  });
});
