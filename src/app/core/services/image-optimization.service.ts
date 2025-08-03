import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  lazy?: boolean;
  placeholder?: string;
  sizes?: string;
  srcset?: string;
}

export interface OptimizedImage {
  src: string;
  srcset?: string;
  sizes?: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: string;
  loading: 'lazy' | 'eager';
  decoding: 'async' | 'sync' | 'auto';
}

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {
  private imageCache = new Map<string, OptimizedImage>();
  private loadingImages = new BehaviorSubject<Set<string>>(new Set());
  private intersectionObserver?: IntersectionObserver;

  constructor() {
    this.initializeIntersectionObserver();
  }

  private initializeIntersectionObserver(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.intersectionObserver?.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  /**
   * Optimize image configuration for different screen sizes and formats
   */
  optimizeImage(config: ImageConfig): OptimizedImage {
    const cacheKey = this.generateCacheKey(config);
    
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    const optimized: OptimizedImage = {
      src: this.generateOptimizedSrc(config),
      alt: config.alt,
      width: config.width,
      height: config.height,
      loading: config.lazy !== false ? 'lazy' : 'eager',
      decoding: 'async'
    };

    // Generate responsive srcset for different screen sizes
    if (config.width) {
      optimized.srcset = this.generateSrcset(config);
      optimized.sizes = config.sizes || this.generateDefaultSizes(config.width);
    }

    // Generate placeholder for lazy loading
    if (config.lazy !== false) {
      optimized.placeholder = this.generatePlaceholder(config);
    }

    this.imageCache.set(cacheKey, optimized);
    return optimized;
  }

  /**
   * Generate optimized source URL with compression parameters
   */
  private generateOptimizedSrc(config: ImageConfig): string {
    const url = new URL(config.src, window.location.origin);
    
    // Add optimization parameters
    if (config.width) {
      url.searchParams.set('w', config.width.toString());
    }
    if (config.height) {
      url.searchParams.set('h', config.height.toString());
    }
    if (config.quality) {
      url.searchParams.set('q', config.quality.toString());
    }
    if (config.format && config.format !== 'auto') {
      url.searchParams.set('f', config.format);
    }

    // Add WebP support if available
    if (this.supportsWebP() && config.format !== 'jpeg' && config.format !== 'png') {
      url.searchParams.set('f', 'webp');
    }

    return url.toString();
  }

  /**
   * Generate responsive srcset for different screen sizes
   */
  private generateSrcset(config: ImageConfig): string {
    if (!config.width) return '';

    const sizes = [
      { width: Math.round(config.width * 0.5), suffix: '0.5x' },
      { width: Math.round(config.width * 0.75), suffix: '0.75x' },
      { width: config.width, suffix: '1x' },
      { width: Math.round(config.width * 1.5), suffix: '1.5x' },
      { width: Math.round(config.width * 2), suffix: '2x' }
    ];

    return sizes
      .map(size => {
        const optimizedSrc = this.generateOptimizedSrc({
          ...config,
          width: size.width
        });
        return `${optimizedSrc} ${size.suffix}`;
      })
      .join(', ');
  }

  /**
   * Generate default sizes attribute for responsive images
   */
  private generateDefaultSizes(width: number): string {
    if (width <= 400) return '100vw';
    if (width <= 800) return '(max-width: 768px) 100vw, 50vw';
    if (width <= 1200) return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw';
  }

  /**
   * Generate placeholder image (low-quality image preview)
   */
  private generatePlaceholder(config: ImageConfig): string {
    const placeholderConfig = {
      ...config,
      width: Math.min(config.width || 100, 50),
      height: config.height ? Math.min(config.height, 50) : undefined,
      quality: 10
    };
    return this.generateOptimizedSrc(placeholderConfig);
  }

  /**
   * Check if browser supports WebP format
   */
  private supportsWebP(): boolean {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  }

  /**
   * Generate cache key for image configuration
   */
  private generateCacheKey(config: ImageConfig): string {
    return `${config.src}-${config.width}-${config.height}-${config.quality}-${config.format}`;
  }

  /**
   * Load image with lazy loading support
   */
  loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src || img.src;
    if (!src) return;

    // Add to loading set
    const currentLoading = this.loadingImages.value;
    currentLoading.add(src);
    this.loadingImages.next(new Set(currentLoading));

    // Create new image to preload
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      img.classList.remove('lazy');
      img.classList.add('loaded');
      
      // Remove from loading set
      const updatedLoading = this.loadingImages.value;
      updatedLoading.delete(src);
      this.loadingImages.next(new Set(updatedLoading));
    };
    tempImg.onerror = () => {
      // Fallback to original image
      img.src = img.dataset.originalSrc || src;
      img.classList.remove('lazy');
      img.classList.add('error');
      
      // Remove from loading set
      const updatedLoading = this.loadingImages.value;
      updatedLoading.delete(src);
      this.loadingImages.next(new Set(updatedLoading));
    };
    tempImg.src = src;
  }

  /**
   * Observe image for lazy loading
   */
  observeImage(img: HTMLImageElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  /**
   * Compress image using Canvas API
   */
  compressImage(file: File, quality: number = 0.8, maxWidth?: number, maxHeight?: number): Observable<Blob> {
    return new Observable(observer => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              observer.next(blob);
              observer.complete();
            } else {
              observer.error(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        observer.error(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate thumbnail from image
   */
  generateThumbnail(file: File, size: number = 150): Observable<string> {
    return this.compressImage(file, 0.7, size, size).pipe(
      map(blob => URL.createObjectURL(blob)),
      catchError(() => of('/assets/images/default-thumbnail.png'))
    );
  }

  /**
   * Get loading status observable
   */
  getLoadingImages(): Observable<Set<string>> {
    return this.loadingImages.asObservable();
  }

  /**
   * Clear image cache
   */
  clearCache(): void {
    this.imageCache.clear();
  }

  /**
   * Preload critical images
   */
  preloadImages(urls: string[]): Observable<string[]> {
    const loadedImages: string[] = [];
    const totalImages = urls.length;
    let loadedCount = 0;

    return new Observable(observer => {
      urls.forEach(url => {
        const img = new Image();
        img.onload = () => {
          loadedImages.push(url);
          loadedCount++;
          
          if (loadedCount === totalImages) {
            observer.next(loadedImages);
            observer.complete();
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            observer.next(loadedImages);
            observer.complete();
          }
        };
        img.src = url;
      });
    });
  }
} 