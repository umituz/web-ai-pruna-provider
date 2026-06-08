import { describe, it, expect } from 'vitest';
import { createDefaultBuilderRegistry } from './builder-factory';
import { TextToImageInputBuilder } from './text-to-image.builder';
import { ImageToImageInputBuilder } from './image-to-image.builder';
import { ImageToVideoInputBuilder } from './image-to-video.builder';

describe('createDefaultBuilderRegistry', () => {
  it('registers a builder for every supported model', () => {
    const registry = createDefaultBuilderRegistry();
    expect(registry.resolve('p-image')).toBeInstanceOf(TextToImageInputBuilder);
    expect(registry.resolve('p-image-edit')).toBeInstanceOf(ImageToImageInputBuilder);
    expect(registry.resolve('p-video')).toBeInstanceOf(ImageToVideoInputBuilder);
  });

  it('returns the same instance on repeated lookups', () => {
    const registry = createDefaultBuilderRegistry();
    expect(registry.resolve('p-image')).toBe(registry.resolve('p-image'));
  });

  it('throws for unknown models', () => {
    const registry = createDefaultBuilderRegistry();
    expect(() => registry.resolve('not-a-model' as never)).toThrow(
      'No input builder registered for model: not-a-model',
    );
  });
});
