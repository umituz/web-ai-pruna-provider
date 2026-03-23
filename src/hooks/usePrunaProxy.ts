/**
 * usePrunaProxy Hook
 * @description React hook for Pruna AI generation via proxy server
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { PrunaInput, PrunaResult, GenerateOptions, GenerationStage } from '../core/entities/types';

interface ApiErrorResponse {
  message?: string;
}

export interface UsePrunaProxyOptions {
  proxyUrl: string;
  onSuccess?: (result: PrunaResult) => void;
  onError?: (error: Error) => void;
  onProgress?: (stage: GenerationStage) => void;
}

export interface UsePrunaProxyReturn {
  result: PrunaResult | null;
  isLoading: boolean;
  error: Error | null;
  generate: (input: PrunaInput) => Promise<PrunaResult | null>;
  cancel: () => void;
  reset: () => void;
}

/**
 * React hook for Pruna AI generation via proxy server.
 * Use this when you need server-side API key security.
 */
export function usePrunaProxy(
  options: UsePrunaProxyOptions,
): UsePrunaProxyReturn {
  const { proxyUrl } = options;
  const [result, setResult] = useState<PrunaResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  const mountedRef = useRef(true);

  useEffect(() => { optionsRef.current = options; }, [options]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
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
        optionsRef.current?.onProgress?.('uploading');

        const res = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: res.statusText })) as ApiErrorResponse;
          throw new Error(err.message ?? `Proxy error: ${res.status}`);
        }

        const data: PrunaResult = await res.json();

        if (!mountedRef.current) return null;
        setResult(data);
        optionsRef.current?.onSuccess?.(data);
        return data;
      } catch (err) {
        if (!mountedRef.current) return null;
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
    [proxyUrl],
  );

  const cancel = useCallback(() => { abortRef.current?.abort(); }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { result, isLoading, error, generate: run, cancel, reset };
}
