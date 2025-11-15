/**
 * Performance monitoring utilities
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private completedMetrics: PerformanceMetric[] = [];

  start(name: string): void {
    this.metrics.set(name, performance.now());
  }

  end(name: string): PerformanceMetric | null {
    const startTime = this.metrics.get(name);
    if (!startTime) {
      console.warn(`Performance metric "${name}" was not started`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
    };

    this.completedMetrics.push(metric);
    this.metrics.delete(name);

    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
    }

    return metric;
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.completedMetrics];
  }

  getAverageTime(name: string): number {
    const relevantMetrics = this.completedMetrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const total = relevantMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / relevantMetrics.length;
  }

  clear(): void {
    this.metrics.clear();
    this.completedMetrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Performance decorator for async functions
export function measurePerformance<T extends (...args: unknown[]) => Promise<unknown>>(
  name: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    performanceMonitor.start(name);
    try {
      const result = await fn(...args);
      return result;
    } finally {
      performanceMonitor.end(name);
    }
  }) as T;
}

// Hook for React components
export function usePerformance() {
  return {
    start: performanceMonitor.start.bind(performanceMonitor),
    end: performanceMonitor.end.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getAverageTime: performanceMonitor.getAverageTime.bind(performanceMonitor),
    clear: performanceMonitor.clear.bind(performanceMonitor),
  };
}