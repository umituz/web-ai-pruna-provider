import { describe, it, expect } from 'vitest';
import { isAbortError, isAbortSignal, isSignalAborted } from './abort-signal-classifier';

describe('abort signal classifier', () => {
  it('isAbortError matches DOMException with ABORT_ERR', () => {
    const err = new DOMException('aborted', 'AbortError');
    expect(isAbortError(err)).toBe(true);
  });

  it('isAbortError matches Error with name AbortError', () => {
    expect(isAbortError(new Error('aborted'))).toBe(false);
    const e = new Error('aborted');
    e.name = 'AbortError';
    expect(isAbortError(e)).toBe(true);
  });

  it('isAbortError returns false for non-abort errors', () => {
    expect(isAbortError(new TypeError('x'))).toBe(false);
    expect(isAbortError(null)).toBe(false);
    expect(isAbortError('AbortError')).toBe(false);
  });

  it('isAbortSignal detects AbortSignal instances', () => {
    expect(isAbortSignal(new AbortController().signal)).toBe(true);
    expect(isAbortSignal({} as never)).toBe(false);
  });

  it('isSignalAborted handles undefined and active signals', () => {
    expect(isSignalAborted(undefined)).toBe(false);
    const controller = new AbortController();
    expect(isSignalAborted(controller.signal)).toBe(false);
    controller.abort();
    expect(isSignalAborted(controller.signal)).toBe(true);
  });
});
