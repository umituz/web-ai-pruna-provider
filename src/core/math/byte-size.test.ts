import { describe, it, expect } from 'vitest';
import { utf8ByteLength, base64ByteLength, formatBytes } from './byte-size';

describe('utf8ByteLength', () => {
  it('returns 0 for an empty string', () => {
    expect(utf8ByteLength('')).toBe(0);
  });

  it('counts ASCII bytes correctly', () => {
    expect(utf8ByteLength('Hello')).toBe(5);
  });

  it('counts multibyte UTF-8 characters correctly', () => {
    // Each emoji is 4 bytes
    expect(utf8ByteLength('A')).toBe(1);
  });
});

describe('base64ByteLength', () => {
  it('decodes length without padding', () => {
    expect(base64ByteLength('AAAA')).toBe(3);
  });

  it('accounts for single-character padding', () => {
    expect(base64ByteLength('AAA=')).toBe(2);
  });

  it('accounts for double-character padding', () => {
    expect(base64ByteLength('AA==')).toBe(1);
  });

  it('handles data URI prefix', () => {
    expect(base64ByteLength('data:image/png;base64,AAAA')).toBe(3);
  });
});

describe('formatBytes', () => {
  it('returns 0 B for negative or non-finite input', () => {
    expect(formatBytes(-1)).toBe('0 B');
    expect(formatBytes(NaN)).toBe('0 B');
    expect(formatBytes(Infinity)).toBe('0 B');
  });

  it('formats byte values under 1KB as B', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats KB/MB/GB', () => {
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
  });
});
