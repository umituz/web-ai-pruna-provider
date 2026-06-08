import { describe, it, expect } from 'vitest';
import { ValidationError, isValidationError } from './validation-error';

describe('ValidationError', () => {
  it('exposes field, reason, and receivedValue', () => {
    const err = new ValidationError({ field: 'apiKey', reason: 'too short', receivedValue: '' });
    expect(err.field).toBe('apiKey');
    expect(err.reason).toBe('too short');
    expect(err.receivedValue).toBe('');
    expect(err.name).toBe('ValidationError');
    expect(err.message).toBe('Invalid apiKey: too short');
  });

  it('is an instance of Error', () => {
    expect(new ValidationError({ field: 'x', reason: 'y' })).toBeInstanceOf(Error);
  });
});

describe('isValidationError', () => {
  it('returns true for ValidationError instances', () => {
    expect(isValidationError(new ValidationError({ field: 'x', reason: 'y' }))).toBe(true);
  });

  it('returns false for other values', () => {
    expect(isValidationError(new Error('other'))).toBe(false);
    expect(isValidationError(null)).toBe(false);
    expect(isValidationError({ name: 'ValidationError' })).toBe(false);
  });
});
