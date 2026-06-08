/**
 * Exponential Backoff Calculator
 * @description Computes the delay for the next poll/retry attempt.
 *              Combines exponential growth, an upper bound (maxIntervalMs), and jitter.
 *              All thresholds come from POLL_DEFAULTS — no hardcoded numbers.
 */

import { POLL_DEFAULTS } from '../constants/limits';

export interface BackoffInputs {
  /** Zero-based attempt index. */
  attempt: number;
  /** Base interval in milliseconds (typically POLL_DEFAULTS.intervalMs). */
  baseIntervalMs: number;
  /** Optional override for the maximum backoff cap. */
  maxIntervalMs?: number;
  /** Optional override for the jitter percentage. */
  jitterPercent?: number;
  /** Optional override for the exponential growth base. */
  growthBase?: number;
}

/**
 * Calculate the delay (ms) before the next attempt.
 * @returns A non-negative finite number.
 */
export function calculateExponentialBackoff(inputs: BackoffInputs): number {
  const {
    attempt,
    baseIntervalMs,
    maxIntervalMs = POLL_DEFAULTS.maxIntervalMs,
    jitterPercent = POLL_DEFAULTS.jitterPercent,
    growthBase = POLL_DEFAULTS.backoffBase,
  } = inputs;

  const safeAttempt = Math.max(0, attempt);
  const safeBase = Math.max(0, baseIntervalMs);
  const exponentialDelay = Math.min(safeBase * Math.pow(growthBase, safeAttempt), maxIntervalMs);
  const jitter = exponentialDelay * jitterPercent * Math.random();
  return exponentialDelay + jitter;
}
