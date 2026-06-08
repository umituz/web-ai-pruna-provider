/**
 * Network Constants
 * @description URL prefixes, protocol markers, and HTTP status thresholds.
 */

export const HTTPS_PREFIX = 'https://';
export const HTTP_PREFIX = 'http://';
export const BASE64_MARKER = 'base64,';

/** Pruna REST API root. */
export const PRUNA_BASE_URL = 'https://api.pruna.ai';

/** Prediction (model invocation) endpoint. */
export const PRUNA_PREDICTIONS_URL = `${PRUNA_BASE_URL}/v1/predictions`;

/** File upload endpoint (required for p-video's base64 inputs). */
export const PRUNA_FILES_URL = `${PRUNA_BASE_URL}/v1/files`;

/** HTTP status codes that indicate the API key is invalid. */
export const AUTH_FAILURE_STATUSES: readonly number[] = [401, 403] as const;

/** Minimum length for a non-trivial API key. */
export const MIN_API_KEY_LENGTH = 1;

/** Maximum length for a Pruna API key (defensive upper bound). */
export const MAX_API_KEY_LENGTH = 256;
