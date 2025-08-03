import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="skeleton-container"
      [class]="containerClass"
      [attr.aria-label]="ariaLabel"
      role="status"
      aria-live="polite"
    >
      <!-- Profile Card Skeleton -->
      <div *ngIf="type === 'profile-card'" class="skeleton-profile-card">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
          <div class="skeleton-tags">
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
          </div>
        </div>
      </div>

      <!-- Chat Message Skeleton -->
      <div *ngIf="type === 'chat-message'" class="skeleton-chat-message">
        <div class="skeleton-avatar small"></div>
        <div class="skeleton-bubble"></div>
      </div>

      <!-- List Item Skeleton -->
      <div *ngIf="type === 'list-item'" class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
        </div>
        <div class="skeleton-action"></div>
      </div>

      <!-- Card Skeleton -->
      <div *ngIf="type === 'card'" class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
        </div>
      </div>

      <!-- Custom Skeleton -->
      <div *ngIf="type === 'custom'" class="skeleton-custom">
        <ng-content></ng-content>
      </div>

      <!-- Text Skeleton -->
      <div *ngIf="type === 'text'" class="skeleton-text-container">
        <div 
          *ngFor="let line of textLines; trackBy: trackByIndex"
          class="skeleton-text-line"
          [class]="line.class"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      @apply relative overflow-hidden;
    }
    
    .skeleton-container.animate {
      @apply animate-pulse;
    }
    
    .skeleton-container.shimmer {
      @apply relative overflow-hidden;
    }
    
    .skeleton-container.shimmer::before {
      content: '';
      @apply absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20;
      animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
    
    /* Common Skeleton Elements */
    .skeleton-avatar {
      @apply bg-gray-200 rounded-full;
      width: 48px;
      height: 48px;
    }
    
    .skeleton-avatar.small {
      width: 32px;
      height: 32px;
    }
    
    .skeleton-title {
      @apply bg-gray-200 rounded h-4 mb-2;
      width: 70%;
    }
    
    .skeleton-text {
      @apply bg-gray-200 rounded h-3 mb-2;
      width: 100%;
    }
    
    .skeleton-text.short {
      width: 60%;
    }
    
    .skeleton-text.medium {
      width: 80%;
    }
    
    .skeleton-tag {
      @apply bg-gray-200 rounded-full h-6 mr-2 mb-2 inline-block;
      width: 60px;
    }
    
    .skeleton-bubble {
      @apply bg-gray-200 rounded-lg h-12 ml-3;
      width: 200px;
    }
    
    .skeleton-image {
      @apply bg-gray-200 rounded-t-lg;
      height: 200px;
    }
    
    .skeleton-action {
      @apply bg-gray-200 rounded h-8;
      width: 80px;
    }
    
    /* Profile Card Skeleton */
    .skeleton-profile-card {
      @apply flex p-4 bg-white rounded-lg shadow-sm;
    }
    
    .skeleton-profile-card .skeleton-content {
      @apply flex-1 ml-4;
    }
    
    .skeleton-profile-card .skeleton-tags {
      @apply flex flex-wrap mt-3;
    }
    
    /* Chat Message Skeleton */
    .skeleton-chat-message {
      @apply flex items-end mb-4;
    }
    
    /* List Item Skeleton */
    .skeleton-list-item {
      @apply flex items-center p-4 bg-white border-b border-gray-100;
    }
    
    .skeleton-list-item .skeleton-content {
      @apply flex-1 ml-3;
    }
    
    .skeleton-list-item .skeleton-action {
      @apply ml-4;
    }
    
    /* Card Skeleton */
    .skeleton-card {
      @apply bg-white rounded-lg shadow-sm overflow-hidden;
    }
    
    .skeleton-card .skeleton-content {
      @apply p-4;
    }
    
    /* Text Skeleton */
    .skeleton-text-container {
      @apply space-y-2;
    }
    
    .skeleton-text-line {
      @apply bg-gray-200 rounded h-3;
    }
    
    .skeleton-text-line.title {
      @apply h-5;
      width: 80%;
    }
    
    .skeleton-text-line.subtitle {
      @apply h-4;
      width: 60%;
    }
    
    .skeleton-text-line.short {
      width: 40%;
    }
    
    .skeleton-text-line.medium {
      width: 70%;
    }
    
    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .skeleton-avatar,
      .skeleton-title,
      .skeleton-text,
      .skeleton-tag,
      .skeleton-bubble,
      .skeleton-image,
      .skeleton-action,
      .skeleton-text-line {
        @apply bg-gray-700;
      }
      
      .skeleton-profile-card,
      .skeleton-list-item,
      .skeleton-card {
        @apply bg-gray-800 border-gray-700;
      }
      
      .skeleton-container.shimmer::before {
        @apply via-gray-600;
      }
    }
    
    /* Reduced Motion Support */
    @media (prefers-reduced-motion: reduce) {
      .skeleton-container.animate {
        animation: none;
      }
      
      .skeleton-container.shimmer::before {
        animation: none;
        @apply opacity-10;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'profile-card' | 'chat-message' | 'list-item' | 'card' | 'custom' | 'text' = 'text';
  @Input() animation: 'pulse' | 'shimmer' | 'none' = 'pulse';
  @Input() textLines: Array<{ class?: string }> = [
    { class: 'title' },
    { class: 'medium' },
    { class: 'short' }
  ];
  @Input() ariaLabel: string = 'Loading content...';

  get containerClass(): string {
    switch (this.animation) {
      case 'pulse':
        return 'animate';
      case 'shimmer':
        return 'shimmer';
      default:
        return '';
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
} 