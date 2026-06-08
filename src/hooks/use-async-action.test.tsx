import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsyncAction, type AsyncActionExecutor } from './use-async-action';
import { CancellationError } from '../core/errors/cancellation-error';

describe('useAsyncAction', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts in idle state', () => {
    const executor: AsyncActionExecutor<string, number> = () => Promise.resolve('ok');
    const { result } = renderHook(() => useAsyncAction(executor));

    expect(result.current.result).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('runs the executor and exposes the result', async () => {
    const executor: AsyncActionExecutor<string, number> = async (input) => {
      return `value-${input}`;
    };
    const { result } = renderHook(() => useAsyncAction(executor));

    await act(async () => {
      await result.current.run(42);
    });

    expect(result.current.result).toBe('value-42');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('flips isLoading during execution and back to false on completion', async () => {
    let resolveExecutor: (v: string) => void = () => {};
    const executor: AsyncActionExecutor<string, number> = () =>
      new Promise<string>(resolve => { resolveExecutor = resolve; });

    const { result } = renderHook(() => useAsyncAction(executor));

    act(() => {
      result.current.run(1);
    });
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveExecutor('done');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.result).toBe('done');
  });

  it('captures errors and invokes onError', async () => {
    const onError = vi.fn();
    const executor: AsyncActionExecutor<string, number> = async () => {
      throw new Error('boom');
    };

    const { result } = renderHook(() => useAsyncAction(executor, { onError }));

    await act(async () => {
      await result.current.run(1);
    });

    expect(result.current.error?.message).toBe('boom');
    expect(onError).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not invoke onError for cancellation', async () => {
    const onError = vi.fn();
    const executor: AsyncActionExecutor<string, number> = async (_input, signal) => {
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new CancellationError()));
      });
    };

    const { result } = renderHook(() => useAsyncAction(executor, { onError }));

    act(() => {
      result.current.run(1);
    });

    act(() => {
      result.current.cancel();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(onError).not.toHaveBeenCalled();
  });

  it('reset() clears state and aborts in-flight work', async () => {
    const executor: AsyncActionExecutor<string, number> = async (_input, signal) => {
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new CancellationError()));
      });
    };

    const { result } = renderHook(() => useAsyncAction(executor));

    act(() => {
      result.current.run(1);
    });
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('uses the latest executor closure on each run', async () => {
    let counter = 0;
    const makeExecutor = (): AsyncActionExecutor<number, number> => async () => {
      counter += 1;
      return counter;
    };

    const { result } = renderHook(({ exec }) => useAsyncAction(exec), {
      initialProps: { exec: makeExecutor() },
    });

    act(() => {
      result.current.run(1);
    });
    await waitFor(() => expect(result.current.result).toBe(1));

    act(() => {
      result.current.run(1);
    });
    await waitFor(() => expect(result.current.result).toBe(2));
  });
});
