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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
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
          localStorage.setItem('user', JSON.stringify(user));
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

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const request = {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword
    };
    
    return this.http.post(`${environment.apiUrl}/auth/change-password`, request, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteAccount(password: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const request = { password };
    
    return this.http.delete(`${environment.apiUrl}/auth/delete-account`, { 
      headers, 
      body: request 
    }).pipe(
      tap(() => {
        this.clearAuth();
      }),
      catchError(this.handleError)
    );
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

  refreshToken(): Observable<AuthResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {}, { headers })
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuth(response.data.token, response.data.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  private setAuth(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
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
    
    console.error('Auth Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 