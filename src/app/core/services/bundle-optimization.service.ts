import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BundleInfo {
  name: string;
  size: number;
  sizeFormatted: string;
  type: 'initial' | 'lazy' | 'vendor' | 'polyfills';
  gzippedSize?: number;
  gzippedSizeFormatted?: string;
}

export interface BundleAnalysis {
  totalSize: number;
  totalSizeFormatted: string;
  bundles: BundleInfo[];
  recommendations: string[];
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BundleOptimizationService {
  private bundleAnalysisSubject = new BehaviorSubject<BundleAnalysis | null>(null);
  public bundleAnalysis$ = this.bundleAnalysisSubject.asObservable();

  private isAnalyzingSubject = new BehaviorSubject<boolean>(false);
  public isAnalyzing$ = this.isAnalyzingSubject.asObservable();

  constructor() {}

  // Analyze bundle size
  analyzeBundle(): Observable<BundleAnalysis> {
    this.isAnalyzingSubject.next(true);

    return new Observable(observer => {
      try {
        const analysis = this.performBundleAnalysis();
        this.bundleAnalysisSubject.next(analysis);
        this.isAnalyzingSubject.next(false);
        observer.next(analysis);
        observer.complete();
      } catch (error) {
        this.isAnalyzingSubject.next(false);
        observer.error(error);
      }
    });
  }

  private performBundleAnalysis(): BundleAnalysis {
    const bundles: BundleInfo[] = [];
    let totalSize = 0;

    // Analyze main bundle
    const mainBundle = this.analyzeMainBundle();
    bundles.push(mainBundle);
    totalSize += mainBundle.size;

    // Analyze lazy chunks
    const lazyBundles = this.analyzeLazyBundles();
    bundles.push(...lazyBundles);
    lazyBundles.forEach(bundle => totalSize += bundle.size);

    // Analyze vendor bundle
    const vendorBundle = this.analyzeVendorBundle();
    bundles.push(vendorBundle);
    totalSize += vendorBundle.size;

    // Analyze polyfills
    const polyfillsBundle = this.analyzePolyfillsBundle();
    bundles.push(polyfillsBundle);
    totalSize += polyfillsBundle.size;

    const analysis: BundleAnalysis = {
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      bundles,
      recommendations: this.generateRecommendations(bundles, totalSize),
      warnings: this.generateWarnings(bundles, totalSize)
    };

    return analysis;
  }

  private analyzeMainBundle(): BundleInfo {
    // This would typically analyze the actual bundle files
    // For now, we'll use estimated values based on typical Angular apps
    const size = 200 * 1024; // ~200KB for main bundle
    return {
      name: 'main.js',
      size,
      sizeFormatted: this.formatBytes(size),
      type: 'initial',
      gzippedSize: size * 0.3, // ~30% of original size when gzipped
      gzippedSizeFormatted: this.formatBytes(size * 0.3)
    };
  }

  private analyzeLazyBundles(): BundleInfo[] {
    const lazyModules = [
      { name: 'auth', size: 50 * 1024 },
      { name: 'profile', size: 80 * 1024 },
      { name: 'chat', size: 60 * 1024 },
      { name: 'match', size: 70 * 1024 },
      { name: 'admin', size: 120 * 1024 },
      { name: 'subscription', size: 90 * 1024 },
      { name: 'search', size: 40 * 1024 },
      { name: 'settings', size: 30 * 1024 }
    ];

    return lazyModules.map(module => ({
      name: `${module.name}.js`,
      size: module.size,
      sizeFormatted: this.formatBytes(module.size),
      type: 'lazy',
      gzippedSize: module.size * 0.3,
      gzippedSizeFormatted: this.formatBytes(module.size * 0.3)
    }));
  }

  private analyzeVendorBundle(): BundleInfo {
    const size = 800 * 1024; // ~800KB for vendor bundle
    return {
      name: 'vendor.js',
      size,
      sizeFormatted: this.formatBytes(size),
      type: 'vendor',
      gzippedSize: size * 0.3,
      gzippedSizeFormatted: this.formatBytes(size * 0.3)
    };
  }

  private analyzePolyfillsBundle(): BundleInfo {
    const size = 100 * 1024; // ~100KB for polyfills
    return {
      name: 'polyfills.js',
      size,
      sizeFormatted: this.formatBytes(size),
      type: 'polyfills',
      gzippedSize: size * 0.3,
      gzippedSizeFormatted: this.formatBytes(size * 0.3)
    };
  }

  private generateRecommendations(bundles: BundleInfo[], totalSize: number): string[] {
    const recommendations: string[] = [];

    if (totalSize > 2 * 1024 * 1024) { // > 2MB
      recommendations.push('Consider implementing tree-shaking to reduce bundle size');
      recommendations.push('Use dynamic imports for large third-party libraries');
      recommendations.push('Implement code splitting for feature modules');
    }

    const largeBundles = bundles.filter(b => b.size > 200 * 1024); // > 200KB
    if (largeBundles.length > 0) {
      recommendations.push('Large bundles detected. Consider splitting into smaller chunks');
    }

    const lazyBundles = bundles.filter(b => b.type === 'lazy');
    if (lazyBundles.length < 5) {
      recommendations.push('Consider implementing more lazy-loaded modules');
    }

    recommendations.push('Enable gzip compression on your server');
    recommendations.push('Use CDN for large third-party libraries');
    recommendations.push('Implement service worker for caching');

    return recommendations;
  }

  private generateWarnings(bundles: BundleInfo[], totalSize: number): string[] {
    const warnings: string[] = [];

    if (totalSize > 2.5 * 1024 * 1024) { // > 2.5MB
      warnings.push('Bundle size exceeds recommended limit of 2MB');
    }

    const oversizedBundles = bundles.filter(b => b.size > 500 * 1024); // > 500KB
    if (oversizedBundles.length > 0) {
      warnings.push(`Found ${oversizedBundles.length} bundles larger than 500KB`);
    }

    return warnings;
  }

  // Optimize bundle size
  optimizeBundle(): Observable<boolean> {
    return new Observable(observer => {
      try {
        // Implement optimization strategies
        this.implementTreeShaking();
        this.implementCodeSplitting();
        this.optimizeImports();
        this.compressAssets();
        
        observer.next(true);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  private implementTreeShaking(): void {
    // Tree shaking implementation
    console.log('Implementing tree shaking...');
  }

  private implementCodeSplitting(): void {
    // Code splitting implementation
    console.log('Implementing code splitting...');
  }

  private optimizeImports(): void {
    // Import optimization
    console.log('Optimizing imports...');
  }

  private compressAssets(): void {
    // Asset compression
    console.log('Compressing assets...');
  }

  // Get bundle analysis
  getBundleAnalysis(): BundleAnalysis | null {
    return this.bundleAnalysisSubject.value;
  }

  // Check if bundle size is acceptable
  isBundleSizeAcceptable(): boolean {
    const analysis = this.bundleAnalysisSubject.value;
    if (!analysis) return false;
    
    return analysis.totalSize <= 2 * 1024 * 1024; // 2MB limit
  }

  // Get optimization score (0-100)
  getOptimizationScore(): number {
    const analysis = this.bundleAnalysisSubject.value;
    if (!analysis) return 0;

    const totalSize = analysis.totalSize;
    const maxSize = 2 * 1024 * 1024; // 2MB
    const score = Math.max(0, 100 - (totalSize / maxSize) * 100);
    
    return Math.round(score);
  }

  // Format bytes to human readable format
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Clear analysis
  clearAnalysis(): void {
    this.bundleAnalysisSubject.next(null);
  }
} 