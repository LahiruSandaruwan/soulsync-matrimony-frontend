import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest 
} from '../models/user.model';
import { WebSocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const user = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
    
    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
      this.isAuthenticatedSubject.next(true);
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuth(response.data.token, response.data.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuth(response.data.token, response.data.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}, { headers })
      .pipe(
        tap(() => {
          this.clearAuth();
        }),
        catchError(this.handleError)
      );
  }

  logoutAll(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/auth/logout-all`, {}, { headers })
      .pipe(
        tap(() => {
          this.clearAuth();
        }),
        catchError(this.handleError)
      );
  }

  getCurrentUser(): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<{success: boolean, data: User}>(`${environment.apiUrl}/auth/me`, { headers })
      .pipe(
        map(response => response.data),
        tap(user => {
          this.currentUserSubject.next(user);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
          }
        }),
        catchError(this.handleError)
      );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/auth/change-password`, {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword
    }, { headers })
      .pipe(catchError(this.handleError));
  }

  // Two-Factor Authentication APIs
  getTwoFactorStatus(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${environment.apiUrl}/2fa/status`, { headers })
      .pipe(catchError(this.handleError));
  }

  setupTwoFactor(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/2fa/setup`, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  verifyTwoFactorSetup(code: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/2fa/verify-setup`, { code }, { headers })
      .pipe(catchError(this.handleError));
  }

  disableTwoFactor(password?: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/2fa/disable`, { password }, { headers })
      .pipe(catchError(this.handleError));
  }

  generateRecoveryCodes(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/2fa/recovery-codes`, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  sendTwoFactorCode(method: 'email' | 'sms'): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/2fa/send-code`, { method }, { headers })
      .pipe(catchError(this.handleError));
  }

  // Delete account
  deleteAccount(password: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${environment.apiUrl}/auth/delete-account`, {
      headers,
      body: { password }
    })
      .pipe(catchError(this.handleError));
  }

  verifyEmail(id: string, hash: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/email/verify/${id}/${hash}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  resendVerificationEmail(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/email/resend`, {}, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  checkEmailVerificationStatus(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${environment.apiUrl}/email/check`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  socialLogin(provider: string, token: string): Observable<AuthResponse> {
    const request = { provider, token };
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/social-login`, request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuth(response.data.token, response.data.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Note: refresh token endpoint not provided by backend docs; avoid using unless added server-side

  private setAuth(token: string, user: User): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);

    // Initialize realtime session
    try {
      this.webSocketService.connect(token).then(() => {
        if (user?.id) {
          this.webSocketService.subscribeUser(user.id);
        }
      });
    } catch (_) {}
  }

  private clearAuth(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    try { this.webSocketService.disconnect(); } catch (_) {}
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin') || this.hasRole('super-admin');
  }

  isPremium(): boolean {
    const user = this.getCurrentUserValue();
    return user?.subscription?.status === 'active' && 
           user?.subscription?.plan_type !== 'free';
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    this.handleError('Authentication service error', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Handle authentication service errors
   * @param message User-friendly error message
   * @param error Technical error details
   */
  private handleError(message: string, error: any): void {
    if (!environment.production) {
      console.error(`Auth Service Error: ${message}`, error);
    }
    // Could emit to error handling service or show notification
  }
} 