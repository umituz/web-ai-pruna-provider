/**
 * Cleanup Utilities
 * @description Memory management and cleanup helpers
 */

/**
 * Safe cleanup for AbortController
 * Prevents memory leaks by properly aborting and nullifying controllers
 */
export function cleanupAbortController(controllerRef: React.MutableRefObject<AbortController | null>): void {
  const controller = controllerRef.current;
  if (controller) {
    controller.abort();
    controllerRef.current = null;
  }
}

/**
 * Cleanup multiple refs at once
 */
export function cleanupRefs(...refs: Array<React.MutableRefObject<unknown>>): void {
  refs.forEach(ref => {
    if (ref.current && typeof (ref.current as { abort?: () => void }).abort === 'function') {
      (ref.current as { abort: () => void }).abort();
    }
    ref.current = null;
  });
}

/**
 * Create a cleanup function for useEffect
 */
export function createCleanupFn(cleanupFn: () => void): () => void {
  return cleanupFn;
}

/**
 * WeakMap for transient data (auto-garbage collected)
 */
const transientDataWeakMap = new WeakMap<object, unknown>();

export function setTransientData<T>(key: object, value: T): void {
  transientDataWeakMap.set(key, value);
}

export function getTransientData<T>(key: object): T | undefined {
  return transientDataWeakMap.get(key) as T | undefined;
}

export function deleteTransientData(key: object): void {
  transientDataWeakMap.delete(key);
}
