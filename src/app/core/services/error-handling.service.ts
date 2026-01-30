import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ErrorInfo {
  id: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
}

export interface NetworkError {
  isOffline: boolean;
  hasSlowConnection: boolean;
  connectionType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private errorsSubject = new BehaviorSubject<ErrorInfo[]>([]);
  public errors$ = this.errorsSubject.asObservable();

  private networkErrorSubject = new BehaviorSubject<NetworkError>({ isOffline: false, hasSlowConnection: false });
  public networkError$ = this.networkErrorSubject.asObservable();

  private maxStoredErrors = 50;

  constructor() {
    this.setupGlobalErrorHandlers();
    this.monitorNetworkStatus();
  }

  /**
   * Handle HTTP errors from API calls
   */
  handleHttpError(error: HttpErrorResponse, context?: string): void {
    let message = 'An unexpected error occurred';
    let severity: ErrorInfo['severity'] = 'medium';
    let action = '';

    switch (error.status) {
      case 0:
        message = 'Network connection failed. Please check your internet connection.';
        severity = 'high';
        action = 'Check your internet connection and try again';
        this.updateNetworkStatus({ isOffline: true, hasSlowConnection: false });
        break;
      case 400:
        message = 'Bad request. Please check your input and try again.';
        severity = 'medium';
        action = 'Verify your input data';
        break;
      case 401:
        message = 'Authentication required. Please log in again.';
        severity = 'high';
        action = 'Please log in again';
        // Trigger re-authentication
        this.triggerReauthentication();
        break;
      case 403:
        message = 'Access denied. You don\'t have permission for this action.';
        severity = 'medium';
        action = 'Contact support if you believe this is an error';
        break;
      case 404:
        message = 'Requested resource not found.';
        severity = 'low';
        action = 'The requested item may have been removed';
        break;
      case 409:
        message = 'Conflict detected. The resource may have been modified.';
        severity = 'medium';
        action = 'Refresh the page and try again';
        break;
      case 422:
        message = 'Validation failed. Please check your input.';
        severity = 'medium';
        action = 'Please correct the highlighted fields';
        if (error.error?.errors) {
          message = this.formatValidationErrors(error.error.errors);
        }
        break;
      case 429:
        message = 'Too many requests. Please try again later.';
        severity = 'medium';
        action = `Wait ${error.headers.get('Retry-After') || 60} seconds before trying again`;
        break;
      case 500:
        message = 'Server error occurred. Please try again later.';
        severity = 'high';
        action = 'Try again in a few moments or contact support if the problem persists';
        break;
      case 502:
      case 503:
        message = 'Service temporarily unavailable. Please try again later.';
        severity = 'high';
        action = 'The service is being maintained. Please try again in a few minutes';
        break;
      default:
        message = 'An unexpected error occurred';
        severity = 'medium';
        action = 'Please try again or contact support';
    }

    this.addError({
      id: this.generateErrorId(),
      message,
      details: error,
      context,
      severity,
      action,
      timestamp: new Date()
    });
  }

  /**
   * Handle authentication errors specifically
   */
  handleAuthError(error: HttpErrorResponse): void {
    let message = 'Authentication failed';
    let severity: ErrorInfo['severity'] = 'high';
    let action = 'Please log in again';

    if (error.status === 401) {
      message = 'Your session has expired. Please log in again.';
      this.triggerReauthentication();
    } else if (error.status === 403) {
      message = 'Access denied. You don\'t have permission for this action.';
      severity = 'medium';
      action = 'Contact support if you believe this is an error';
    }

    this.addError({
      id: this.generateErrorId(),
      message,
      details: error,
      context: 'authentication',
      severity,
      action,
      timestamp: new Date()
    });
  }

  /**
   * Handle permission errors specifically
   */
  handlePermissionError(error: HttpErrorResponse): void {
    const message = 'You don\'t have permission to perform this action';
    const action = 'Contact support if you believe this is an error';

    this.addError({
      id: this.generateErrorId(),
      message,
      details: error,
      context: 'permissions',
      severity: 'medium',
      action,
      timestamp: new Date()
    });
  }

