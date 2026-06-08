import { describe, it, expect } from 'vitest';
import { createRollingAverage } from './rolling-average';

describe('createRollingAverage', () => {
  it('returns 0 mean when empty', () => {
    const avg = createRollingAverage();
    expect(avg.mean()).toBe(0);
    expect(avg.size()).toBe(0);
  });

  it('computes the mean of pushed samples', () => {
    const avg = createRollingAverage();
    avg.push(10);
    avg.push(20);
    avg.push(30);
    expect(avg.mean()).toBe(20);
    expect(avg.size()).toBe(3);
  });

  it('drops the oldest sample when the window is full', () => {
    const avg = createRollingAverage({ capacity: 3 });
    avg.push(10);
    avg.push(20);
    avg.push(30);
    avg.push(40); // drops the 10
    expect(avg.mean()).toBe(30); // (20 + 30 + 40) / 3
  });

  it('reset() clears all state', () => {
    const avg = createRollingAverage();
    avg.push(10);
    avg.reset();
    expect(avg.size()).toBe(0);
    expect(avg.mean()).toBe(0);
  });

  it('clamps capacity to at least 1', () => {
    const avg = createRollingAverage({ capacity: 0 });
    avg.push(5);
    expect(avg.size()).toBe(1);
  });
});
