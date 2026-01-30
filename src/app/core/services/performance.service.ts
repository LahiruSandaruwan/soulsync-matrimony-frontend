import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, filter } from 'rxjs/operators';

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  memoryUsage?: number;
  networkRequests: number;
  cacheHitRate: number;
}

export interface PerformanceEvent {
  type: 'navigation' | 'paint' | 'largest-contentful-paint' | 'first-input' | 'layout-shift' | 'memory' | 'network';
  name: string;
  value: number;
  timestamp: number;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metricsSubject = new BehaviorSubject<PerformanceMetrics | null>(null);
  private eventsSubject = new BehaviorSubject<PerformanceEvent[]>([]);
  private observer?: PerformanceObserver;

  public metrics$ = this.metricsSubject.asObservable();
  public events$ = this.eventsSubject.asObservable();

  constructor() {
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.setupPerformanceObservers();
      this.trackNavigationTiming();
      this.trackMemoryUsage();
      this.trackNetworkRequests();
    }
  }

  /**
   * Setup PerformanceObserver for various metrics
   */
  private setupPerformanceObservers(): void {
    try {
      // Paint timing
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordEvent({
            type: 'paint',
            name: entry.name,
            value: entry.startTime,
            timestamp: Date.now(),
            metadata: { entryType: entry.entryType }
          });
        }
      });
      this.observer.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordEvent({
          type: 'largest-contentful-paint',
          name: 'LCP',
          value: lastEntry.startTime,
          timestamp: Date.now(),
          metadata: { element: lastEntry.element?.tagName }
        });
      });
      this.observer.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordEvent({
            type: 'first-input',
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now(),
            metadata: { inputType: entry.name }
          });
        }
      });
      this.observer.observe({ entryTypes: ['first-input'] });

      // Layout Shift
      this.observer = new PerformanceObserver((list) => {
        let cumulativeLayoutShift = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            cumulativeLayoutShift += (entry as any).value;
          }
        }
        this.recordEvent({
          type: 'layout-shift',
          name: 'CLS',
          value: cumulativeLayoutShift,
          timestamp: Date.now()
        });
      });
      this.observer.observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      console.warn('PerformanceObserver not supported:', error);
    }
  }

  /**
   * Track navigation timing
   */
  private trackNavigationTiming(): void {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const timeToInteractive = navigation.domContentLoadedEventEnd - navigation.fetchStart;

        this.recordEvent({
          type: 'navigation',
          name: 'LoadTime',
          value: loadTime,
          timestamp: Date.now()
        });

        this.recordEvent({
          type: 'navigation',
          name: 'TimeToInteractive',
          value: timeToInteractive,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Track memory usage (Chrome only)
   */
  private trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        interval(30000).subscribe(() => {
          const usedMemory = memory.usedJSHeapSize / 1024 / 1024; // MB
          this.recordEvent({
            type: 'memory',
            name: 'MemoryUsage',
            value: usedMemory,
            timestamp: Date.now(),
            metadata: {
              total: memory.totalJSHeapSize / 1024 / 1024,
              limit: memory.jsHeapSizeLimit / 1024 / 1024
            }
          });
        });
      }
    }
  }

  /**
   * Track network requests
   */
  private trackNetworkRequests(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          let totalRequests = 0;
          let cachedRequests = 0;

          for (const entry of list.getEntries()) {
            totalRequests++;
            if (entry.transferSize === 0 && entry.encodedBodySize > 0) {
              cachedRequests++;
            }
          }

          const cacheHitRate = totalRequests > 0 ? (cachedRequests / totalRequests) * 100 : 0;

          this.recordEvent({
            type: 'network',
            name: 'CacheHitRate',
            value: cacheHitRate,
            timestamp: Date.now(),
            metadata: { totalRequests, cachedRequests }
          });
        });
        this.observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource timing not supported:', error);
      }
    }
  }

  /**
   * Record performance event
   */
  private recordEvent(event: PerformanceEvent): void {
    const currentEvents = this.eventsSubject.value;
    this.eventsSubject.next([...currentEvents, event]);

    // Update metrics
    this.updateMetrics();
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    const events = this.eventsSubject.value;
    
    const metrics: PerformanceMetrics = {
      loadTime: this.getEventValue(events, 'navigation', 'LoadTime'),
      firstContentfulPaint: this.getEventValue(events, 'paint', 'first-contentful-paint'),
      largestContentfulPaint: this.getEventValue(events, 'largest-contentful-paint', 'LCP'),
      firstInputDelay: this.getEventValue(events, 'first-input', 'FID'),
      cumulativeLayoutShift: this.getEventValue(events, 'layout-shift', 'CLS'),
      timeToInteractive: this.getEventValue(events, 'navigation', 'TimeToInteractive'),
      memoryUsage: this.getEventValue(events, 'memory', 'MemoryUsage'),
      networkRequests: this.getEventValue(events, 'network', 'TotalRequests'),
      cacheHitRate: this.getEventValue(events, 'network', 'CacheHitRate')
    };

    this.metricsSubject.next(metrics);
  }

  /**
   * Get event value by type and name
   */
  private getEventValue(events: PerformanceEvent[], type: string, name: string): number {
    const event = events.find(e => e.type === type && e.name === name);
    return event ? event.value : 0;
  }

  /**
   * Measure custom performance metric
   */
  measureCustomMetric(name: string, fn: () => any): any {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    this.recordEvent({
      type: 'navigation',
      name: `Custom_${name}`,
      value: duration,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Measure async operation
   */
  async measureAsyncMetric<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    this.recordEvent({
      type: 'navigation',
      name: `Async_${name}`,
      value: duration,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metricsSubject.value;
  }

  /**
   * Get performance events by type
   */
  getEventsByType(type: string): Observable<PerformanceEvent[]> {
    return this.events$.pipe(
      map(events => events.filter(event => event.type === type))
    );
  }

  /**
   * Get performance score based on metrics
   */
  getPerformanceScore(): Observable<number> {
    return this.metrics$.pipe(
      filter(metrics => metrics !== null),
      map(metrics => {
        if (!metrics) return 0;

        let score = 100;

        // LCP scoring (0-25 points)
        if (metrics.largestContentfulPaint < 2500) score += 25;
        else if (metrics.largestContentfulPaint < 4000) score += 15;
        else if (metrics.largestContentfulPaint < 6000) score += 5;

        // FID scoring (0-25 points)
        if (metrics.firstInputDelay < 100) score += 25;
        else if (metrics.firstInputDelay < 300) score += 15;
        else if (metrics.firstInputDelay < 500) score += 5;

        // CLS scoring (0-25 points)
        if (metrics.cumulativeLayoutShift < 0.1) score += 25;
        else if (metrics.cumulativeLayoutShift < 0.25) score += 15;
        else if (metrics.cumulativeLayoutShift < 0.5) score += 5;

        // Cache hit rate scoring (0-25 points)
        if (metrics.cacheHitRate > 80) score += 25;
        else if (metrics.cacheHitRate > 60) score += 15;
        else if (metrics.cacheHitRate > 40) score += 5;

        return Math.max(0, Math.min(100, score));
      })
    );
  }

  /**
   * Export performance data
   */
  exportPerformanceData(): string {
    const metrics = this.getCurrentMetrics();
    const events = this.eventsSubject.value;
    
    return JSON.stringify({
      metrics,
      events,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    }, null, 2);
  }

  /**
   * Clear performance data
   */
  clearPerformanceData(): void {
    this.eventsSubject.next([]);
    this.metricsSubject.next(null);
  }

  /**
   * Check if performance monitoring is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'PerformanceObserver' in window && 
           'performance' in window;
  }
} 