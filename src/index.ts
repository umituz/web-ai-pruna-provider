/**
 * @umituz/pruna-provider
 * Pruna AI generation client for web apps
 *
 * IMPORTANT: Apps should NOT use this root barrel.
 * Use subpath imports instead:
 *
 *   - @umituz/pruna-provider/core       — Types, constants, API client
 *   - @umituz/pruna-provider/generation — Generation functions
 *   - @umituz/pruna-provider/hooks      — React hooks
 *
 * This root barrel is kept for backward compatibility only.
 */

// Re-export everything for backward compatibility
export * from './core';
export { generate, generateImageThenVideo } from './generation';
export { usePrunaGeneration, usePrunaProxy } from './hooks';
