/**
 * HTTP Status Predicates
 * @description Classifiers for HTTP response status codes used by the Pruna client.
 */

import { AUTH_FAILURE_STATUSES } from '../constants/network';

/** Status codes that should immediately abort with an AuthenticationError. */
export function isAuthFailureStatus(status: number): boolean {
  return (AUTH_FAILURE_STATUSES as readonly number[]).includes(status);
}

/** Status codes that warrant retrying the request (transient server problems). */
export function isTransientServerError(status: number): boolean {
  return status >= 500 && status < 600;
}

/** Status codes that indicate a client error and should not be retried as-is. */
export function isClientError(status: number): boolean {
  return status >= 400 && status < 500 && !isAuthFailureStatus(status);
}
