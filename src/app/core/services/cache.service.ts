import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface CacheConfig {
  key: string;
  ttl?: number; // Time to live in milliseconds
  strategy?: 'network-first' | 'cache-first' | 'stale-while-revalidate';
  version?: string;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly CACHE_PREFIX = 'soulsync_cache_';
  private readonly CACHE_VERSION = '1.0.0';
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeCache();
  }

  /**
   * Initialize cache and clean expired entries
   */
  private initializeCache(): void {
    this.cleanExpiredEntries();
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: this.CACHE_VERSION
    };

    try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.getCacheKey(key), JSON.stringify(entry));
    }
    } catch (error) {
      console.warn('Cache storage failed:', error);
      this.cleanOldEntries();
    }
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    try {
    const cached = typeof localStorage !== 'undefined' ? localStorage.getItem(this.getCacheKey(key)) : null;
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if entry is expired
      if (this.isExpired(entry)) {
        this.delete(key);
        return null;
      }

      // Check version compatibility
      if (entry.version !== this.CACHE_VERSION) {
        this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      return null;
    }
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.getCacheKey(key));
    }
    } catch (error) {
      console.warn('Cache deletion failed:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    try {
    const keys = typeof localStorage !== 'undefined' ? Object.keys(localStorage) : [];
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
        }
      });
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get cache entry with TTL information
   */
  getWithTTL<T>(key: string): { data: T | null; ttl: number } | null {
    try {
    const cached = typeof localStorage !== 'undefined' ? localStorage.getItem(this.getCacheKey(key)) : null;
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      if (this.isExpired(entry)) {
        this.delete(key);
        return null;
      }

      const remainingTTL = entry.timestamp + entry.ttl - Date.now();
      return {
        data: entry.data,
        ttl: Math.max(0, remainingTTL)
      };
    } catch (error) {
      console.warn('Cache TTL retrieval failed:', error);
      return null;
    }
  }

  /**
   * Cache HTTP request with different strategies
   */
  cacheRequest<T>(
    key: string,
    request: Observable<T>,
    config: CacheConfig
  ): Observable<T> {
    const cacheKey = this.getCacheKey(key);
    const strategy = config.strategy || 'network-first';
    const ttl = config.ttl || this.DEFAULT_TTL;

    switch (strategy) {
      case 'cache-first':
        return this.cacheFirst<T>(cacheKey, request, ttl);
      case 'stale-while-revalidate':
        return this.staleWhileRevalidate<T>(cacheKey, request, ttl);
      case 'network-first':
      default:
        return this.networkFirst<T>(cacheKey, request, ttl);
    }
  }

  /**
   * Cache-first strategy: Return cached data immediately, update in background
   */
  private cacheFirst<T>(key: string, request: Observable<T>, ttl: number): Observable<T> {
    const cached = this.get<T>(key);
    
    if (cached) {
      // Return cached data immediately
      return of(cached).pipe(
        tap(() => {
          // Update cache in background
          request.pipe(
            tap(data => this.set(key, data, ttl))
          ).subscribe();
        })
      );
    }

    // No cache, make request and cache result
    return request.pipe(
      tap(data => this.set(key, data, ttl))
    );
  }

  /**
   * Network-first strategy: Try network first, fallback to cache
   */
  private networkFirst<T>(key: string, request: Observable<T>, ttl: number): Observable<T> {
    return request.pipe(
      tap(data => this.set(key, data, ttl)),
      catchError(error => {
        const cached = this.get<T>(key);
        if (cached) {
          return of(cached);
        }
        throw error;
      })
    );
  }

  /**
   * Stale-while-revalidate strategy: Return cached data immediately, update cache
   */
  private staleWhileRevalidate<T>(key: string, request: Observable<T>, ttl: number): Observable<T> {
    const cached = this.get<T>(key);
    
    // Always make the request to update cache
    request.pipe(
      tap(data => this.set(key, data, ttl))
    ).subscribe();

    // Return cached data if available, otherwise wait for request
    if (cached) {
      return of(cached);
    }

    return request;
  }

  /**
   * Preload critical resources
   */
  preloadResources(resources: string[]): Observable<string[]> {
    const preloadPromises = resources.map(resource => {
      if (resource.endsWith('.css')) {
        return this.preloadCSS(resource);
      } else if (resource.endsWith('.js')) {
        return this.preloadJS(resource);
      } else if (this.isImage(resource)) {
        return this.preloadImage(resource);
      } else {
        return Promise.resolve(resource);
      }
    });

    return from(Promise.all(preloadPromises));
  }

  /**
   * Preload CSS file
   */
  private preloadCSS(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;
      
      link.onload = () => resolve(url);
      link.onerror = () => reject(new Error(`Failed to preload CSS: ${url}`));
      
      document.head.appendChild(link);
    });
  }

  /**
   * Preload JavaScript file
   */
  private preloadJS(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = url;
      
      link.onload = () => resolve(url);
      link.onerror = () => reject(new Error(`Failed to preload JS: ${url}`));
      
      document.head.appendChild(link);
    });
  }

  /**
   * Preload image
   */
  private preloadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
      img.src = url;
    });
  }

  /**
   * Check if URL is an image
   */
  private isImage(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalEntries: number; totalSize: number; expiredEntries: number } {
    let totalEntries = 0;
    let totalSize = 0;
    let expiredEntries = 0;

    try {
    const keys = typeof localStorage !== 'undefined' ? Object.keys(localStorage) : [];
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          totalEntries++;
    const value = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
          if (value) {
            totalSize += value.length;
            
            try {
              const entry: CacheEntry = JSON.parse(value);
              if (this.isExpired(entry)) {
                expiredEntries++;
              }
            } catch {
              // Invalid entry
            }
          }
        }
      });
    } catch (error) {
      console.warn('Cache stats failed:', error);
    }

    return { totalEntries, totalSize, expiredEntries };
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredEntries(): void {
    try {
    const keys = typeof localStorage !== 'undefined' ? Object.keys(localStorage) : [];
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
    const value = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
          if (value) {
            try {
              const entry: CacheEntry = JSON.parse(value);
              if (this.isExpired(entry)) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
              }
            } catch {
              // Invalid entry, remove it
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
            }
          }
        }
      });
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }

  /**
   * Clean old entries when storage is full
   */
  private cleanOldEntries(): void {
    try {
      const entries: Array<{ key: string; timestamp: number }> = [];
      
    const keys = typeof localStorage !== 'undefined' ? Object.keys(localStorage) : [];
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
    const value = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
          if (value) {
            try {
              const entry: CacheEntry = JSON.parse(value);
              entries.push({ key, timestamp: entry.timestamp });
            } catch {
              // Invalid entry, remove it
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
            }
          }
        }
      });

      // Sort by timestamp and remove oldest entries
      entries.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.ceil(entries.length * 0.2); // Remove 20% of oldest entries
      
      entries.slice(0, toRemove).forEach(entry => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(entry.key);
    }
      });
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.timestamp + entry.ttl;
  }

  /**
   * Get cache key with prefix
   */
  private getCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }
} 