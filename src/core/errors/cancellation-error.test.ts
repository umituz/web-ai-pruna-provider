import { describe, it, expect } from 'vitest';
import { CancellationError, isCancellationError, CANCELLATION_MESSAGE } from './cancellation-error';

describe('CancellationError', () => {
  it('uses the default message when none is provided', () => {
    const err = new CancellationError();
    expect(err.message).toBe(CANCELLATION_MESSAGE);
    expect(err.name).toBe('CancellationError');
  });

  it('accepts a custom message', () => {
    const err = new CancellationError('Aborted by user click');
    expect(err.message).toBe('Aborted by user click');
    expect(err.name).toBe('CancellationError');
  });

  it('is an instance of Error', () => {
    expect(new CancellationError()).toBeInstanceOf(Error);
  });
});

describe('isCancellationError', () => {
  it('returns true for CancellationError instances', () => {
    expect(isCancellationError(new CancellationError())).toBe(true);
  });

  it('returns false for other error types', () => {
    expect(isCancellationError(new Error('Other'))).toBe(false);
    expect(isCancellationError(new TypeError('Type'))).toBe(false);
  });

  it('returns false for non-error values', () => {
    expect(isCancellationError(null)).toBe(false);
    expect(isCancellationError(undefined)).toBe(false);
    expect(isCancellationError('string')).toBe(false);
    expect(isCancellationError({ name: 'CancellationError' })).toBe(false);
  });
});
