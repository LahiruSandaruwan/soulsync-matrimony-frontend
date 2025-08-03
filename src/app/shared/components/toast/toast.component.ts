import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, timer, takeUntil } from 'rxjs';

export interface ToastConfig {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="toast-container"
      [class]="toastClass"
      [attr.role]="role"
      [attr.aria-label]="ariaLabel"
      [attr.aria-live]="ariaLive"
      [@toastAnimation]
    >
      <!-- Icon -->
      <div class="toast-icon">
        <svg *ngIf="type === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <svg *ngIf="type === 'error'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <svg *ngIf="type === 'warning'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <svg *ngIf="type === 'info'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
      </div>

      <!-- Content -->
      <div class="toast-content">
        <h4 *ngIf="title" class="toast-title">{{ title }}</h4>
        <p class="toast-message">{{ message }}</p>
      </div>

      <!-- Action Button -->
      <button 
        *ngIf="action"
        class="toast-action"
        (click)="onActionClick()"
        type="button"
      >
        {{ action.label }}
      </button>

      <!-- Dismiss Button -->
      <button 
        *ngIf="dismissible"
        class="toast-dismiss"
        (click)="dismiss()"
        type="button"
        aria-label="Dismiss notification"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>

      <!-- Progress Bar -->
      <div 
        *ngIf="showProgress"
        class="toast-progress"
        [style.width.%]="progressWidth"
      ></div>
    </div>
  `,
  styles: [`
    .toast-container {
      @apply relative flex items-start p-4 rounded-lg shadow-lg border-l-4 max-w-sm w-full bg-white;
      animation: slideIn 0.3s ease-out;
    }
    
    .toast-container.success {
      @apply border-green-500;
    }
    
    .toast-container.error {
      @apply border-red-500;
    }
    
    .toast-container.warning {
      @apply border-yellow-500;
    }
    
    .toast-container.info {
      @apply border-blue-500;
    }
    
    .toast-icon {
      @apply flex-shrink-0 mr-3 mt-0.5;
    }
    
    .toast-container.success .toast-icon {
      @apply text-green-500;
    }
    
    .toast-container.error .toast-icon {
      @apply text-red-500;
    }
    
    .toast-container.warning .toast-icon {
      @apply text-yellow-500;
    }
    
    .toast-container.info .toast-icon {
      @apply text-blue-500;
    }
    
    .toast-content {
      @apply flex-1 min-w-0;
    }
    
    .toast-title {
      @apply text-sm font-medium text-gray-900 mb-1;
    }
    
    .toast-message {
      @apply text-sm text-gray-600;
    }
    
    .toast-action {
      @apply ml-3 flex-shrink-0 text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
    }
    
    .toast-dismiss {
      @apply ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500;
    }
    
    .toast-progress {
      @apply absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-100 ease-linear;
    }
    
    .toast-container.success .toast-progress {
      @apply bg-green-500;
    }
    
    .toast-container.error .toast-progress {
      @apply bg-red-500;
    }
    
    .toast-container.warning .toast-progress {
      @apply bg-yellow-500;
    }
    
    .toast-container.info .toast-progress {
      @apply bg-blue-500;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .toast-container.dismissing {
      animation: slideOut 0.3s ease-in forwards;
    }
    
    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .toast-container {
        @apply bg-gray-800 border-gray-700;
      }
      
      .toast-title {
        @apply text-gray-100;
      }
      
      .toast-message {
        @apply text-gray-300;
      }
      
      .toast-dismiss {
        @apply text-gray-400 hover:text-gray-200;
      }
    }
    
    /* Mobile Responsive */
    @media (max-width: 640px) {
      .toast-container {
        @apply max-w-full mx-4;
      }
    }
    
    /* Reduced Motion Support */
    @media (prefers-reduced-motion: reduce) {
      .toast-container {
        animation: none;
      }
      
      .toast-container.dismissing {
        animation: none;
      }
      
      .toast-progress {
        @apply transition-none;
      }
    }
  `],
  animations: [
    // Add animations here if needed
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() config!: ToastConfig;
  @Output() dismissEvent = new EventEmitter<string>();

  private destroy$ = new Subject<void>();
  private progressTimer?: any;
  
  showProgress = false;
  progressWidth = 100;
  isDismissing = false;

  get type(): string {
    return this.config.type;
  }

  get title(): string | undefined {
    return this.config.title;
  }

  get message(): string {
    return this.config.message;
  }

  get dismissible(): boolean {
    return this.config.dismissible ?? true;
  }

  get action(): { label: string; onClick: () => void } | undefined {
    return this.config.action;
  }

  get toastClass(): string {
    return `${this.type}${this.isDismissing ? ' dismissing' : ''}`;
  }

  get role(): string {
    return this.type === 'error' ? 'alert' : 'status';
  }

  get ariaLabel(): string {
    return `${this.type} notification: ${this.message}`;
  }

  get ariaLive(): string {
    return this.type === 'error' ? 'assertive' : 'polite';
  }

  ngOnInit(): void {
    this.startAutoDismiss();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearTimers();
  }

  private startAutoDismiss(): void {
    const duration = this.config.duration ?? 5000;
    
    if (duration > 0) {
      this.showProgress = true;
      const startTime = Date.now();
      const endTime = startTime + duration;

      this.progressTimer = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = endTime - now;
        
        this.progressWidth = (remaining / duration) * 100;
        
        if (remaining <= 0) {
          this.dismiss();
        }
      }, 100);

      timer(duration).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.dismiss();
      });
    }
  }

  private clearTimers(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
  }

  onActionClick(): void {
    if (this.action) {
      this.action.onClick();
      this.dismiss();
    }
  }

  dismiss(): void {
    if (this.isDismissing) return;
    
    this.isDismissing = true;
    this.clearTimers();
    
    // Emit dismiss event after animation
    setTimeout(() => {
      this.dismissEvent.emit(this.config.id);
    }, 300);
  }
} 