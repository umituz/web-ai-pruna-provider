/**
 * Cache Key Derivation
 * @description Builds stable cache keys for Pruna API requests.
 *              Key shape: "<method>:<url>:<bodyHash>"
 */

import { compositeHash, hashValue } from './comparison-hash';

export interface RequestSignature {
  method: string;
  url: string;
  body?: Record<string, unknown>;
}

/**
 * Derive a deduplication key for an outbound HTTP request.
 */
export function deriveRequestDeduplicationKey(signature: RequestSignature): string {
  const bodyHash = signature.body ? hashValue(signature.body) : '';
  return `${signature.method}:${signature.url}:${bodyHash}`;
}

/**
 * Derive a cache key for a Pruna generation call.
 * Includes the API key so different keys never share a result entry.
 */
export function deriveGenerationCacheKey(apiKey: string, input: Record<string, unknown>): string {
  return `${apiKey}:${compositeHash(input)}`;
}
