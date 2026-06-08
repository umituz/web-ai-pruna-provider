import { describe, it, expect } from 'vitest';
import {
  isTerminalSuccessStatus,
  isTerminalFailureStatus,
  isInFlightStatus,
  isTerminalStatus,
} from './job-status';

describe('job status predicates', () => {
  it('identifies succeeded and completed as terminal success', () => {
    expect(isTerminalSuccessStatus('succeeded')).toBe(true);
    expect(isTerminalSuccessStatus('completed')).toBe(true);
  });

  it('does not classify failed as a success', () => {
    expect(isTerminalSuccessStatus('failed')).toBe(false);
  });

  it('identifies failed as terminal failure', () => {
    expect(isTerminalFailureStatus('failed')).toBe(true);
  });

  it('identifies processing and starting as in-flight', () => {
    expect(isInFlightStatus('processing')).toBe(true);
    expect(isInFlightStatus('starting')).toBe(true);
  });

  it('treats unknown status as in-flight (defensive default)', () => {
    expect(isInFlightStatus(undefined)).toBe(true);
    expect(isInFlightStatus('queued' as never)).toBe(true);
  });

  it('isTerminalStatus is true for any terminal outcome', () => {
    expect(isTerminalStatus('succeeded')).toBe(true);
    expect(isTerminalStatus('completed')).toBe(true);
    expect(isTerminalStatus('failed')).toBe(true);
    expect(isTerminalStatus('processing')).toBe(false);
    expect(isTerminalStatus(undefined)).toBe(false);
  });

  it('returns false for all predicates when status is undefined', () => {
    expect(isTerminalSuccessStatus(undefined)).toBe(false);
    expect(isTerminalFailureStatus(undefined)).toBe(false);
  });
});
