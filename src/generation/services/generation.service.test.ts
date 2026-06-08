import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generate, generateImageThenVideo } from './generation.service';
import * as client from '../../core/services/pruna-client.service';
import { globalDeduplicator } from '../../core/utils/request-deduplicator';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('generate', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalDeduplicator.clear();
    vi.useRealTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the synchronous result on a Try-Sync response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'succeeded', generation_url: 'https://cdn/result.png' }),
    });

    const result = await generate('k-sync', { model: 'p-image', prompt: 'A cat' });
    expect(result).toEqual({ model: 'p-image', url: 'https://cdn/result.png' });
  });

  it('polls when the API returns a polling URL but no result', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ get_url: '/v1/predictions/abc' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'succeeded', generation_url: 'https://cdn/done.png' }),
      });

    const result = await generate('k-poll', { model: 'p-image', prompt: 'A cat' });
    expect(result).toEqual({ model: 'p-image', url: 'https://cdn/done.png' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws when the API returns neither a result nor a polling URL', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    await expect(generate('k-noop', { model: 'p-image', prompt: 'A cat' }))
      .rejects.toThrow('Pruna API returned no result and no polling URL.');
  });

  it('dedupes concurrent requests with the same input', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'succeeded', generation_url: 'https://cdn/result' }),
    });

    const input = { model: 'p-image' as const, prompt: 'A cat' };
    const [a, b] = await Promise.all([generate('k-dedup', input), generate('k-dedup', input)]);
    expect(a).toEqual(b);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not dedupe when useCache is false', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'succeeded', generation_url: 'https://cdn/1' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'succeeded', generation_url: 'https://cdn/2' }),
      });

    const input = { model: 'p-image' as const, prompt: 'A cat' };
    const [a, b] = await Promise.all([
      generate('k-nocache', input, { useCache: false }),
      generate('k-nocache', input, { useCache: false }),
    ]);
    expect(a).not.toEqual(b);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('uploads a base64 image for p-video and resolves with the video URL', async () => {
    const uploadSpy = vi.spyOn(client, 'uploadImage').mockResolvedValue('https://files/up');
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'succeeded', video_url: 'https://cdn/video.mp4' }),
    });

    const result = await generate('k-video', {
      model: 'p-video',
      prompt: 'Animate',
      image: 'data:image/png;base64,AAAA',
    });

    expect(uploadSpy).toHaveBeenCalled();
    expect(result).toEqual({ model: 'p-video', url: 'https://cdn/video.mp4' });
  });

  it('forwards cancellation to the underlying fetch', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'processing' }),
    });
    const controller = new AbortController();
    const promise = generate('k-cancel', { model: 'p-image', prompt: 'p' }, { signal: controller.signal });
    controller.abort();
    await expect(promise).rejects.toThrow();
  }, 10_000);
});

describe('generateImageThenVideo', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalDeduplicator.clear();
    vi.useRealTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs the two-step pipeline and returns the video URL', async () => {
    const uploadSpy = vi.spyOn(client, 'uploadImage').mockResolvedValue('https://files/up');

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'succeeded', generation_url: 'https://cdn/img.png' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'succeeded', video_url: 'https://cdn/video.mp4' }),
      });

    const result = await generateImageThenVideo('k-pipeline', {
      prompt: 'A serene lake at dawn',
      aspect_ratio: '16:9',
      duration: 5,
    });

    expect(result).toEqual({ model: 'p-video', url: 'https://cdn/video.mp4' });
    expect(uploadSpy).toHaveBeenCalled();
  }, 10_000);
});
