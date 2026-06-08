import { describe, it, expect } from 'vitest';
import { assertSecureImageSource, classifyImageSource } from './image-source-validator';
import { ValidationError } from '../errors/validation-error';

describe('classifyImageSource', () => {
  it('classifies HTTPS URLs', () => {
    expect(classifyImageSource('https://cdn/img.jpg')).toBe('https-url');
  });

  it('classifies HTTP URLs', () => {
    expect(classifyImageSource('http://insecure/img.jpg')).toBe('http-url');
  });

  it('classifies base64 data URIs', () => {
    expect(classifyImageSource('data:image/png;base64,AAAA')).toBe('base64');
  });

  it('classifies raw base64 strings as base64', () => {
    expect(classifyImageSource('aGVsbG8=')).toBe('base64');
  });

  it('classifies unknown formats as unknown', () => {
    expect(classifyImageSource('just-some-text')).toBe('unknown');
  });
});

describe('assertSecureImageSource', () => {
  it('accepts HTTPS URLs', () => {
    expect(() => assertSecureImageSource('https://x/y.jpg')).not.toThrow();
  });

  it('accepts base64 data URIs', () => {
    expect(() => assertSecureImageSource('data:image/png;base64,AAAA')).not.toThrow();
  });

  it('rejects HTTP URLs (security)', () => {
    expect(() => assertSecureImageSource('http://x/y.jpg')).toThrow(ValidationError);
  });

  it('rejects unknown formats', () => {
    expect(() => assertSecureImageSource('not-a-url')).toThrow(ValidationError);
  });

  it('rejects non-string input', () => {
    expect(() => assertSecureImageSource(123 as never)).toThrow(ValidationError);
  });

  it('uses a custom field name in the error', () => {
    try {
      assertSecureImageSource(123 as never, 'p-video.image');
    } catch (err) {
      expect((err as ValidationError).field).toBe('p-video.image');
    }
  });
});
