import { describe, it, expect, vi } from 'vitest';
import { ImageToVideoInputBuilder } from './image-to-video.builder';
import { CancellationError } from '../../core/errors/cancellation-error';
import * as client from '../../core/services/pruna-client.service';
import { P_VIDEO_DEFAULTS, DEFAULT_ASPECT_RATIO } from '../../core/constants';

describe('ImageToVideoInputBuilder', () => {
  const builder = new ImageToVideoInputBuilder();

  it('has model id "p-video"', () => {
    expect(builder.model).toBe('p-video');
  });

  it('throws CancellationError when signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      builder.build(
        { model: 'p-video', prompt: 'p', image: 'https://x/y' },
        { apiKey: 'k', signal: controller.signal },
      ),
    ).rejects.toBeInstanceOf(CancellationError);
  });

  it('uploads a base64 image and includes video defaults in payload', async () => {
    const uploadSpy = vi.spyOn(client, 'uploadImage').mockResolvedValue('https://files/uploaded');

    const payload = await builder.build(
      { model: 'p-video', prompt: 'Make it move', image: 'data:image/png;base64,AAAA' },
      { apiKey: 'k' },
    );

    expect(uploadSpy).toHaveBeenCalledWith('data:image/png;base64,AAAA', 'k', undefined);
    expect(payload.image).toBe('https://files/uploaded');
    expect(payload.prompt).toBe('Make it move');
    expect(payload.duration).toBe(P_VIDEO_DEFAULTS.duration);
    expect(payload.resolution).toBe(P_VIDEO_DEFAULTS.resolution);
    expect(payload.fps).toBe(P_VIDEO_DEFAULTS.fps);
    expect(payload.draft).toBe(P_VIDEO_DEFAULTS.draft);
    expect(payload.aspect_ratio).toBe(DEFAULT_ASPECT_RATIO);
    expect(payload.prompt_upsampling).toBe(P_VIDEO_DEFAULTS.promptUpsampling);

    uploadSpy.mockRestore();
  });

  it('skips upload when the image is already an HTTPS URL', async () => {
    const uploadSpy = vi.spyOn(client, 'uploadImage').mockResolvedValue('https://files/x');

    await builder.build(
      { model: 'p-video', prompt: 'p', image: 'https://cdn.example.com/img.jpg' },
      { apiKey: 'k' },
    );

    expect(uploadSpy).toHaveBeenCalledWith(
      'https://cdn.example.com/img.jpg',
      'k',
      undefined,
    );
  });

  it('respects custom duration, resolution and draft overrides', async () => {
    vi.spyOn(client, 'uploadImage').mockResolvedValue('https://files/x');

    const payload = await builder.build(
      {
        model: 'p-video',
        prompt: 'p',
        image: 'https://x/y',
        duration: 10,
        resolution: '1080p',
        draft: true,
        aspect_ratio: '9:16',
      },
      { apiKey: 'k' },
    );

    expect(payload.duration).toBe(10);
    expect(payload.resolution).toBe('1080p');
    expect(payload.draft).toBe(true);
    expect(payload.aspect_ratio).toBe('9:16');
  });
});
