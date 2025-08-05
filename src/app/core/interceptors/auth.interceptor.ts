import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ErrorHandlingService } from '../services/error-handling.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const authService = inject(AuthService);
  const errorHandlingService = inject(ErrorHandlingService);
  const router = inject(Router);
  
  const token = authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle different types of errors
      switch (error.status) {
        case 401:
          if (!req.url.includes('auth/refresh') && !req.url.includes('auth/login')) {
            // Handle unauthorized - redirect to login
            errorHandlingService.handleAuthError(error);
            authService.logout().subscribe(() => {
              router.navigate(['/auth/login']);
            });
          }
          break;
          
        case 403:
          // Handle forbidden access
          errorHandlingService.handlePermissionError(error);
          break;
          
        case 422:
          // Handle validation errors
          errorHandlingService.handleValidationError(error.error?.errors || error.error, req.url);
          break;
          
        case 429:
          // Handle rate limiting
          errorHandlingService.showToast('Rate Limited', 'Too many requests. Please wait a moment.', 'warning');
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Handle server errors
          errorHandlingService.handleHttpError(error, req.url);
          break;
          
        default:
          // Handle other errors
          if (error.status >= 400) {
            errorHandlingService.handleHttpError(error, req.url);
          }
          break;
      }
      
      return throwError(() => error);
    })
  );
}; 