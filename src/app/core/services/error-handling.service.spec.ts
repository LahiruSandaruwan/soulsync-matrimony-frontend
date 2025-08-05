import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from './error-handling.service';
import { ToastService } from './toast.service';
import { Observable } from 'rxjs';

describe('ErrorHandlingService', () => {
  let service: ErrorHandlingService;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning', 'info']);
    
    TestBed.configureTestingModule({
      providers: [
        ErrorHandlingService,
        { provide: ToastService, useValue: toastSpy }
      ]
    });
    
    service = TestBed.inject(ErrorHandlingService);
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleHttpError', () => {
    it('should handle 400 error correctly', () => {
      const error = new HttpErrorResponse({ status: 400 });
      
      service.handleHttpError(error).subscribe({
        error: (err) => {
          expect(err).toBe(error);
        }
      });
      
      expect(toastService.error).toHaveBeenCalledWith(
        'Invalid request. Please check your input and try again.',
        'Bad Request'
      );
    });

    it('should handle 401 error correctly', () => {
      const error = new HttpErrorResponse({ status: 401 });
      
      service.handleHttpError(error).subscribe({
        error: (err) => {
          expect(err).toBe(error);
        }
      });
      
      expect(toastService.error).toHaveBeenCalledWith(
        'Authentication required. Please log in again.',
        'Unauthorized'
      );
    });

    it('should handle 500 error correctly', () => {
      const error = new HttpErrorResponse({ status: 500 });
      
      service.handleHttpError(error).subscribe({
        error: (err) => {
          expect(err).toBe(error);
        }
      });
      
      expect(toastService.error).toHaveBeenCalledWith(
        'Server error. Please try again later.',
        'Server Error'
      );
    });

    it('should handle custom error message from server', () => {
      const error = new HttpErrorResponse({
        status: 422,
        error: { message: 'Custom validation error' }
      });
      
      service.handleHttpError(error).subscribe({
        error: (err) => {
          expect(err).toBe(error);
        }
      });
      
      expect(toastService.error).toHaveBeenCalledWith(
        'Custom validation error',
        'Validation Error'
      );
    });
  });

  describe('handleError', () => {
    it('should handle string error', () => {
      const error = 'Test error message';
      
      service.handleError(error);
      
      expect(toastService.error).toHaveBeenCalledWith(
        'Test error message',
        'An error occurred'
      );
    });

    it('should handle object error with message', () => {
      const error = { message: 'Object error message' };
      
      service.handleError(error);
      
      expect(toastService.error).toHaveBeenCalledWith(
        'Object error message',
        'An error occurred'
      );
    });

    it('should not show toast when showToast is false', () => {
      const error = 'Test error';
      
      service.handleError(error, 'Test Context', { showToast: false });
      
      expect(toastService.error).not.toHaveBeenCalled();
    });
  });

  describe('handleValidationError', () => {
    it('should handle string validation error', () => {
      const errors = 'Validation failed';
      
      service.handleValidationError(errors);
      
      expect(toastService.warning).toHaveBeenCalledWith(
        'Validation failed',
        'Validation Error'
      );
    });

    it('should handle array of validation errors', () => {
      const errors = ['Error 1', 'Error 2'];
      
      service.handleValidationError(errors);
      
      expect(toastService.warning).toHaveBeenCalledWith(
        'Error 1',
        'Validation Error'
      );
      expect(toastService.warning).toHaveBeenCalledWith(
        'Error 2',
        'Validation Error'
      );
    });

    it('should handle object validation errors', () => {
      const errors = {
        email: ['Email is invalid'],
        password: ['Password is required']
      };
      
      service.handleValidationError(errors);
      
      expect(toastService.warning).toHaveBeenCalledWith(
        'Email is invalid',
        'Validation Error'
      );
      expect(toastService.warning).toHaveBeenCalledWith(
        'Password is required',
        'Validation Error'
      );
    });
  });

  describe('handleNetworkError', () => {
    it('should handle network error', () => {
      const error = { message: 'Network connection failed' };
      
      service.handleNetworkError(error);
      
      expect(toastService.error).toHaveBeenCalledWith(
        'Please check your internet connection',
        'Network Error'
      );
    });
  });

  describe('handleAuthError', () => {
    it('should handle authentication error', () => {
      const error = { message: 'Token expired' };
      
      service.handleAuthError(error);
      
      expect(toastService.error).toHaveBeenCalledWith(
        'Please log in again',
        'Session Expired'
      );
    });
  });

  describe('handlePermissionError', () => {
    it('should handle permission error', () => {
      const error = { message: 'Insufficient permissions' };
      
      service.handlePermissionError(error);
      
      expect(toastService.warning).toHaveBeenCalledWith(
        'You do not have permission for this action',
        'Access Denied'
      );
    });
  });

  describe('error management', () => {
    it('should add error to errors list', () => {
      const initialErrors = service.getErrors();
      expect(initialErrors.length).toBe(0);
      
      service.handleError('Test error');
      
      const errors = service.getErrors();
      expect(errors.length).toBe(1);
      expect(errors[0].message).toBe('Test error');
    });

    it('should remove error by ID', () => {
      service.handleError('Test error');
      
      const errors = service.getErrors();
      expect(errors.length).toBe(1);
      
      service.removeError(errors[0].id);
      
      const updatedErrors = service.getErrors();
      expect(updatedErrors.length).toBe(0);
    });

    it('should clear all errors', () => {
      service.handleError('Error 1');
      service.handleError('Error 2');
      
      expect(service.getErrors().length).toBe(2);
      
      service.clearErrors();
      
      expect(service.getErrors().length).toBe(0);
    });
  });

  describe('online status', () => {
    it('should track online status', () => {
      expect(service.isOnline()).toBe(navigator.onLine);
    });
  });

  describe('retry mechanism', () => {
    it('should retry operation on retryable errors', (done) => {
      let attempts = 0;
      const operation = () => {
        attempts++;
        if (attempts === 1) {
          return new Observable(subscriber => {
            subscriber.error(new HttpErrorResponse({ status: 500 }));
          });
        } else {
          return new Observable(subscriber => {
            subscriber.next('success');
            subscriber.complete();
          });
        }
      };
      
      service.retry(operation, 2, 100).subscribe({
        next: (result) => {
          expect(result).toBe('success');
          expect(attempts).toBe(2);
          done();
        },
        error: done
      });
    });

    it('should not retry non-retryable errors', (done) => {
      let attempts = 0;
      const operation = () => {
        attempts++;
        return new Observable(subscriber => {
          subscriber.error(new HttpErrorResponse({ status: 400 }));
        });
      };
      
      service.retry(operation, 3, 100).subscribe({
        next: () => done(),
        error: () => {
          expect(attempts).toBe(1);
          done();
        }
      });
    });
  });
}); 