import { describe, it, expect } from 'vitest';
import { base64ToBytes } from './base64';

describe('base64ToBytes', () => {
  it('decodes a short base64 string in the browser (atob path)', () => {
    // "Hello" -> base64
    const bytes = base64ToBytes('SGVsbG8=');
    expect(Array.from(bytes)).toEqual([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
  });

  it('decodes binary data correctly', () => {
    // 'AAA' in base64 → [0x00, 0x00, 0x00]
    const bytes = base64ToBytes('AAAA');
    expect(Array.from(bytes)).toEqual([0x00, 0x00, 0x00]);
  });

  it('decodes bytes that look like a JPEG header', () => {
    // The JPEG SOI is 0xFF 0xD8. Encode as 0xFF 0xD8 0x00 → base64 is '/9gA'
    const bytes = base64ToBytes('/9gA');
    expect(Array.from(bytes).slice(0, 2)).toEqual([0xff, 0xd8]);
  });

  it('decodes empty string to empty Uint8Array', () => {
    const bytes = base64ToBytes('');
    expect(bytes.byteLength).toBe(0);
  });

  it('returns a Uint8Array instance', () => {
    const bytes = base64ToBytes('SGVsbG8=');
    expect(bytes).toBeInstanceOf(Uint8Array);
  });
});
