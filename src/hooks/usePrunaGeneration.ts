/**
 * usePrunaGeneration Hook
 * @description React hook for Pruna AI generation with direct API key (optimized)
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { generate } from '../generation/services/generation.service';
import type { PrunaInput, PrunaResult, GenerateOptions } from '../core/entities/types';
import { shallowEqual } from '../core/utils/compare';

export interface UsePrunaGenerationOptions {
  onSuccess?: (result: PrunaResult) => void;
  onError?: (error: Error) => void;
  onProgress?: GenerateOptions['onProgress'];
}

export interface UsePrunaGenerationReturn {
  result: PrunaResult | null;
  isLoading: boolean;
  error: Error | null;
  generate: (input: PrunaInput) => Promise<PrunaResult | null>;
  cancel: () => void;
  reset: () => void;
}

/**
 * React hook for Pruna AI generation (optimized).
 * Passes `apiKey` directly to Pruna — use `usePrunaProxy` if you need server-side key security.
 */
export function usePrunaGeneration(
  apiKey: string,
  options?: UsePrunaGenerationOptions,
): UsePrunaGenerationReturn {
  const [result, setResult] = useState<PrunaResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  const mountedRef = useRef(true);
  const prevOptionsRef = useRef<UsePrunaGenerationOptions | undefined>(options);

  // Stabilize options with shallow comparison
  const stabilizedOptions = useMemo(() => {
    if (!prevOptionsRef.current || !shallowEqual(prevOptionsRef.current, options)) {
      prevOptionsRef.current = options;
    }
    return prevOptionsRef.current;
  }, [options]);

  useEffect(() => {
    optionsRef.current = stabilizedOptions;
  }, [stabilizedOptions]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const run = useCallback(
    async (input: PrunaInput): Promise<PrunaResult | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const res = await generate(apiKey, input, {
          signal: controller.signal,
          onProgress: optionsRef.current?.onProgress,
        });
        if (!mountedRef.current) {
          controller.abort();
          return null;
        }
        setResult(res);
        optionsRef.current?.onSuccess?.(res);
        return res;
      } catch (err) {
        if (!mountedRef.current) {
          controller.abort();
          return null;
        }
        if (err instanceof Error && (err.name === 'AbortError' || err.name === 'DOMException' && (err as DOMException).code === DOMException.ABORT_ERR)) {
          return null;
        }
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        optionsRef.current?.onError?.(e);
        return null;
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [apiKey],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo<UsePrunaGenerationReturn>(
    () => ({ result, isLoading, error, generate: run, cancel, reset }),
    [result, isLoading, error, run, cancel, reset],
  );
}
