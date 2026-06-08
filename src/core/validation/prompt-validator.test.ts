import { describe, it, expect } from 'vitest';
import { assertValidPrompt, isValidPrompt, MAX_PROMPT_LENGTH } from './prompt-validator';
import { ValidationError } from '../errors/validation-error';

describe('isValidPrompt', () => {
  it('accepts non-empty non-whitespace strings', () => {
    expect(isValidPrompt('A cat')).toBe(true);
  });

  it('rejects empty and whitespace-only strings', () => {
    expect(isValidPrompt('')).toBe(false);
    expect(isValidPrompt('   ')).toBe(false);
  });

  it('rejects strings over the maximum length', () => {
    expect(isValidPrompt('x'.repeat(MAX_PROMPT_LENGTH + 1))).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isValidPrompt(42)).toBe(false);
    expect(isValidPrompt(null)).toBe(false);
  });
});

describe('assertValidPrompt', () => {
  it('accepts a valid prompt', () => {
    expect(() => assertValidPrompt('hello')).not.toThrow();
  });

  it('throws for empty input', () => {
    expect(() => assertValidPrompt('')).toThrow(ValidationError);
  });

  it('uses custom field name in the error', () => {
    try {
      assertValidPrompt('', 'customField');
    } catch (err) {
      expect((err as ValidationError).field).toBe('customField');
    }
  });
});
