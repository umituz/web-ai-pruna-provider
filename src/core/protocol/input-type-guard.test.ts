import { describe, it, expect } from 'vitest';
import {
  isTextToImageInput,
  isImageToImageInput,
  isImageToVideoInput,
  isImageGenerationModel,
  isVideoGenerationModel,
  isTextToVideoPipeline,
} from './input-type-guard';
import type { PrunaInput, TextToVideoInput } from '../entities/types';

const TEXT_TO_IMAGE: PrunaInput = { model: 'p-image', prompt: 'A cat' };
const IMAGE_TO_IMAGE: PrunaInput = { model: 'p-image-edit', prompt: 'Edit', image: 'https://x/y.jpg' };
const IMAGE_TO_VIDEO: PrunaInput = { model: 'p-video', prompt: 'Animate', image: 'https://x/y.jpg' };

describe('input type guards', () => {
  it('isTextToImageInput narrows p-image inputs', () => {
    expect(isTextToImageInput(TEXT_TO_IMAGE)).toBe(true);
    expect(isTextToImageInput(IMAGE_TO_IMAGE)).toBe(false);
    expect(isTextToImageInput(IMAGE_TO_VIDEO)).toBe(false);
  });

  it('isImageToImageInput narrows p-image-edit inputs', () => {
    expect(isImageToImageInput(IMAGE_TO_IMAGE)).toBe(true);
    expect(isImageToImageInput(TEXT_TO_IMAGE)).toBe(false);
  });

  it('isImageToVideoInput narrows p-video inputs', () => {
    expect(isImageToVideoInput(IMAGE_TO_VIDEO)).toBe(true);
    expect(isImageToVideoInput(TEXT_TO_IMAGE)).toBe(false);
  });

  it('isImageGenerationModel is true for image models', () => {
    expect(isImageGenerationModel('p-image')).toBe(true);
    expect(isImageGenerationModel('p-image-edit')).toBe(true);
    expect(isImageGenerationModel('p-video')).toBe(false);
  });

  it('isVideoGenerationModel is true only for p-video', () => {
    expect(isVideoGenerationModel('p-video')).toBe(true);
    expect(isVideoGenerationModel('p-image')).toBe(false);
  });

  it('isTextToVideoPipeline detects the two-step input shape', () => {
    const pipeline: TextToVideoInput = { prompt: 'p' };
    expect(isTextToVideoPipeline(pipeline)).toBe(true);
    expect(isTextToVideoPipeline(TEXT_TO_IMAGE)).toBe(false);
    expect(isTextToVideoPipeline(null)).toBe(false);
    expect(isTextToVideoPipeline('string')).toBe(false);
  });
});
