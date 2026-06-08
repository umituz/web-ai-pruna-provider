# Changelog

All notable changes to `@umituz/pruna-provider` are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Typed error classes: `CancellationError`, `AuthenticationError`, `TimeoutError`, `GenerationFailedError`
- Type guard utilities: `isCancellationError`
- Centralized error parsing: `parseApiError`
- Centralized MIME detection: `detectImageMime`
- Centralized backoff calculation: `calculateBackoff`
- Centralized base64 decoding: `base64ToBytes`
- `useAsyncAction` shared hook that powers all Pruna hooks
- Strategy pattern for model input building (`TextToImageInputBuilder`, `ImageToImageInputBuilder`, `ImageToVideoInputBuilder`)
- `createDefaultBuilderRegistry()` factory for builder composition
- `RequestDeduplicator.execute()` now returns the same in-flight promise for concurrent calls (no async wrapping)
- `createDeduplicationKey()` for building stable cache keys
- Comprehensive unit and integration test suite (135 tests)
- Vitest configuration with jsdom environment and v8 coverage
- `TEST_SCENARIOS.md` with manual test procedures

### Changed
- **Breaking**: `cleanup.ts`, `helpers.ts`, `cache.ts`, `performance.ts` removed. Replaced by `abort-cleanup.ts`, `base64.ts`, `uri-resolver.ts`, `lru-cache.ts`, `performance-monitor.ts`, `performance-decorator.ts`, `mime-detector.ts`, `api-error-parser.ts`, `backoff-calculator.ts`.
- **Breaking**: `usePrunaGeneration` and `usePrunaProxy` now share a common `useAsyncAction` core. The `prevOptionsRef`/`stabilizedOptions` over-engineering is gone.
- **Breaking**: `LRUCache.createCache()` factory removed; use `new LRUCache()` directly.
- **Breaking**: `RequestDeduplicator` constructor takes a number (TTL ms), not an options object.
- **Breaking**: `cleanupAbortController` now accepts any object ref shape, not strictly `MutableRefObject`.
- `PrunaPredictionResponse.output` is now a discriminated `PrunaOutput` union (`string | { url } | string[]`).
- `globalDeduplicator` is now an `instanceof RequestDeduplicator` (was a class instance, now an exported singleton).
- `extractUri()` prioritizes `generation_url` over `output`, `video_url`, and `data`.
- `pollForResult()` no longer leaks signal listeners; uses internal `attemptPoll()` for clean error classification.
- `resolveUri()` uses `PRUNA_BASE_URL` constant instead of a hardcoded string.
- README rewritten with no emojis and up-to-date API surface.

### Fixed
- **Memory leak**: `pollForResult` now removes its `abort` event listener in `finally`.
- **Operator precedence bug**: error name check in `usePrunaGeneration`/`usePrunaProxy` is now a single `isAbortError` helper.
- **Polling swallowed "failed" status**: `pollForResult` now throws `GenerationFailedError` for terminal API failures instead of timing out.
- **Hardcoded magic numbers** in `calculateBackoff` replaced with `POLL_DEFAULTS.backoffBase` and `MAX_BACKOFF_MS`.
- **Off-by-one in blob buffer**: `uploadImage` slices the source `ArrayBuffer` by `byteOffset` and `byteLength`.
- **Bounds-checked bytes** in `detectImageMime` (returns PNG for empty/short inputs).
- **Type cast for `Buffer`**: defensive null check before using the `Buffer` factory.

### Removed
- `createCleanupFn` (was a no-op passthrough).
- `cleanupRefs` (was a duplicate of `cleanupAbortController`).
- `transientData` WeakMap helpers (unused, never exported as part of the public API).
- Emojis from `performance.ts` console output.

## [1.0.8] - 2025-03-23

### Added
- Initial public release with `p-image`, `p-image-edit`, and `p-video` model support.
- `usePrunaGeneration` and `usePrunaProxy` React hooks.
- `generate` and `generateImageThenVideo` core functions.
- In-flight request deduplication via `RequestDeduplicator`.
- LRU cache utility for result caching.
- Subpath exports for tree-shaking.