  /**
   * Handle validation errors specifically
   */
  handleValidationError(validationErrors: any): void {
    const message = 'Please correct the following errors:';
    const action = 'Please correct the highlighted fields';

    this.addError({
      id: this.generateErrorId(),
      message,
      details: validationErrors,
      context: 'validation',
      severity: 'medium',
      action,
      timestamp: new Date()
    });
  }

  /**
   * Show a toast notification
   */
  showToast(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    // This would integrate with a toast service
    // For now, we'll add it to the error list for consistency
    this.addError({
      id: this.generateErrorId(),
      message: `${title}: ${message}`,
      details: { type, title, message },
      context: 'toast',
      severity: type === 'error' ? 'medium' : 'low',
      timestamp: new Date()
    });
  }

  /**
   * Handle network errors (offline, slow connection, etc.)
   */
  handleNetworkError(error: any): void {
    const networkInfo = this.getNetworkInfo();
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    this.updateNetworkStatus({
      isOffline: !isOnline,
      hasSlowConnection: networkInfo.downlink ? networkInfo.downlink < 1 : false,
      connectionType: networkInfo.effectiveType
    });

    this.addError({
      id: this.generateErrorId(),
      message: 'Network connection issue detected',
      details: {
        online: isOnline,
        connectionType: networkInfo.effectiveType,
        downlink: networkInfo.downlink,
        error
      },
      timestamp: new Date(),
      context: 'Network',
      severity: 'high',
      action: 'Check your internet connection'
    });

    this.logError('Network Error', error, 'Network');
  }

  /**
   * Handle application errors (unhandled exceptions, etc.)
   */
  handleApplicationError(error: Error, context?: string): void {
    this.addError({
      id: this.generateErrorId(),
      message: error.message || 'An application error occurred',
      details: {
        name: error.name,
        stack: error.stack,
        error
      },
      timestamp: new Date(),
      context: context || 'Application',
      severity: 'high',
      action: 'Refresh the page if the problem persists'
    });

    this.logError('Application Error', error, context);
  }

  /**
   * Handle user-facing errors with custom messages
   */
  handleUserError(message: string, details?: any, context?: string): void {
    this.addError({
      id: this.generateErrorId(),
      message,
      details,
      timestamp: new Date(),
      context: context || 'User Action',
      severity: 'low',
      action: 'Please try a different approach'
    });
  }

  /**
   * Add error to the error queue
   */
  private addError(error: ErrorInfo): void {
    const currentErrors = this.errorsSubject.value;
    const updatedErrors = [error, ...currentErrors].slice(0, this.maxStoredErrors);
    this.errorsSubject.next(updatedErrors);

    // Auto-clear low severity errors after 30 seconds
    if (error.severity === 'low') {
      setTimeout(() => {
        this.removeError(error.id);
      }, 30000);
    }
  }

