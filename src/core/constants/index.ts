/**
 * Pruna API Constants
 * @description API endpoints and default values
 */

export const PRUNA_BASE_URL = 'https://api.pruna.ai';
export const PRUNA_PREDICTIONS_URL = `${PRUNA_BASE_URL}/v1/predictions`;
export const PRUNA_FILES_URL = `${PRUNA_BASE_URL}/v1/files`;

export const DEFAULT_ASPECT_RATIO = '16:9' as const;

export const P_VIDEO_DEFAULTS = {
  duration: 5,
  resolution: '720p' as const,
  fps: 24,
  draft: false,
  promptUpsampling: true,
} as const;

export const POLL_DEFAULTS = {
  intervalMs: 3_000,
  maxAttempts: 120,
  maxIntervalMs: 10_000,
  backoffBase: 1.5,
  jitterPercent: 0.1,
} as const;
