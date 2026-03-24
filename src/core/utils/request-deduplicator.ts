/**
 * Request Deduplication
 * @description Prevent duplicate API requests by caching in-flight promises
 */

interface PendingRequest {
  promise: Promise<unknown>;
  timestamp: number;
}

export class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private readonly ttl: number;

  constructor(ttl: number = 30000) { // 30 seconds default TTL
    this.ttl = ttl;
  }

  /**
   * Execute a request with deduplication
   * If a similar request is in-flight, return its promise instead of creating a new one
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    // Check for in-flight request
    const existing = this.pendingRequests.get(key);
    if (existing) {
      // Verify it's not expired
      if (Date.now() - existing.timestamp < this.ttl) {
        return existing.promise as Promise<T>;
      } else {
        // Clean up expired request
        this.pendingRequests.delete(key);
      }
    }

    // Create new request
    const promise = fn()
      .finally(() => {
        // Clean up after completion (whether success or failure)
        setTimeout(() => {
          this.pendingRequests.delete(key);
        }, 100); // Small delay to prevent race conditions
      });

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear();
  }

  /**
   * Get count of in-flight requests
   */
  size(): number {
    // Clean up expired requests first
    const now = Date.now();
    for (const [key, value] of this.pendingRequests) {
      if (now - value.timestamp >= this.ttl) {
        this.pendingRequests.delete(key);
      }
    }
    return this.pendingRequests.size;
  }

  /**
   * Create a deduplication key from request parameters
   */
  static createKey(
    method: string,
    url: string,
    body?: Record<string, unknown>,
  ): string {
    const bodyStr = body ? JSON.stringify(body, Object.keys(body).sort()) : '';
    return `${method}:${url}:${bodyStr}`;
  }
}

// Global instance for convenience
export const globalDeduplicator = new RequestDeduplicator();
