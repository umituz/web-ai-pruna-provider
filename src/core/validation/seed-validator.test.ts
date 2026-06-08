import { describe, it, expect } from 'vitest';
import { assertValidSeed, isValidSeed, MIN_SEED, MAX_SEED } from './seed-validator';
import { ValidationError } from '../errors/validation-error';

describe('isValidSeed', () => {
  it('accepts integers in the valid range', () => {
    expect(isValidSeed(0)).toBe(true);
    expect(isValidSeed(MIN_SEED)).toBe(true);
    expect(isValidSeed(MAX_SEED)).toBe(true);
    expect(isValidSeed(42)).toBe(true);
  });

  it('rejects out-of-range integers', () => {
    expect(isValidSeed(MIN_SEED - 1)).toBe(false);
    expect(isValidSeed(MAX_SEED + 1)).toBe(false);
  });

  it('rejects non-integers and non-finite numbers', () => {
    expect(isValidSeed(1.5)).toBe(false);
    expect(isValidSeed(NaN)).toBe(false);
    expect(isValidSeed(Infinity)).toBe(false);
  });

  it('rejects non-numbers', () => {
    expect(isValidSeed('42' as never)).toBe(false);
    expect(isValidSeed(null)).toBe(false);
  });
});

describe('assertValidSeed', () => {
  it('is a no-op for undefined', () => {
    expect(() => assertValidSeed(undefined)).not.toThrow();
  });

  it('accepts a valid value', () => {
    expect(() => assertValidSeed(7)).not.toThrow();
  });

  it('throws for an out-of-range value', () => {
    expect(() => assertValidSeed(MAX_SEED + 1)).toThrow(ValidationError);
  });
});
