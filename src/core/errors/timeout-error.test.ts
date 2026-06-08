import { describe, it, expect } from 'vitest';
import { TimeoutError, TIMEOUT_MESSAGE } from './timeout-error';

describe('TimeoutError', () => {
  it('uses the default message when none is provided', () => {
    const err = new TimeoutError();
    expect(err.message).toBe(TIMEOUT_MESSAGE);
    expect(err.name).toBe('TimeoutError');
  });

  it('accepts a custom message', () => {
    const err = new TimeoutError('Custom timeout');
    expect(err.message).toBe('Custom timeout');
  });

  it('is an instance of Error', () => {
    expect(new TimeoutError()).toBeInstanceOf(Error);
  });
});
