/**
 * Numerical Limits & Thresholds
 * @description All numeric configuration (timeouts, sizes, multipliers) centralized here.
 *              No magic numbers should appear elsewhere in the codebase.
 */

import type { PrunaAspectRatio, PrunaResolution } from '../entities/types';

/** Default aspect ratio applied when caller does not specify one. */
export const DEFAULT_ASPECT_RATIO: PrunaAspectRatio = '16:9';

/** Default video generation settings (Pruna p-video model). */
export const P_VIDEO_DEFAULTS = {
  duration: 5,
  resolution: '720p' as PrunaResolution,
  fps: 24,
  draft: false,
  promptUpsampling: true,
} as const;

/** Polling timing configuration. */
export const POLL_DEFAULTS = {
  intervalMs: 3_000,
  maxAttempts: 120,
  maxIntervalMs: 10_000,
  backoffBase: 1.5,
  jitterPercent: 0.1,
} as const;

/** Default TTL for the request deduplicator's in-flight cache. */
export const DEFAULT_DEDUPLICATOR_TTL_MS = 30_000;

/** Grace period after which a deduplicated in-flight entry is removed. */
export const DEDUPLICATOR_CLEANUP_GRACE_MS = 100;

/** Default TTL for the LRU result cache. */
export const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

/** Default maximum number of entries in the LRU cache. */
export const DEFAULT_CACHE_MAX_SIZE = 50;

/** Maximum number of recent response-time samples retained for averaging. */
export const PERFORMANCE_RETAINED_SAMPLES = 100;
