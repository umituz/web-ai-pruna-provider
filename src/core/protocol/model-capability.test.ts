import { describe, it, expect } from 'vitest';
import {
  isSupportedModelId,
  modelRequiresImage,
  modelRequiresFileUpload,
  modelProducesAssetUrl,
  modelSupportsPolling,
  modelSupportsSeed,
  modelSupportsDuration,
  modelSupportsResolution,
  inputRequiresImage,
  SUPPORTED_MODEL_IDS,
} from './model-capability';
import type { PrunaInput } from '../entities/types';

describe('model capability predicates', () => {
  it('exposes the supported model id list', () => {
    expect(SUPPORTED_MODEL_IDS).toEqual(['p-image', 'p-image-edit', 'p-video']);
  });

  it('isSupportedModelId classifies known and unknown ids', () => {
    expect(isSupportedModelId('p-image')).toBe(true);
    expect(isSupportedModelId('p-image-edit')).toBe(true);
    expect(isSupportedModelId('p-video')).toBe(true);
    expect(isSupportedModelId('p-unknown')).toBe(false);
    expect(isSupportedModelId(null)).toBe(false);
    expect(isSupportedModelId(42)).toBe(false);
  });

  it('modelRequiresImage is true for p-image-edit and p-video', () => {
    expect(modelRequiresImage('p-image-edit')).toBe(true);
    expect(modelRequiresImage('p-video')).toBe(true);
    expect(modelRequiresImage('p-image')).toBe(false);
  });

  it('modelRequiresFileUpload is true only for p-video', () => {
    expect(modelRequiresFileUpload('p-video')).toBe(true);
    expect(modelRequiresFileUpload('p-image-edit')).toBe(false);
    expect(modelRequiresFileUpload('p-image')).toBe(false);
  });

  it('modelProducesAssetUrl and modelSupportsPolling are universal', () => {
    for (const model of SUPPORTED_MODEL_IDS) {
      expect(modelProducesAssetUrl(model)).toBe(true);
      expect(modelSupportsPolling(model)).toBe(true);
    }
  });

  it('modelSupportsSeed is true for image models only', () => {
    expect(modelSupportsSeed('p-image')).toBe(true);
    expect(modelSupportsSeed('p-image-edit')).toBe(true);
    expect(modelSupportsSeed('p-video')).toBe(false);
  });

  it('modelSupportsDuration and modelSupportsResolution are video-only', () => {
    expect(modelSupportsDuration('p-video')).toBe(true);
    expect(modelSupportsDuration('p-image')).toBe(false);
    expect(modelSupportsResolution('p-video')).toBe(true);
    expect(modelSupportsResolution('p-image')).toBe(false);
  });

  it('inputRequiresImage wraps modelRequiresImage', () => {
    const imageEdit: PrunaInput = { model: 'p-image-edit', prompt: 'p', image: 'https://x/y' };
    const textImage: PrunaInput = { model: 'p-image', prompt: 'p' };
    expect(inputRequiresImage(imageEdit)).toBe(true);
    expect(inputRequiresImage(textImage)).toBe(false);
  });
});
