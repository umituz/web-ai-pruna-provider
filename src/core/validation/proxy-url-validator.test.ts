import { describe, it, expect } from 'vitest';
import { assertValidProxyUrl } from './proxy-url-validator';
import { ValidationError } from '../errors/validation-error';

describe('assertValidProxyUrl', () => {
  it('accepts absolute http URLs', () => {
    expect(() => assertValidProxyUrl('http://localhost:3000/pruna')).not.toThrow();
  });

  it('accepts absolute https URLs', () => {
    expect(() => assertValidProxyUrl('https://api.example.com/pruna')).not.toThrow();
  });

  it('accepts relative paths', () => {
    expect(() => assertValidProxyUrl('/api/pruna')).not.toThrow();
  });

  it('rejects non-string types', () => {
    expect(() => assertValidProxyUrl(123 as never)).toThrow(ValidationError);
  });

  it('rejects empty strings', () => {
    expect(() => assertValidProxyUrl('')).toThrow(ValidationError);
  });

  it('rejects strings without a URL scheme or leading slash', () => {
    expect(() => assertValidProxyUrl('api/pruna')).toThrow(ValidationError);
  });
});
