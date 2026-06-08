import { describe, it, expect } from 'vitest';
import { assertValidAspectRatio, isSupportedAspectRatio, SUPPORTED_ASPECT_RATIOS } from './aspect-ratio-validator';
import { ValidationError } from '../errors/validation-error';

describe('isSupportedAspectRatio', () => {
  it('accepts every supported value', () => {
    for (const value of SUPPORTED_ASPECT_RATIOS) {
      expect(isSupportedAspectRatio(value)).toBe(true);
    }
  });

  it('rejects unsupported values', () => {
    expect(isSupportedAspectRatio('21:9')).toBe(false);
    expect(isSupportedAspectRatio('')).toBe(false);
    expect(isSupportedAspectRatio(null)).toBe(false);
    expect(isSupportedAspectRatio(16)).toBe(false);
  });
});

describe('assertValidAspectRatio', () => {
  it('is a no-op for undefined', () => {
    expect(() => assertValidAspectRatio(undefined)).not.toThrow();
  });

  it('is a no-op for null', () => {
    expect(() => assertValidAspectRatio(null)).not.toThrow();
  });

  it('accepts a supported value', () => {
    expect(() => assertValidAspectRatio('16:9')).not.toThrow();
  });

  it('throws for an unsupported value', () => {
    expect(() => assertValidAspectRatio('21:9' as never)).toThrow(ValidationError);
  });
});
