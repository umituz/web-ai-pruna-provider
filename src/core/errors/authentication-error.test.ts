import { describe, it, expect } from 'vitest';
import { AuthenticationError, AUTHENTICATION_MESSAGE } from './authentication-error';

describe('AuthenticationError', () => {
  it('uses the default message when none is provided', () => {
    const err = new AuthenticationError();
    expect(err.message).toBe(AUTHENTICATION_MESSAGE);
    expect(err.name).toBe('AuthenticationError');
  });

  it('accepts a custom message', () => {
    const err = new AuthenticationError('Invalid API key');
    expect(err.message).toBe('Invalid API key');
  });

  it('is an instance of Error', () => {
    expect(new AuthenticationError()).toBeInstanceOf(Error);
  });
});
