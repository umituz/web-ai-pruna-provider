import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadImage, submitPrediction, pollForResult } from './pruna-client.service';
import { AuthenticationError } from '../errors/authentication-error';
import { CancellationError } from '../errors/cancellation-error';
import { TimeoutError } from '../errors/timeout-error';
import { PRUNA_PREDICTIONS_URL, PRUNA_FILES_URL, PRUNA_BASE_URL, POLL_DEFAULTS } from '../constants';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('uploadImage', () => {
  beforeEach(() => fetchMock.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it('passes through an HTTPS URL without uploading', async () => {
    const url = await uploadImage('https://cdn.example.com/img.jpg', 'k');
    expect(url).toBe('https://cdn.example.com/img.jpg');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects HTTP URLs as insecure', async () => {
    await expect(uploadImage('http://example.com/img.jpg', 'k'))
      .rejects.toThrow('Only HTTPS URLs are supported for security.');
  });

  it('uploads base64 to the files endpoint and returns the get URL', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ urls: { get: 'https://files/abc' } }),
    });

    const url = await uploadImage('data:image/png;base64,iVBORw0KGgo=', 'my-key');

    expect(url).toBe('https://files/abc');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe(PRUNA_FILES_URL);
    expect((calledInit.headers as Record<string, string>).apikey).toBe('my-key');
    expect(calledInit.method).toBe('POST');
  });

  it('falls back to /v1/files/:id when the response has no get URL', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'file-123' }),
    });
    const url = await uploadImage('data:image/png;base64,AAAA', 'k');
    expect(url).toBe(`${PRUNA_FILES_URL}/file-123`);
  });

  it('throws an Error with status code on non-OK responses', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: () => Promise.resolve({ message: 'Upload failed' }),
    });
    await expect(uploadImage('data:image/png;base64,AAAA', 'k'))
      .rejects.toMatchObject({ message: 'Upload failed', statusCode: 500 });
  });

  it('reports "uploading" progress', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ urls: { get: 'https://files/x' } }),
    });
    const onProgress = vi.fn();
    await uploadImage('data:image/png;base64,AAAA', 'k', onProgress);
    expect(onProgress).toHaveBeenCalledWith('uploading');
  });
});

describe('submitPrediction', () => {
  beforeEach(() => fetchMock.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it('POSTs the prediction with the correct headers and returns the body', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'succeeded', generation_url: 'https://x' }),
    });

    const result = await submitPrediction('p-image', { prompt: 'hi' }, 'k');

    expect(result).toEqual({ status: 'succeeded', generation_url: 'https://x' });
    const [calledUrl, calledInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe(PRUNA_PREDICTIONS_URL);
    const headers = calledInit.headers as Record<string, string>;
    expect(headers.apikey).toBe('k');
    expect(headers.Model).toBe('p-image');
    expect(headers['Try-Sync']).toBe('true');
    expect(headers['Content-Type']).toBe('application/json');
    expect(calledInit.body).toBe(JSON.stringify({ input: { prompt: 'hi' } }));
  });

  it('passes the AbortSignal through to fetch', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const controller = new AbortController();
    await submitPrediction('p-image', { prompt: 'p' }, 'k', controller.signal);
    const calledInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(calledInit.signal).toBe(controller.signal);
  });

  it('throws an error with statusCode on HTTP failure', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ message: 'Invalid input' }),
    });
    await expect(submitPrediction('p-image', { prompt: 'p' }, 'k'))
      .rejects.toMatchObject({ message: 'Invalid input', statusCode: 400 });
  });
});

describe('pollForResult', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.useRealTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns the resolved URI on the first "succeeded" response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'succeeded', generation_url: 'https://cdn/result.png' }),
    });

    const url = await pollForResult('/v1/predictions/abc', 'k', 5, 1);
    expect(url).toBe('https://cdn/result.png');
  });

  it('prepends PRUNA_BASE_URL to relative poll paths', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'completed', output: { url: 'https://cdn/result.png' } }),
    });

    const url = await pollForResult('/v1/predictions/abc', 'k', 5, 1);
    expect(url).toBe('https://cdn/result.png');
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl.startsWith(PRUNA_BASE_URL)).toBe(true);
  });

  it('throws AuthenticationError on 401', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });

    await expect(pollForResult('/v1/x', 'k', 2, 1)).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('throws AuthenticationError on 403', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 403, json: () => Promise.resolve({}) });

    await expect(pollForResult('/v1/x', 'k', 2, 1)).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('continues polling on transient HTTP errors', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'succeeded', generation_url: 'https://cdn/ok' }),
      });

    const url = await pollForResult('/v1/x', 'k', 5, 1);
    expect(url).toBe('https://cdn/ok');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws TimeoutError when all attempts are exhausted', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });

    await expect(pollForResult('/v1/x', 'k', 2, 1)).rejects.toBeInstanceOf(TimeoutError);
  }, 20_000);

  it('throws CancellationError when the signal aborts', async () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5);
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'processing' }),
    });

    await expect(pollForResult('/v1/x', 'k', 100, 50, controller.signal))
      .rejects.toBeInstanceOf(CancellationError);
  }, 20_000);

  it('throws when the API reports a failure with an error message', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'failed', error: 'Model rejected prompt' }),
    });

    await expect(pollForResult('/v1/x', 'k', 2, 1)).rejects.toThrow('Model rejected prompt');
  }, 20_000);

  it('honors the maxAttempts parameter', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'processing' }),
    });

    await expect(pollForResult('/v1/x', 'k', 3, 1)).rejects.toBeInstanceOf(TimeoutError);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  }, 20_000);

  it('calls onProgress with attempt numbers', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'succeeded', generation_url: 'https://cdn/result' }),
    });
    const onProgress = vi.fn();
    await pollForResult('/v1/x', 'k', 1, 1, undefined, onProgress);
    expect(onProgress).toHaveBeenCalledWith('polling', 1);
  });

  it('uses the default POLL_DEFAULTS values if consistent', () => {
    // Compile-time sanity check that defaults still line up with the contract.
    expect(POLL_DEFAULTS.intervalMs).toBeGreaterThan(0);
    expect(POLL_DEFAULTS.maxAttempts).toBeGreaterThan(0);
  });
});
