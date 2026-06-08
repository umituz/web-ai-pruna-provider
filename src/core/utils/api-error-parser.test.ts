import { describe, it, expect } from 'vitest';
import { parseApiError } from './api-error-parser';

function makeResponse(status: number, body: unknown, ok = false): Response {
  return {
    ok,
    status,
    statusText: 'Status Text',
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe('parseApiError', () => {
  it('uses server-provided message when available', async () => {
    const res = makeResponse(400, { message: 'Invalid input' });
    const error = await parseApiError(res, 'API error');
    expect(error.message).toBe('Invalid input');
    expect(error.statusCode).toBe(400);
  });

  it('falls back to statusText when JSON is missing', async () => {
    const res = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('parse failed')),
    } as unknown as Response;

    const error = await parseApiError(res, 'Server error');
    expect(error.message).toBe('Internal Server Error');
    expect(error.statusCode).toBe(500);
  });

  it('uses fallback when message field is missing', async () => {
    const res = makeResponse(403, {});
    const error = await parseApiError(res, 'Auth error');
    expect(error.message).toBe('Auth error: 403');
    expect(error.statusCode).toBe(403);
  });

  it('extends Error (can be thrown and caught as Error)', async () => {
    const res = makeResponse(500, { message: 'Oops' });
    const error = await parseApiError(res, 'fail');
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(500);
  });
});
