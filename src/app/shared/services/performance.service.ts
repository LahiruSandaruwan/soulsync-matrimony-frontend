import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export interface BundleStats {
  initialLoadTime: number;
  chunkLoadTimes: { [key: string]: number };
  totalBundleSize: number;
  criticalResourcesCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metricsSubject = new BehaviorSubject<Partial<PerformanceMetrics>>({});
  private bundleStatsSubject = new BehaviorSubject<Partial<BundleStats>>({});
  
  public metrics$ = this.metricsSubject.asObservable();
  public bundleStats$ = this.bundleStatsSubject.asObservable();

  private performanceObserver?: PerformanceObserver;
  private fpsCounter = 0;
  private lastFrameTime = 0;

  constructor() {
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor FPS
    this.startFPSMonitoring();

    // Monitor Web Vitals
    this.monitorWebVitals();

    // Monitor bundle performance
    this.monitorBundlePerformance();

    // Monitor memory usage
    this.monitorMemoryUsage();
  }

  /**
   * Start monitoring FPS
   */
  private startFPSMonitoring(): void {
    const measureFPS = (timestamp: number) => {
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        const fps = Math.round(1000 / delta);
        this.updateMetrics({ fps });
      }
      this.lastFrameTime = timestamp;
      this.fpsCounter++;
      
      if (this.fpsCounter % 60 === 0) { // Update every 60 frames
        requestAnimationFrame(measureFPS);
      } else {
        requestAnimationFrame(measureFPS);
      }
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Monitor Web Vitals metrics
   */
  private monitorWebVitals(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      // First Contentful Paint
      this.observeMetric('paint', (entries) => {
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.updateMetrics({ firstContentfulPaint: entry.startTime });
          }
        });
      });

      // Largest Contentful Paint
      this.observeMetric('largest-contentful-paint', (entries) => {
        const lastEntry = entries[entries.length - 1];
        this.updateMetrics({ largestContentfulPaint: lastEntry.startTime });
      });

      // First Input Delay
      this.observeMetric('first-input', (entries) => {
        const firstEntry = entries[0];
        const firstInputDelay = firstEntry.processingStart - firstEntry.startTime;
        this.updateMetrics({ firstInputDelay });
      });

      // Cumulative Layout Shift
      this.observeMetric('layout-shift', (entries) => {
        let cumulativeScore = 0;
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            cumulativeScore += entry.value;
          }
        });
        this.updateMetrics({ cumulativeLayoutShift: cumulativeScore });
      });

    } catch (error) {
      console.warn('PerformanceObserver not supported:', error);
    }
  }

  /**
   * Observe specific performance metrics
   */
  private observeMetric(
    type: string, 
    callback: (entries: PerformanceEntry[]) => void
  ): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ entryTypes: [type] });
    } catch (error) {
      // Metric type not supported
    }
  }

  /**
   * Monitor bundle performance
   */
  private monitorBundlePerformance(): void {
    if (!performance.timing) return;

    const timing = performance.timing;
    const initialLoadTime = timing.loadEventEnd - timing.navigationStart;
    
    this.updateBundleStats({ 
      initialLoadTime,
      criticalResourcesCount: this.getCriticalResourcesCount()
    });

    // Monitor resource loading
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const chunkLoadTimes: { [key: string]: number } = {};
          
          list.getEntries().forEach(entry => {
            if (entry.name.includes('.js') || entry.name.includes('.css')) {
              const resourceName = entry.name.split('/').pop() || entry.name;
              chunkLoadTimes[resourceName] = entry.duration;
            }
          });

          this.updateBundleStats({ chunkLoadTimes });
        });

        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource timing not supported:', error);
      }
    }
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    if (!('memory' in performance)) return;

    const updateMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        this.updateMetrics({ memoryUsage: Math.round(memoryUsage * 100) });
      }
    };

    // Update memory usage every 5 seconds
    setInterval(updateMemory, 5000);
    updateMemory();
  }

  /**
   * Get count of critical resources
   */
  private getCriticalResourcesCount(): number {
    const resources = performance.getEntriesByType('resource');
    return resources.filter(resource => 
      resource.name.includes('.js') || 
      resource.name.includes('.css') ||
      resource.name.includes('font')
    ).length;
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(newMetrics: Partial<PerformanceMetrics>): void {
    const currentMetrics = this.metricsSubject.value;
    this.metricsSubject.next({ ...currentMetrics, ...newMetrics });
  }

  /**
   * Update bundle statistics
   */
  private updateBundleStats(newStats: Partial<BundleStats>): void {
    const currentStats = this.bundleStatsSubject.value;
    this.bundleStatsSubject.next({ ...currentStats, ...newStats });
  }

  /**
   * Measure function execution time
   */
  measureExecutionTime<T>(fn: () => T, label?: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (label) {
      console.log(`${label} execution time: ${end - start}ms`);
    }
    
    return result;
  }

  /**
   * Measure async function execution time
   */
  async measureAsyncExecutionTime<T>(
    fn: () => Promise<T>, 
    label?: string
  ): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    if (label) {
      console.log(`${label} execution time: ${end - start}ms`);
    }
    
    return result;
  }

  /**
   * Create a performance mark
   */
  mark(name: string): void {
    if (performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark: string): number {
    if (performance.measure && performance.getEntriesByName) {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name, 'measure');
      return measures.length > 0 ? measures[0].duration : 0;
    }
    return 0;
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): Partial<PerformanceMetrics> {
    return this.metricsSubject.value;
  }

  /**
   * Get current bundle statistics
   */
  getCurrentBundleStats(): Partial<BundleStats> {
    return this.bundleStatsSubject.value;
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getCurrentMetrics();
    const bundleStats = this.getCurrentBundleStats();
    
    return `
Performance Report:
==================

Web Vitals:
- First Contentful Paint: ${metrics.firstContentfulPaint?.toFixed(2) || 'N/A'}ms
- Largest Contentful Paint: ${metrics.largestContentfulPaint?.toFixed(2) || 'N/A'}ms
- First Input Delay: ${metrics.firstInputDelay?.toFixed(2) || 'N/A'}ms
- Cumulative Layout Shift: ${metrics.cumulativeLayoutShift?.toFixed(3) || 'N/A'}

Runtime Performance:
- FPS: ${metrics.fps || 'N/A'}
- Memory Usage: ${metrics.memoryUsage || 'N/A'}%

Bundle Performance:
- Initial Load Time: ${bundleStats.initialLoadTime?.toFixed(2) || 'N/A'}ms
- Critical Resources: ${bundleStats.criticalResourcesCount || 'N/A'}
    `.trim();
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    const metrics = this.getCurrentMetrics();
    
    return (
      (metrics.firstContentfulPaint || 0) < 2000 &&
      (metrics.largestContentfulPaint || 0) < 2500 &&
      (metrics.firstInputDelay || 0) < 100 &&
      (metrics.cumulativeLayoutShift || 0) < 0.1 &&
      (metrics.fps || 0) >= 30 &&
      (metrics.memoryUsage || 0) < 80
    );
  }
}
