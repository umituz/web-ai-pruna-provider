import { describe, it, expect } from 'vitest';
import { cleanupAbortController } from './abort-cleanup';

describe('cleanupAbortController', () => {
  it('aborts the controller and nulls the ref', () => {
    const controller = new AbortController();
    const ref = { current: controller };
    cleanupAbortController(ref);
    expect(controller.signal.aborted).toBe(true);
    expect(ref.current).toBeNull();
  });

  it('is a no-op when the ref is already null', () => {
    const ref = { current: null };
    expect(() => cleanupAbortController(ref)).not.toThrow();
  });

  it('handles objects without abort gracefully', () => {
    const ref = { current: { notAbort: true } as unknown as AbortController };
    expect(() => cleanupAbortController(ref)).not.toThrow();
  });
});
