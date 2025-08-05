import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastConfig } from '../../shared/components/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastConfig[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  constructor() {}

  // Show success toast
  success(message: string, title?: string, duration?: number): void {
    this.show({
      type: 'success',
      title: title || 'Success',
      message,
      duration: duration || 5000,
      dismissible: true
    });
  }

  // Show error toast
  error(message: string, title?: string, duration?: number): void {
    this.show({
      type: 'error',
      title: title || 'Error',
      message,
      duration: duration || 7000,
      dismissible: true
    });
  }

  // Show warning toast
  warning(message: string, title?: string, duration?: number): void {
    this.show({
      type: 'warning',
      title: title || 'Warning',
      message,
      duration: duration || 6000,
      dismissible: true
    });
  }

  // Show info toast
  info(message: string, title?: string, duration?: number): void {
    this.show({
      type: 'info',
      title: title || 'Information',
      message,
      duration: duration || 5000,
      dismissible: true
    });
  }

  // Show toast with custom config
  show(config: ToastConfig): void {
    const toast: ToastConfig = {
      id: this.generateToastId(),
      ...config
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);
  }

  // Show toast with action
  showWithAction(
    message: string, 
    actionLabel: string, 
    actionCallback: () => void, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    title?: string
  ): void {
    this.show({
      type,
      title: title || 'Action Required',
      message,
      duration: 0, // No auto-dismiss for action toasts
      dismissible: true,
      action: {
        label: actionLabel,
        onClick: actionCallback
      }
    });
  }

  // Dismiss toast by ID
  dismiss(toastId: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== toastId));
  }

  // Clear all toasts
  clear(): void {
    this.toastsSubject.next([]);
  }

  // Get current toasts
  getToasts(): ToastConfig[] {
    return this.toastsSubject.value;
  }

  // Generate unique toast ID
  private generateToastId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 