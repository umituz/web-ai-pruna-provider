import { describe, it, expect } from 'vitest';
import { assertValidResolution, isSupportedResolution } from './resolution-validator';
import { ValidationError } from '../errors/validation-error';

describe('isSupportedResolution', () => {
  it('accepts every supported value', () => {
    expect(isSupportedResolution('720p')).toBe(true);
    expect(isSupportedResolution('1080p')).toBe(true);
  });

  it('rejects unsupported values', () => {
    expect(isSupportedResolution('4k')).toBe(false);
    expect(isSupportedResolution('720')).toBe(false);
    expect(isSupportedResolution(null)).toBe(false);
  });
});

describe('assertValidResolution', () => {
  it('is a no-op for undefined', () => {
    expect(() => assertValidResolution(undefined)).not.toThrow();
  });

  it('accepts a supported value', () => {
    expect(() => assertValidResolution('720p')).not.toThrow();
  });

  it('throws for an unsupported value', () => {
    expect(() => assertValidResolution('4k' as never)).toThrow(ValidationError);
  });
});
