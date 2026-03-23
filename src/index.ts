/**
 * @umituz/pruna-provider
 * Pruna AI generation client for web apps
 *
 * Main entry point. For better tree-shaking, use subpath imports:
 *
 *   - @umituz/pruna-provider/core       — Types, constants, API client
 *   - @umituz/pruna-provider/generation — Generation functions
 *   - @umituz/pruna-provider/hooks      — React hooks
 */

export * from './core';
export { generate, generateImageThenVideo } from './generation';
export { usePrunaGeneration, usePrunaProxy } from './hooks';
