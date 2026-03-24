/**
 * Pruna Utility Functions
 * @description Helper functions for data transformation (optimized with memoization)
 */

import type { PrunaPredictionResponse } from '../entities/types';

interface UrlOutput {
  url: string;
}

// One-time environment detection for base64ToBytes
const hasBuffer = typeof (globalThis as unknown as { Buffer?: unknown }).Buffer === 'function';

// Cache for resolved URIs
const uriCache = new WeakMap<PrunaPredictionResponse, string | null>();

/** Strip data URI prefix; pass through HTTPS URLs unchanged */
export function stripBase64Prefix(image: string): string {
  if (image.startsWith('https://')) return image;
  const base64Index = image.indexOf('base64,');
  return base64Index !== -1 ? image.slice(base64Index + 7) : image;
}

/** Decode base64 to bytes — works in Node.js (Buffer) and browser (atob) */
export function base64ToBytes(raw: string): Uint8Array {
  // Node.js: Buffer is available and faster (detected once)
  if (hasBuffer) {
    const buf = (globalThis as unknown as { Buffer: { from: (data: string, encoding: string) => { buffer: ArrayBuffer; byteOffset: number; byteLength: number } } }).Buffer.from(raw, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  // Browser: atob (fallback)
  const str = atob(raw);
  return Uint8Array.from(str, c => c.charCodeAt(0));
}

/** Extract result URI from Pruna API response (checks multiple locations) - with caching */
export function extractUri(data: PrunaPredictionResponse): string | null {
  // Check cache first
  if (uriCache.has(data)) {
    return uriCache.get(data)!;
  }

  let result: string | null = null;

  // Fast path checks in order of likelihood
  if (data.generation_url) {
    result = data.generation_url;
  } else if (data.output) {
    if (typeof data.output === 'string') {
      result = data.output;
    } else if (typeof data.output === 'object' && !Array.isArray(data.output)) {
      const urlOutput = data.output as UrlOutput;
      result = urlOutput.url ?? null;
    } else if (Array.isArray(data.output) && data.output.length > 0) {
      result = data.output[0] ?? null;
    }
  } else if (data.video_url) {
    result = data.video_url;
  } else if (data.data) {
    result = data.data;
  }

  // Cache the result
  uriCache.set(data, result);
  return result;
}

export function resolveUri(uri: string): string {
  return uri.startsWith('/') ? `https://api.pruna.ai${uri}` : uri;
}
