/**
 * Authentication Error
 * @description Sentinel error for 401/403 API responses
 */

export const AUTHENTICATION_MESSAGE = 'Authentication failed. Please check your API key.';

export class AuthenticationError extends Error {
  constructor(message: string = AUTHENTICATION_MESSAGE) {
    super(message);
    this.name = 'AuthenticationError';
  }
}
