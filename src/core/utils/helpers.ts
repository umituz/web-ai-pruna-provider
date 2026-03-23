/**
 * Pruna Utility Functions
 * @description Helper functions for data transformation
 */

import type { PrunaPredictionResponse } from '../entities/types';

interface UrlOutput {
  url: string;
}

/** Strip data URI prefix; pass through HTTPS URLs unchanged */
export function stripBase64Prefix(image: string): string {
  if (image.startsWith('https://')) return image;
  return image.includes('base64,') ? image.split('base64,')[1] : image;
}

/** Decode base64 to bytes — works in Node.js (Buffer) and browser (atob) */
export function base64ToBytes(raw: string): Uint8Array {
  // Node.js: Buffer is available and faster
  if (typeof (globalThis as unknown as { Buffer?: { from: (data: string, encoding: string) => { buffer: ArrayBuffer; byteOffset: number; byteLength: number } } }).Buffer === 'function') {
    const buf = (globalThis as unknown as { Buffer: { from: (data: string, encoding: string) => { buffer: ArrayBuffer; byteOffset: number; byteLength: number } } }).Buffer.from(raw, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  // Browser: atob
  const str = atob(raw);
  return Uint8Array.from(str, c => c.charCodeAt(0));
}

/** Extract result URI from Pruna API response (checks multiple locations) */
export function extractUri(data: PrunaPredictionResponse): string | null {
  if (data.generation_url) return data.generation_url;

  if (data.output) {
    if (typeof data.output === 'object' && !Array.isArray(data.output)) {
      const urlOutput = data.output as UrlOutput;
      if (urlOutput.url) return urlOutput.url;
    } else if (typeof data.output === 'string') {
      return data.output;
    } else if (Array.isArray(data.output) && data.output.length > 0) {
      return data.output[0] ?? null;
    }
  }

  if (data.data) return data.data;
  if (data.video_url) return data.video_url;

  return null;
}

export function resolveUri(uri: string): string {
  return uri.startsWith('/') ? `https://api.pruna.ai${uri}` : uri;
}
