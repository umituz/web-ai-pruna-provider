/**
 * Backoff Calculator
 * @description Exponential backoff with jitter — prevents thundering herd
 */

import { POLL_DEFAULTS } from '../constants';

const MAX_BACKOFF_MS = 10_000;
const JITTER_MULTIPLIER = 0.1;

/**
 * Calculate the delay for the next retry/poll attempt.
 * Combines exponential growth, an upper bound, and random jitter.
 */
export function calculateBackoff(attempt: number, baseInterval: number): number {
  const exponentialDelay = Math.min(
    baseInterval * Math.pow(POLL_DEFAULTS.backoffBase, attempt),
    MAX_BACKOFF_MS,
  );
  const jitter = exponentialDelay * JITTER_MULTIPLIER * Math.random();
  return exponentialDelay + jitter;
}
