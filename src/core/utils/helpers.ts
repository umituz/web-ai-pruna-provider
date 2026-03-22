/**
 * Pruna Utility Functions
 * @description Helper functions for data transformation
 */

declare const Buffer: {
  from(data: string, encoding: string): {
    buffer: ArrayBuffer;
    byteOffset: number;
    byteLength: number;
  };
} | undefined;

/** Strip data URI prefix; pass through HTTPS URLs unchanged */
export function stripBase64Prefix(image: string): string {
  if (image.startsWith('http')) return image;
  return image.includes('base64,') ? image.split('base64,')[1] : image;
}

/** Decode base64 to bytes — works in Node.js (Buffer) and browser (atob) */
export function base64ToBytes(raw: string): Uint8Array {
  // Node.js: Buffer is available and faster
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(raw, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength) as Uint8Array;
  }
  // Browser: atob
  const str = atob(raw);
  return Uint8Array.from(str, c => c.charCodeAt(0));
}

/** Extract result URI from Pruna API response (checks multiple locations) */
export function extractUri(
  data: import('../entities/types').PrunaPredictionResponse
): string | null {
  return (
    data.generation_url ??
    (data.output && typeof data.output === 'object' && !Array.isArray(data.output)
      ? (data.output as { url: string }).url
      : null) ??
    (typeof data.output === 'string' ? data.output : null) ??
    data.data ??
    data.video_url ??
    (Array.isArray(data.output) ? (data.output as readonly string[])[0] : null) ??
    null
  );
}

export function resolveUri(uri: string): string {
  return uri.startsWith('/') ? `https://api.pruna.ai${uri}` : uri;
}
