import { describe, it, expect } from 'vitest';
import { assertValidApiKey } from './api-key-validator';
import { ValidationError } from '../errors/validation-error';
import { MAX_API_KEY_LENGTH } from '../constants/network';

describe('assertValidApiKey', () => {
  it('accepts a non-empty string', () => {
    expect(() => assertValidApiKey('pruna_abc123')).not.toThrow();
  });

  it('rejects non-string types', () => {
    expect(() => assertValidApiKey(123 as never)).toThrow(ValidationError);
    expect(() => assertValidApiKey(null as never)).toThrow(ValidationError);
    expect(() => assertValidApiKey(undefined as never)).toThrow(ValidationError);
  });

  it('rejects empty strings', () => {
    try {
      assertValidApiKey('');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).field).toBe('apiKey');
    }
  });

  it('rejects strings exceeding the maximum length', () => {
    const huge = 'x'.repeat(MAX_API_KEY_LENGTH + 1);
    expect(() => assertValidApiKey(huge)).toThrow(ValidationError);
  });

  it('accepts strings at the maximum length boundary', () => {
    const boundary = 'x'.repeat(MAX_API_KEY_LENGTH);
    expect(() => assertValidApiKey(boundary)).not.toThrow();
  });
});
