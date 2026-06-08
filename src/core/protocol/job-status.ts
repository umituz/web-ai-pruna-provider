/**
 * Job Status Predicates
 * @description Pure functions that classify a Pruna job status string.
 */

import type { PrunaJobStatus } from '../entities/types';

export const TERMINAL_SUCCESS_STATUSES: readonly PrunaJobStatus[] = ['succeeded', 'completed'] as const;
export const TERMINAL_FAILURE_STATUSES: readonly PrunaJobStatus[] = ['failed'] as const;
export const IN_FLIGHT_STATUSES: readonly PrunaJobStatus[] = ['processing', 'starting'] as const;

export function isTerminalSuccessStatus(status: PrunaJobStatus | undefined): boolean {
  if (!status) return false;
  return (TERMINAL_SUCCESS_STATUSES as readonly string[]).includes(status);
}

export function isTerminalFailureStatus(status: PrunaJobStatus | undefined): boolean {
  if (!status) return false;
  return (TERMINAL_FAILURE_STATUSES as readonly string[]).includes(status);
}

export function isInFlightStatus(status: PrunaJobStatus | undefined): boolean {
  // Anything that is not a recognized terminal status is treated as still running.
  // This is the defensive default: unknown statuses never cause us to stop polling.
  return !isTerminalStatus(status);
}

export function isTerminalStatus(status: PrunaJobStatus | undefined): boolean {
  return isTerminalSuccessStatus(status) || isTerminalFailureStatus(status);
}
