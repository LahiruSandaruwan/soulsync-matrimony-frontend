import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { ToastService } from './toast.service';

export interface AppError {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  timestamp: Date;
  retryable: boolean;
  action?: () => void;
  dismissible: boolean;
}

export interface ErrorConfig {
  showToast?: boolean;
  logToConsole?: boolean;
  retryable?: boolean;
  action?: () => void;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private errorsSubject = new BehaviorSubject<AppError[]>([]);
  public errors$ = this.errorsSubject.asObservable();

  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.isOnlineSubject.asObservable();

  constructor(private toastService: ToastService) {
    this.setupOnlineStatusListener();
  }

  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => {
      this.isOnlineSubject.next(true);
      this.toastService.success('You are back online', 'Connection restored');
    });

    window.addEventListener('offline', () => {
      this.isOnlineSubject.next(false);
      this.toastService.warning('Please check your internet connection', 'Connection lost');
    });
  }

  // Handle HTTP errors
  handleHttpError(error: HttpErrorResponse, context?: string): Observable<never> {
    const errorMessage = this.getHttpErrorMessage(error);
    const appError: AppError = {
      id: this.generateErrorId(),
      type: 'error',
      title: this.getHttpErrorTitle(error),
      message: errorMessage,
      details: context ? `${context}: ${errorMessage}` : errorMessage,
      timestamp: new Date(),
      retryable: this.isRetryableError(error),
      dismissible: true
    };

    this.addError(appError);
    this.toastService.error(appError.message, appError.title);
    
    return throwError(() => error);
  }

  // Handle general application errors
  handleError(error: any, context?: string, config?: ErrorConfig): void {
    const appError: AppError = {
      id: this.generateErrorId(),
      type: 'error',
      title: 'An error occurred',
      message: this.getErrorMessage(error),
      details: context ? `${context}: ${this.getErrorMessage(error)}` : this.getErrorMessage(error),
      timestamp: new Date(),
      retryable: config?.retryable ?? false,
      action: config?.action,
      dismissible: config?.dismissible ?? true
    };

    this.addError(appError);
    
    if (config?.showToast !== false) {
      this.toastService.error(appError.message, appError.title);
    }

    if (config?.logToConsole !== false) {
      console.error('Application Error:', error);
    }
  }

  // Handle validation errors
  handleValidationError(errors: any, context?: string): void {
    const errorMessages = this.extractValidationMessages(errors);
    
    errorMessages.forEach(message => {
      const appError: AppError = {
        id: this.generateErrorId(),
        type: 'warning',
        title: 'Validation Error',
        message: message,
        details: context ? `${context}: ${message}` : message,
        timestamp: new Date(),
        retryable: false,
        dismissible: true
      };

      this.addError(appError);
      this.toastService.warning(message, 'Validation Error');
    });
  }

  // Handle network errors
  handleNetworkError(error: any): void {
    const appError: AppError = {
      id: this.generateErrorId(),
      type: 'error',
      title: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      details: error?.message || 'Network connection failed',
      timestamp: new Date(),
      retryable: true,
      dismissible: true
    };

    this.addError(appError);
    this.toastService.error('Please check your internet connection', 'Network Error');
  }

  // Handle authentication errors
  handleAuthError(error: any): void {
    const appError: AppError = {
      id: this.generateErrorId(),
      type: 'error',
      title: 'Authentication Error',
      message: 'Your session has expired. Please log in again.',
      details: error?.message || 'Authentication failed',
      timestamp: new Date(),
      retryable: false,
      dismissible: true,
      action: () => {
        // Redirect to login
        window.location.href = '/auth/login';
      }
    };

    this.addError(appError);
    this.toastService.error('Please log in again', 'Session Expired');
  }

  // Handle permission errors
  handlePermissionError(error: any): void {
    const appError: AppError = {
      id: this.generateErrorId(),
      type: 'warning',
      title: 'Access Denied',
      message: 'You do not have permission to perform this action.',
      details: error?.message || 'Insufficient permissions',
      timestamp: new Date(),
      retryable: false,
      dismissible: true
    };

    this.addError(appError);
    this.toastService.warning('You do not have permission for this action', 'Access Denied');
  }

  // Show toast notification (deprecated - use toastService directly)
  showToast(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    switch (type) {
      case 'success':
        this.toastService.success(message, title);
        break;
      case 'error':
        this.toastService.error(message, title);
        break;
      case 'warning':
        this.toastService.warning(message, title);
        break;
      case 'info':
        this.toastService.info(message, title);
        break;
    }
  }

  // Add error to the list
  private addError(error: AppError): void {
    const currentErrors = this.errorsSubject.value;
    this.errorsSubject.next([...currentErrors, error]);
  }

  // Remove error from the list
  removeError(errorId: string): void {
    const currentErrors = this.errorsSubject.value;
    this.errorsSubject.next(currentErrors.filter(error => error.id !== errorId));
  }

  // Clear all errors
  clearErrors(): void {
    this.errorsSubject.next([]);
  }

  // Get current errors
  getErrors(): AppError[] {
    return this.errorsSubject.value;
  }

  // Check if online
  isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  // Generate unique error ID
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get HTTP error message
  private getHttpErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission for this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'Conflict detected. The resource already exists or has been modified.';
      case 422:
        return 'Validation failed. Please check your input and try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Bad gateway. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  // Get HTTP error title
  private getHttpErrorTitle(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      case 422:
        return 'Validation Error';
      case 429:
        return 'Too Many Requests';
      case 500:
        return 'Server Error';
      case 502:
        return 'Bad Gateway';
      case 503:
        return 'Service Unavailable';
      case 504:
        return 'Gateway Timeout';
      default:
        return 'Error';
    }
  }

  // Check if error is retryable
  private isRetryableError(error: HttpErrorResponse): boolean {
    return error.status >= 500 || error.status === 429;
  }

  // Get general error message
  private getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.error?.message) {
      return error.error.message;
    }
    
    return 'An unexpected error occurred';
  }

  // Extract validation messages from error object
  private extractValidationMessages(errors: any): string[] {
    const messages: string[] = [];
    
    if (typeof errors === 'string') {
      messages.push(errors);
      return messages;
    }
    
    if (Array.isArray(errors)) {
      errors.forEach(error => {
        if (typeof error === 'string') {
          messages.push(error);
        } else if (error?.message) {
          messages.push(error.message);
        }
      });
      return messages;
    }
    
    if (typeof errors === 'object') {
      Object.keys(errors).forEach(key => {
        const value = errors[key];
        if (Array.isArray(value)) {
          value.forEach((msg: string) => messages.push(msg));
        } else if (typeof value === 'string') {
          messages.push(value);
        }
      });
    }
    
    return messages.length > 0 ? messages : ['Validation failed'];
  }

  // Retry mechanism
  retry<T>(operation: () => Observable<T>, maxRetries: number = 3, delay: number = 1000): Observable<T> {
    return new Observable(observer => {
      let retries = 0;
      
      const attempt = () => {
        operation().subscribe({
          next: (value) => {
            observer.next(value);
            observer.complete();
          },
          error: (error) => {
            retries++;
            if (retries <= maxRetries && this.isRetryableError(error)) {
              setTimeout(() => attempt(), delay * retries);
            } else {
              observer.error(error);
            }
          }
        });
      };
      
      attempt();
    });
  }
} 