/**
 * usePrunaGeneration Hook
 * @description React hook for Pruna AI generation with direct API key
 */

import type { PrunaInput, PrunaResult, GenerateOptions } from '../core/entities/types';
import { generate } from '../generation/services/generation.service';
import { useAsyncAction, type AsyncActionApi } from './use-async-action';

export interface UsePrunaGenerationOptions {
  onSuccess?: (result: PrunaResult) => void;
  onError?: (error: Error) => void;
  onProgress?: GenerateOptions['onProgress'];
}

export type UsePrunaGenerationReturn = AsyncActionApi<PrunaResult, PrunaInput>;

/**
 * React hook for Pruna AI generation.
 * Passes `apiKey` directly to Pruna — use `usePrunaProxy` if you need
 * server-side key security.
 */
export function usePrunaGeneration(
  apiKey: string,
  options: UsePrunaGenerationOptions = {},
): UsePrunaGenerationReturn {
  return useAsyncAction<PrunaResult, PrunaInput>(
    (input, signal) => generate(apiKey, input, { signal, onProgress: options.onProgress }),
    options,
  );
}
