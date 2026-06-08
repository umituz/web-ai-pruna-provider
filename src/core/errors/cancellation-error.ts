/**
 * Cancellation Error
 * @description Sentinel error used to signal user-initiated cancellation
 */

export const CANCELLATION_MESSAGE = 'Request cancelled by user';

export class CancellationError extends Error {
  constructor(message: string = CANCELLATION_MESSAGE) {
    super(message);
    this.name = 'CancellationError';
  }
}

/**
 * Type guard for CancellationError instances
 */
export function isCancellationError(value: unknown): value is CancellationError {
  return value instanceof CancellationError;
}
