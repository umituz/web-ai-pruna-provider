/**
 * AbortController Cleanup Utilities
 * @description Safe teardown for AbortController refs to prevent memory leaks
 */

interface AbortableRef {
  current: AbortController | { abort?: () => void } | null;
}

/**
 * Safe cleanup for AbortController
 * Prevents memory leaks by properly aborting and nullifying controllers
 */
export function cleanupAbortController(
  controllerRef: AbortableRef,
): void {
  const controller = controllerRef.current;
  if (controller && 'abort' in controller && typeof controller.abort === 'function') {
    controller.abort();
    controllerRef.current = null;
  }
}
