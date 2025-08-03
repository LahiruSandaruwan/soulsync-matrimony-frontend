import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ImageOptimizationService, ImageConfig, OptimizedImage } from '../../../core/services/image-optimization.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="image-container" [class]="containerClass">
      <!-- Placeholder -->
      <div 
        *ngIf="showPlaceholder" 
        class="image-placeholder"
        [style.background-image]="'url(' + optimizedImage?.placeholder + ')'"
        [style.width.px]="width"
        [style.height.px]="height"
      >
        <app-loading-spinner 
          *ngIf="isLoading" 
          [size]="24" 
          type="dots"
          text="Loading image..."
        ></app-loading-spinner>
      </div>

      <!-- Main Image -->
      <img
        #imageElement
        [src]="optimizedImage?.placeholder || optimizedImage?.src"
        [alt]="optimizedImage?.alt"
        [width]="optimizedImage?.width"
        [height]="optimizedImage?.height"
        [loading]="optimizedImage?.loading"
        [decoding]="optimizedImage?.decoding"
        [srcset]="optimizedImage?.srcset"
        [sizes]="optimizedImage?.sizes"
        [class]="imageClass"
        [style.object-fit]="objectFit"
        [style.object-position]="objectPosition"
        (load)="onImageLoad()"
        (error)="onImageError()"
        [attr.aria-label]="ariaLabel"
      />

      <!-- Error State -->
      <div 
        *ngIf="hasError" 
        class="image-error"
        [style.width.px]="width"
        [style.height.px]="height"
      >
        <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
        </svg>
        <span class="error-text">Image failed to load</span>
      </div>
    </div>
  `,
  styles: [`
    .image-container {
      @apply relative overflow-hidden;
    }

    .image-container.lazy {
      @apply bg-gray-100;
    }

    .image-container.loaded {
      @apply bg-transparent;
    }

    .image-container.error {
      @apply bg-gray-50 border border-gray-200;
    }

    .image-placeholder {
      @apply absolute inset-0 flex items-center justify-center bg-gray-100 bg-cover bg-center;
      filter: blur(2px);
    }

    .image-placeholder img {
      @apply w-full h-full object-cover;
    }

    .image-container img {
      @apply transition-opacity duration-300;
    }

    .image-container.lazy img {
      @apply opacity-0;
    }

    .image-container.loaded img {
      @apply opacity-100;
    }

    .image-error {
      @apply flex flex-col items-center justify-center text-gray-400;
    }

    .error-icon {
      @apply w-8 h-8 mb-2;
    }

    .error-text {
      @apply text-sm;
    }

    /* Responsive image styles */
    .image-container.responsive img {
      @apply w-full h-auto;
    }

    .image-container.avatar img {
      @apply rounded-full;
    }

    .image-container.rounded img {
      @apply rounded-lg;
    }

    .image-container.shadow img {
      @apply shadow-md;
    }

    /* Loading animation */
    .image-container.loading::before {
      content: '';
      @apply absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .image-container.lazy {
        @apply bg-gray-800;
      }

      .image-placeholder {
        @apply bg-gray-800;
      }

      .image-container.error {
        @apply bg-gray-900 border-gray-700;
      }

      .image-error {
        @apply text-gray-500;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .image-container img {
        @apply transition-none;
      }

      .image-container.loading::before {
        animation: none;
      }
    }
  `]
})
export class OptimizedImageComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() src!: string;
  @Input() alt!: string;
  @Input() width?: number;
  @Input() height?: number;
  @Input() quality: number = 0.8;
  @Input() format: 'webp' | 'jpeg' | 'png' | 'auto' = 'auto';
  @Input() lazy: boolean = true;
  @Input() objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' = 'cover';
  @Input() objectPosition: string = 'center';
  @Input() ariaLabel?: string;
  @Input() variant: 'default' | 'avatar' | 'rounded' | 'shadow' = 'default';

  @ViewChild('imageElement', { static: false }) imageElement!: ElementRef<HTMLImageElement>;

  optimizedImage?: OptimizedImage;
  isLoading = false;
  hasError = false;
  showPlaceholder = true;

  private destroy$ = new Subject<void>();

  constructor(private imageService: ImageOptimizationService) {}

  ngOnInit(): void {
    this.optimizeImage();
  }

  ngAfterViewInit(): void {
    if (this.lazy && this.imageElement?.nativeElement) {
      this.imageService.observeImage(this.imageElement.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private optimizeImage(): void {
    const config: ImageConfig = {
      src: this.src,
      alt: this.alt,
      width: this.width,
      height: this.height,
      quality: this.quality,
      format: this.format,
      lazy: this.lazy
    };

    this.optimizedImage = this.imageService.optimizeImage(config);
    this.isLoading = true;
  }

  onImageLoad(): void {
    this.isLoading = false;
    this.showPlaceholder = false;
    this.hasError = false;
    
    if (this.imageElement?.nativeElement) {
      this.imageElement.nativeElement.classList.add('loaded');
    }
  }

  onImageError(): void {
    this.isLoading = false;
    this.showPlaceholder = false;
    this.hasError = true;
    
    // Fallback to original image
    if (this.imageElement?.nativeElement) {
      this.imageElement.nativeElement.src = this.src;
    }
  }

  get containerClass(): string {
    const classes = ['image-container'];
    
    if (this.isLoading) {
      classes.push('loading');
    }
    
    if (this.hasError) {
      classes.push('error');
    }
    
    if (this.lazy) {
      classes.push('lazy');
    }
    
    if (this.width && this.height) {
      classes.push('responsive');
    }
    
    if (this.variant !== 'default') {
      classes.push(this.variant);
    }
    
    return classes.join(' ');
  }

  get imageClass(): string {
    const classes = ['optimized-image'];
    
    if (this.variant === 'avatar') {
      classes.push('avatar');
    }
    
    if (this.variant === 'rounded') {
      classes.push('rounded');
    }
    
    if (this.variant === 'shadow') {
      classes.push('shadow');
    }
    
    return classes.join(' ');
  }
} 