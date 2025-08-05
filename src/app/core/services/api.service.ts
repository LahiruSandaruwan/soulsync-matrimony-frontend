import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ErrorHandlingService } from './error-handling.service';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errors?: any;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ApiConfig {
  timeout?: number;
  retries?: number;
  showError?: boolean;
  showSuccess?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.isOnlineSubject.asObservable();

  private baseUrl = environment.apiUrl;
  private defaultTimeout = 30000; // 30 seconds
  private defaultRetries = 3;

  constructor(
    private http: HttpClient,
    private errorHandlingService: ErrorHandlingService
  ) {
    this.setupOnlineStatusListener();
  }

  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => {
      this.isOnlineSubject.next(true);
    });

    window.addEventListener('offline', () => {
      this.isOnlineSubject.next(false);
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  // GET request
  get<T>(endpoint: string, params?: any, config?: ApiConfig): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const httpParams = this.buildHttpParams(params);
    const headers = this.getAuthHeaders();

    return this.http.get<ApiResponse<T>>(url, { headers, params: httpParams })
      .pipe(
        timeout(config?.timeout || this.defaultTimeout),
        retry(config?.retries || this.defaultRetries),
        catchError(error => this.handleError(error, 'GET', endpoint))
      );
  }

  // POST request
  post<T>(endpoint: string, data?: any, config?: ApiConfig): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getAuthHeaders();

    return this.http.post<ApiResponse<T>>(url, data, { headers })
      .pipe(
        timeout(config?.timeout || this.defaultTimeout),
        retry(config?.retries || this.defaultRetries),
        catchError(error => this.handleError(error, 'POST', endpoint))
      );
  }

  // PUT request
  put<T>(endpoint: string, data?: any, config?: ApiConfig): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getAuthHeaders();

    return this.http.put<ApiResponse<T>>(url, data, { headers })
      .pipe(
        timeout(config?.timeout || this.defaultTimeout),
        retry(config?.retries || this.defaultRetries),
        catchError(error => this.handleError(error, 'PUT', endpoint))
      );
  }

  // PATCH request
  patch<T>(endpoint: string, data?: any, config?: ApiConfig): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getAuthHeaders();

    return this.http.patch<ApiResponse<T>>(url, data, { headers })
      .pipe(
        timeout(config?.timeout || this.defaultTimeout),
        retry(config?.retries || this.defaultRetries),
        catchError(error => this.handleError(error, 'PATCH', endpoint))
      );
  }

  // DELETE request
  delete<T>(endpoint: string, config?: ApiConfig): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getAuthHeaders();

    return this.http.delete<ApiResponse<T>>(url, { headers })
      .pipe(
        timeout(config?.timeout || this.defaultTimeout),
        retry(config?.retries || this.defaultRetries),
        catchError(error => this.handleError(error, 'DELETE', endpoint))
      );
  }

  // File upload
  uploadFile<T>(endpoint: string, file: File, config?: ApiConfig): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.post<ApiResponse<T>>(url, formData, { headers })
      .pipe(
        timeout(config?.timeout || this.defaultTimeout),
        retry(config?.retries || this.defaultRetries),
        catchError(error => this.handleError(error, 'UPLOAD', endpoint))
      );
  }

  // Multiple file upload
  uploadFiles<T>(endpoint: string, files: File[], config?: ApiConfig): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.post<ApiResponse<T>>(url, formData, { headers })
      .pipe(
        timeout(config?.timeout || this.defaultTimeout),
        retry(config?.retries || this.defaultRetries),
        catchError(error => this.handleError(error, 'UPLOAD', endpoint))
      );
  }

  // WebSocket connection
  connectWebSocket(endpoint: string): WebSocket {
    const wsUrl = environment.wsUrl.replace('http', 'ws');
    const token = localStorage.getItem('token');
    const url = `${wsUrl}${endpoint}?token=${token}`;
    
    return new WebSocket(url);
  }

  // Build HTTP parameters
  private buildHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          if (Array.isArray(params[key])) {
            params[key].forEach((value: any) => {
              httpParams = httpParams.append(key, value);
            });
          } else {
            httpParams = httpParams.set(key, params[key]);
          }
        }
      });
    }
    
    return httpParams;
  }

  // Handle API errors
  private handleError(error: any, method: string, endpoint: string): Observable<never> {
    const context = `${method} ${endpoint}`;
    
    if (!this.isOnlineSubject.value) {
      this.errorHandlingService.handleNetworkError(error);
    } else {
      this.errorHandlingService.handleHttpError(error, context);
    }
    
    return throwError(() => error);
  }

  // Check if online
  isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  // Get base URL
  getBaseUrl(): string {
    return this.baseUrl;
  }
} 