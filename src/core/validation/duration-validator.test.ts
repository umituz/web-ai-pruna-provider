import { describe, it, expect } from 'vitest';
import {
  assertValidDuration,
  isValidDuration,
  MIN_VIDEO_DURATION_SECONDS,
  MAX_VIDEO_DURATION_SECONDS,
} from './duration-validator';
import { ValidationError } from '../errors/validation-error';

describe('isValidDuration', () => {
  it('accepts integers in the valid range', () => {
    expect(isValidDuration(MIN_VIDEO_DURATION_SECONDS)).toBe(true);
    expect(isValidDuration(5)).toBe(true);
    expect(isValidDuration(MAX_VIDEO_DURATION_SECONDS)).toBe(true);
  });

  it('rejects values below the minimum', () => {
    expect(isValidDuration(0)).toBe(false);
    expect(isValidDuration(-1)).toBe(false);
  });

  it('rejects values above the maximum', () => {
    expect(isValidDuration(MAX_VIDEO_DURATION_SECONDS + 1)).toBe(false);
  });

  it('rejects non-integers', () => {
    expect(isValidDuration(1.5)).toBe(false);
    expect(isValidDuration(NaN)).toBe(false);
    expect(isValidDuration(Infinity)).toBe(false);
  });

  it('rejects non-numbers', () => {
    expect(isValidDuration('5' as never)).toBe(false);
    expect(isValidDuration(null)).toBe(false);
  });
});

describe('assertValidDuration', () => {
  it('is a no-op for undefined', () => {
    expect(() => assertValidDuration(undefined)).not.toThrow();
  });

  it('accepts a valid value', () => {
    expect(() => assertValidDuration(5)).not.toThrow();
  });

  it('throws for an invalid value', () => {
    expect(() => assertValidDuration(0)).toThrow(ValidationError);
    expect(() => assertValidDuration(1.5)).toThrow(ValidationError);
  });
});
