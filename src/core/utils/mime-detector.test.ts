import { describe, it, expect } from 'vitest';
import { detectImageMime } from './mime-detector';

describe('detectImageMime', () => {
  it('detects PNG by signature 0x89 0x50', () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    expect(detectImageMime(bytes)).toBe('image/png');
  });

  it('detects JPEG by signature 0xFF 0xD8', () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    expect(detectImageMime(bytes)).toBe('image/jpeg');
  });

  it('detects WebP by RIFF signature 0x52 0x49', () => {
    const bytes = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
    expect(detectImageMime(bytes)).toBe('image/webp');
  });

  it('falls back to image/png for unknown signatures', () => {
    const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    expect(detectImageMime(bytes)).toBe('image/png');
  });

  it('falls back to image/png when bytes are too short', () => {
    const empty = new Uint8Array([]);
    const oneByte = new Uint8Array([0xff]);
    expect(detectImageMime(empty)).toBe('image/png');
    expect(detectImageMime(oneByte)).toBe('image/png');
  });
});
