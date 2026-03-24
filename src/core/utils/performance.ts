/**
 * Performance Monitoring Utilities
 * @description Dev-only performance monitoring with NO production overhead
 */

export interface PerformanceMetrics {
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  requestCount: number;
  averageResponseTime: number;
  lastRequestTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    memoryUsage: null,
    requestCount: 0,
    averageResponseTime: 0,
    lastRequestTime: 0,
  };
  private responseTimes: number[] = [];
  private enabled: boolean;

  constructor() {
    // Performance monitoring is always available but only logs in development
    // Users can manually disable it if needed
    this.enabled = true;
  }

  /**
   * Start timing a request
   */
  startRequest(): number {
    if (!this.enabled) return 0;
    return performance.now();
  }

  /**
   * End timing a request
   */
  endRequest(startTime: number): void {
    if (!this.enabled || startTime === 0) return;

    const duration = performance.now() - startTime;
    this.responseTimes.push(duration);
    this.metrics.requestCount++;
    this.metrics.lastRequestTime = duration;

    // Calculate average (keep only last 100 requests)
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    this.metrics.averageResponseTime =
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  /**
   * Update memory usage metrics
   */
  updateMemoryMetrics(): void {
    if (!this.enabled) return;

    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    if (!this.enabled) {
      return {
        memoryUsage: null,
        requestCount: 0,
        averageResponseTime: 0,
        lastRequestTime: 0,
      };
    }

    this.updateMemoryMetrics();
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    if (!this.enabled) return;

    this.metrics = {
      memoryUsage: null,
      requestCount: 0,
      averageResponseTime: 0,
      lastRequestTime: 0,
    };
    this.responseTimes = [];
  }

  /**
   * Log metrics to console (dev-only)
   */
  logMetrics(): void {
    if (!this.enabled) return;

    const metrics = this.getMetrics();
    console.group('🔍 Pruna Performance Metrics');
    console.log('Request Count:', metrics.requestCount);
    console.log('Average Response Time:', `${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log('Last Request Time:', `${metrics.lastRequestTime.toFixed(2)}ms`);

    if (metrics.memoryUsage) {
      const usedMB = (metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2);
      const totalMB = (metrics.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2);
      const limitMB = (metrics.memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
      console.log('Memory Usage:', `${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
    }

    console.groupEnd();
  }
}

// Global instance
let globalMonitor: PerformanceMonitor | null = null;

/**
 * Get the global performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor();
  }
  return globalMonitor;
}

/**
 * Measure async function performance
 */
export async function measurePerformance<T>(
  fn: () => Promise<T>,
  monitor?: PerformanceMonitor,
): Promise<T> {
  const m = monitor ?? getPerformanceMonitor();
  const start = m.startRequest();

  try {
    const result = await fn();
    m.endRequest(start);
    return result;
  } catch (error) {
    m.endRequest(start);
    throw error;
  }
}

/**
 * Create a performance-aware wrapper for async functions
 */
export function withPerformanceMonitoring<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  label?: string,
): T {
  return (async (...args: unknown[]) => {
    const monitor = getPerformanceMonitor();
    const start = monitor.startRequest();

    if (label) {
      console.time(`🚀 ${label}`);
    }

    try {
      const result = await fn(...args);
      monitor.endRequest(start);

      if (label) {
        console.timeEnd(`🚀 ${label}`);
      }

      return result;
    } catch (error) {
      monitor.endRequest(start);

      if (label) {
        console.timeEnd(`🚀 ${label}`);
      }

      throw error;
    }
  }) as T;
}
