import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="loading-container"
      [class]="containerClass"
      [attr.aria-label]="ariaLabel"
      role="status"
      aria-live="polite"
    >
      <div 
        class="spinner"
        [class]="spinnerClass"
        [style.width.px]="size"
        [style.height.px]="size"
      >
        <svg 
          *ngIf="type === 'dots'"
          class="dots-spinner"
          viewBox="0 0 132 58"
          [style.width.px]="size"
          [style.height.px]="size"
        >
          <circle class="dot" cx="25" cy="30" r="13" fill="currentColor">
            <animate attributeName="r" values="13;0;13" dur="1.5s" repeatCount="indefinite" begin="0s"/>
            <animate attributeName="fill-opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" begin="0s"/>
          </circle>
          <circle class="dot" cx="65" cy="30" r="13" fill="currentColor">
            <animate attributeName="r" values="0;13;0" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
            <animate attributeName="fill-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
          </circle>
          <circle class="dot" cx="105" cy="30" r="13" fill="currentColor">
            <animate attributeName="r" values="0;13;0" dur="1.5s" repeatCount="indefinite" begin="1s"/>
            <animate attributeName="fill-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="1s"/>
          </circle>
        </svg>
        
        <div 
          *ngIf="type === 'pulse'"
          class="pulse-spinner"
        ></div>
        
        <div 
          *ngIf="type === 'ring'"
          class="ring-spinner"
        ></div>
        
        <div 
          *ngIf="type === 'default'"
          class="default-spinner"
        ></div>
      </div>
      
      <p 
        *ngIf="text"
        class="loading-text"
        [class]="textClass"
      >
        {{ text }}
      </p>
    </div>
  `,
  styles: [`
    .loading-container {
      @apply flex flex-col items-center justify-center;
    }
    
    .loading-container.fullscreen {
      @apply fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50;
    }
    
    .loading-container.overlay {
      @apply absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm z-10;
    }
    
    .loading-container.inline {
      @apply inline-flex;
    }
    
    .spinner {
      @apply relative;
    }
    
    .spinner.small {
      @apply w-4 h-4;
    }
    
    .spinner.medium {
      @apply w-6 h-6;
    }
    
    .spinner.large {
      @apply w-8 h-8;
    }
    
    .spinner.xlarge {
      @apply w-12 h-12;
    }
    
    /* Default Spinner */
    .default-spinner {
      @apply animate-spin rounded-full border-2 border-gray-200 border-t-primary-600;
    }
    
    /* Ring Spinner */
    .ring-spinner {
      @apply animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 border-r-primary-400 border-b-primary-300;
    }
    
    /* Pulse Spinner */
    .pulse-spinner {
      @apply animate-pulse rounded-full bg-primary-600;
    }
    
    /* Dots Spinner */
    .dots-spinner {
      @apply text-primary-600;
    }
    
    .dots-spinner .dot {
      @apply transition-all duration-300;
    }
    
    /* Loading Text */
    .loading-text {
      @apply mt-3 text-sm text-gray-600 font-medium;
    }
    
    .loading-text.small {
      @apply text-xs;
    }
    
    .loading-text.large {
      @apply text-base;
    }
    
    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .loading-container.fullscreen,
      .loading-container.overlay {
        @apply bg-gray-900 bg-opacity-90;
      }
      
      .loading-text {
        @apply text-gray-300;
      }
      
      .default-spinner {
        @apply border-gray-700 border-t-primary-400;
      }
      
      .ring-spinner {
        @apply border-gray-700 border-t-primary-400 border-r-primary-300 border-b-primary-200;
      }
      
      .pulse-spinner {
        @apply bg-primary-400;
      }
      
      .dots-spinner {
        @apply text-primary-400;
      }
    }
    
    /* Reduced Motion Support */
    @media (prefers-reduced-motion: reduce) {
      .default-spinner,
      .ring-spinner {
        animation: none;
        @apply border-gray-300;
      }
      
      .pulse-spinner {
        animation: none;
        @apply bg-gray-400;
      }
      
      .dots-spinner .dot {
        animation: none;
        @apply opacity-50;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() type: 'default' | 'ring' | 'pulse' | 'dots' = 'default';
  @Input() size: number = 24;
  @Input() variant: 'fullscreen' | 'overlay' | 'inline' = 'inline';
  @Input() text?: string;
  @Input() ariaLabel: string = 'Loading...';

  get containerClass(): string {
    return this.variant;
  }

  get spinnerClass(): string {
    if (this.size <= 16) return 'small';
    if (this.size <= 24) return 'medium';
    if (this.size <= 32) return 'large';
    return 'xlarge';
  }

  get textClass(): string {
    if (this.size <= 16) return 'small';
    if (this.size >= 48) return 'large';
    return '';
  }
} 