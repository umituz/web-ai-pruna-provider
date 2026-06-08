import { describe, it, expect } from 'vitest';
import { TextToImageInputBuilder } from './text-to-image.builder';
import { DEFAULT_ASPECT_RATIO } from '../../core/constants';

describe('TextToImageInputBuilder', () => {
  const builder = new TextToImageInputBuilder();

  it('has model id "p-image"', () => {
    expect(builder.model).toBe('p-image');
  });

  it('builds a payload with prompt and default aspect ratio', async () => {
    const payload = await builder.build(
      { model: 'p-image', prompt: 'A cat' },
      { apiKey: 'k' },
    );
    expect(payload).toEqual({ prompt: 'A cat', aspect_ratio: DEFAULT_ASPECT_RATIO });
  });

  it('honors an explicit aspect ratio', async () => {
    const payload = await builder.build(
      { model: 'p-image', prompt: 'A cat', aspect_ratio: '1:1' },
      { apiKey: 'k' },
    );
    expect(payload.aspect_ratio).toBe('1:1');
  });

  it('includes seed when provided', async () => {
    const payload = await builder.build(
      { model: 'p-image', prompt: 'A cat', seed: 42 },
      { apiKey: 'k' },
    );
    expect(payload.seed).toBe(42);
  });

  it('omits seed when not provided', async () => {
    const payload = await builder.build(
      { model: 'p-image', prompt: 'A cat' },
      { apiKey: 'k' },
    );
    expect('seed' in payload).toBe(false);
  });
});
