import { describe, it, expect } from 'vitest';
import {
  isAuthFailureStatus,
  isTransientServerError,
  isClientError,
} from './http-status';

describe('http status predicates', () => {
  it('classifies 401 and 403 as auth failures', () => {
    expect(isAuthFailureStatus(401)).toBe(true);
    expect(isAuthFailureStatus(403)).toBe(true);
  });

  it('does not classify 200, 400, 500 as auth failures', () => {
    expect(isAuthFailureStatus(200)).toBe(false);
    expect(isAuthFailureStatus(400)).toBe(false);
    expect(isAuthFailureStatus(500)).toBe(false);
  });

  it('classifies 5xx codes as transient server errors', () => {
    expect(isTransientServerError(500)).toBe(true);
    expect(isTransientServerError(502)).toBe(true);
    expect(isTransientServerError(599)).toBe(true);
  });

  it('does not classify 4xx codes as transient server errors', () => {
    expect(isTransientServerError(400)).toBe(false);
    expect(isTransientServerError(404)).toBe(false);
  });

  it('classifies 4xx (non-auth) as client errors', () => {
    expect(isClientError(400)).toBe(true);
    expect(isClientError(404)).toBe(true);
    expect(isClientError(422)).toBe(true);
  });

  it('does not classify 401/403 as generic client errors', () => {
    expect(isClientError(401)).toBe(false);
    expect(isClientError(403)).toBe(false);
  });
});
