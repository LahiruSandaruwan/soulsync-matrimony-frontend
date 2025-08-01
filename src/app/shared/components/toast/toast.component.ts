import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  position?: ToastPosition;
  showCloseButton?: boolean;
  showProgress?: boolean;
  data?: any;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() toast!: Toast;
  @Input() position: ToastPosition = 'top-right';
  
  @Output() close = new EventEmitter<string>();
  @Output() action = new EventEmitter<{toastId: string, action: string}>();

  progress = 100;
  private progressInterval?: any;
  private closeTimeout?: any;

  ngOnInit(): void {
    this.startProgress();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private startProgress(): void {
    const duration = this.toast.duration || 5000;
    
    if (duration > 0 && this.toast.showProgress !== false) {
      const interval = 10; // Update every 10ms
      const totalSteps = duration / interval;
      const stepValue = 100 / totalSteps;
      
      this.progressInterval = setInterval(() => {
        this.progress -= stepValue;
        if (this.progress <= 0) {
          this.closeToast();
        }
      }, interval);
    }

    if (duration > 0) {
      this.closeTimeout = setTimeout(() => {
        this.closeToast();
      }, duration);
    }
  }

  private clearTimers(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
  }

  onClose(): void {
    this.closeToast();
  }

  onAction(action: string): void {
    this.action.emit({ toastId: this.toast.id, action });
  }

  private closeToast(): void {
    this.clearTimers();
    this.close.emit(this.toast.id);
  }

  getToastClasses(): string {
    const baseClasses = 'toast-item flex items-start p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300';
    
    const typeClasses = {
      success: 'bg-green-50 border-green-400 text-green-800',
      error: 'bg-red-50 border-red-400 text-red-800',
      warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
      info: 'bg-blue-50 border-blue-400 text-blue-800'
    };

    return `${baseClasses} ${typeClasses[this.toast.type]}`;
  }

  getIconClasses(): string {
    const baseClasses = 'flex-shrink-0 w-5 h-5';
    
    const typeClasses = {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400'
    };

    return `${baseClasses} ${typeClasses[this.toast.type]}`;
  }

  getProgressClasses(): string {
    const baseClasses = 'absolute bottom-0 left-0 h-1 transition-all duration-100 ease-linear';
    
    const typeClasses = {
      success: 'bg-green-400',
      error: 'bg-red-400',
      warning: 'bg-yellow-400',
      info: 'bg-blue-400'
    };

    return `${baseClasses} ${typeClasses[this.toast.type]}`;
  }

  getToastIcon(): string {
    const icons = {
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };

    return icons[this.toast.type];
  }

  getPositionClasses(): string {
    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    return positionClasses[this.position];
  }
} 