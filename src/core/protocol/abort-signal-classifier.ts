/**
 * Abort Signal Classifier
 * @description Centralized predicates for "this error means the user cancelled".
 *              All callers should use these helpers instead of duplicating
 *              `instanceof DOMException` checks.
 */

export function isAbortError(err: unknown): boolean {
  // Check DOMException first because in some environments (e.g. jsdom) a
  // DOMException may not be an `instanceof Error`.
  if (err instanceof DOMException && err.code === DOMException.ABORT_ERR) return true;
  if (err instanceof Error && err.name === 'AbortError') return true;
  return false;
}

export function isAbortSignal(signal: unknown): signal is AbortSignal {
  return signal instanceof AbortSignal;
}

export function isSignalAborted(signal: AbortSignal | undefined): boolean {
  return signal?.aborted === true;
}
