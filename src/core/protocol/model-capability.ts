/**
 * Model Capability Predicates
 * @description Per-model feature flags. Centralized so business code does
 *              not need to know which Pruna model supports what.
 */

import type { PrunaModelId, PrunaInput } from '../entities/types';

export const SUPPORTED_MODEL_IDS: readonly PrunaModelId[] = ['p-image', 'p-image-edit', 'p-video'] as const;

export function isSupportedModelId(model: unknown): model is PrunaModelId {
  return typeof model === 'string'
    && (SUPPORTED_MODEL_IDS as readonly string[]).includes(model);
}

/** Models that require a source image (base64 or HTTPS URL). */
export function modelRequiresImage(model: PrunaModelId): boolean {
  return model === 'p-image-edit' || model === 'p-video';
}

/** Models whose source image must be uploaded to Pruna file storage if base64. */
export function modelRequiresFileUpload(model: PrunaModelId): boolean {
  return model === 'p-video';
}

/** Models that produce a final asset URL (as opposed to metadata). */
export function modelProducesAssetUrl(model: PrunaModelId): boolean {
  return SUPPORTED_MODEL_IDS.includes(model);
}

/** Models that may return a polling URL on the initial response. */
export function modelSupportsPolling(model: PrunaModelId): boolean {
  return SUPPORTED_MODEL_IDS.includes(model);
}

/** Models that accept a `seed` for reproducibility. */
export function modelSupportsSeed(model: PrunaModelId): boolean {
  return model === 'p-image' || model === 'p-image-edit';
}

/** Models that accept a `duration` setting (video). */
export function modelSupportsDuration(model: PrunaModelId): boolean {
  return model === 'p-video';
}

/** Models that accept a `resolution` setting (video). */
export function modelSupportsResolution(model: PrunaModelId): boolean {
  return model === 'p-video';
}

/** Type guard wrapping `modelRequiresImage` for a full input. */
export function inputRequiresImage(input: PrunaInput): boolean {
  return modelRequiresImage(input.model);
}
