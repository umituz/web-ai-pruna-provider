import { describe, it, expect } from 'vitest';
import { ImageToImageInputBuilder } from './image-to-image.builder';
import { DEFAULT_ASPECT_RATIO } from '../../core/constants';

describe('ImageToImageInputBuilder', () => {
  const builder = new ImageToImageInputBuilder();

  it('has model id "p-image-edit"', () => {
    expect(builder.model).toBe('p-image-edit');
  });

  it('strips base64 prefix and wraps image in array', async () => {
    const payload = await builder.build(
      {
        model: 'p-image-edit',
        prompt: 'Make it blue',
        image: 'data:image/png;base64,iVBORw0KGgo=',
      },
      { apiKey: 'k' },
    );
    expect(payload.images).toEqual(['iVBORw0KGgo=']);
    expect(payload.prompt).toBe('Make it blue');
    expect(payload.aspect_ratio).toBe(DEFAULT_ASPECT_RATIO);
  });

  it('passes through HTTPS URLs unchanged', async () => {
    const url = 'https://cdn.example.com/photo.jpg';
    const payload = await builder.build(
      { model: 'p-image-edit', prompt: 'p', image: url },
      { apiKey: 'k' },
    );
    expect(payload.images).toEqual([url]);
  });

  it('includes seed when provided', async () => {
    const payload = await builder.build(
      { model: 'p-image-edit', prompt: 'p', image: 'https://x/y', seed: 7 },
      { apiKey: 'k' },
    );
    expect(payload.seed).toBe(7);
  });
});