  /**
   * Remove specific error from queue
   */
  removeError(errorId: string): void {
    const currentErrors = this.errorsSubject.value;
    const updatedErrors = currentErrors.filter(error => error.id !== errorId);
    this.errorsSubject.next(updatedErrors);
  }

  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this.errorsSubject.next([]);
  }

  /**
   * Clear errors by severity
   */
  clearErrorsBySeverity(severity: ErrorInfo['severity']): void {
    const currentErrors = this.errorsSubject.value;
    const updatedErrors = currentErrors.filter(error => error.severity !== severity);
    this.errorsSubject.next(updatedErrors);
  }

  /**
   * Get current errors
   */
  getCurrentErrors(): ErrorInfo[] {
    return this.errorsSubject.value;
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorInfo['severity']): ErrorInfo[] {
    return this.errorsSubject.value.filter(error => error.severity === severity);
  }

  /**
   * Check if there are critical errors
   */
  hasCriticalErrors(): boolean {
    return this.errorsSubject.value.some(error => error.severity === 'critical');
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return; // Skip setup during server-side rendering
    }

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleApplicationError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        'Promise Rejection'
      );
      event.preventDefault();
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleApplicationError(
        new Error(`${event.message} at ${event.filename}:${event.lineno}:${event.colno}`),
        'JavaScript Error'
      );
    });
  }

  /**
   * Monitor network status changes
   */
  private monitorNetworkStatus(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return; // Skip setup during server-side rendering
    }

    window.addEventListener('online', () => {
      this.updateNetworkStatus({ isOffline: false, hasSlowConnection: false });
      this.clearErrorsBySeverity('high'); // Clear network-related errors
    });

    window.addEventListener('offline', () => {
      this.updateNetworkStatus({ isOffline: true, hasSlowConnection: false });
      this.handleNetworkError(new Error('Device went offline'));
    });

    // Monitor connection quality if supported
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        this.updateNetworkStatus({
          isOffline: !navigator.onLine,
          hasSlowConnection: connection.downlink < 1,
          connectionType: connection.effectiveType
        });
      });
    }
  }

  /**
   * Update network status
   */
  private updateNetworkStatus(status: NetworkError): void {
    this.networkErrorSubject.next(status);
  }

  /**
   * Get network information
   */
  private getNetworkInfo(): any {
    if (typeof navigator === 'undefined') {
      return {};
    }
    
    if ('connection' in navigator) {
      return (navigator as any).connection;
    }
    return {};
  }

  /**
   * Format validation errors from API
   */
  private formatValidationErrors(errors: any): string {
    if (typeof errors === 'object') {
      const messages = Object.values(errors)
        .flat()
        .filter(msg => typeof msg === 'string');
      return messages.length > 0 ? messages.join(', ') : 'Validation failed';
    }
    return 'Validation failed';
  }

  /**
   * Trigger re-authentication
   */
  private triggerReauthentication(): void {
    // Clear stored tokens
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    // Redirect to login (this could be done via router service injection)
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log error details (only in development)
   */
  private logError(type: string, error: any, context?: string): void {
    if (!environment.production) {
      console.group(`🚨 ${type} ${context ? `(${context})` : ''}`);
      console.error('Error:', error);
      console.error('Timestamp:', new Date().toISOString());
      if (context) {
        console.error('Context:', context);
      }
      console.groupEnd();
    }

    // In production, you might want to send errors to a monitoring service
    // this.sendErrorToMonitoringService(type, error, context);
  }

  /**
   * Send error to external monitoring service (placeholder)
   */
  private sendErrorToMonitoringService(type: string, error: any, context?: string): void {
    // Implementation for services like Sentry, Bugsnag, etc.
    // Example:
    // Sentry.captureException(error, {
    //   tags: { type, context },
    //   extra: { timestamp: new Date().toISOString() }
    // });
  }

  /**
   * Report user feedback about an error
   */
  reportErrorFeedback(errorId: string, feedback: string, userEmail?: string): void {
    const error = this.errorsSubject.value.find(e => e.id === errorId);
    if (error) {
      const report = {
        errorId,
        feedback,
        userEmail,
        error: error,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
      };

      this.logError('Error Feedback', report);
      // Send to monitoring service
      // this.sendErrorToMonitoringService('user_feedback', report);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): any {
    const errors = this.errorsSubject.value;
    return {
      total: errors.length,
      bySeverity: {
        low: errors.filter(e => e.severity === 'low').length,
        medium: errors.filter(e => e.severity === 'medium').length,
        high: errors.filter(e => e.severity === 'high').length,
        critical: errors.filter(e => e.severity === 'critical').length
      },
      byContext: errors.reduce((acc, error) => {
        const context = error.context || 'Unknown';
        acc[context] = (acc[context] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recent: errors.filter(e => Date.now() - e.timestamp.getTime() < 300000) // Last 5 minutes
    };
  }
}