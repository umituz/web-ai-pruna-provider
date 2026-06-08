/**
 * Pruna URL Builder
 * @description Pure functions that construct Pruna API URLs from inputs.
 *              Centralized so consumers can build URLs without hardcoding
 *              the API base.
 */

import { PRUNA_BASE_URL, PRUNA_FILES_URL } from '../constants/network';
import { HTTPS_PREFIX, HTTP_PREFIX } from '../constants/network';

export function isAbsoluteHttpUrl(value: string): boolean {
  return value.startsWith(HTTPS_PREFIX) || value.startsWith(HTTP_PREFIX);
}

export function isHttpsUrl(value: string): boolean {
  return value.startsWith(HTTPS_PREFIX);
}

/**
 * Build a fully-qualified URL from a relative Pruna path.
 * Absolute URLs (http/https) are returned unchanged.
 */
export function buildPrunaApiUrl(pathOrUrl: string): string {
  if (isAbsoluteHttpUrl(pathOrUrl)) return pathOrUrl;
  return `${PRUNA_BASE_URL}${pathOrUrl}`;
}

/**
 * Build a file URL for a Pruna file id, used as a fallback when the upload
 * response does not include a `urls.get` field.
 */
export function buildFileUrlById(fileId: string): string {
  return `${PRUNA_FILES_URL}/${fileId}`;
}
