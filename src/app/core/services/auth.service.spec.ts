import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { AuthResponse, RegisterRequest, ForgotPasswordRequest } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Clear localStorage to ensure clean state
    localStorage.clear();
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send POST request to login endpoint', () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const mockResponse: AuthResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: 1,
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '1990-01-01',
            gender: 'male',
            country_code: '+1',
            email_verified_at: null,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          }
        },
        message: 'Login successful'
      };

      service.login(loginData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should send POST request to register endpoint', () => {
      const registerData: RegisterRequest = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        date_of_birth: '1990-01-01',
        gender: 'male',
        country_code: '+1',
        terms_accepted: true,
        privacy_accepted: true
      };
      const mockResponse: AuthResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: 1,
            email: 'john@example.com',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '1990-01-01',
            gender: 'male',
            country_code: '+1',
            email_verified_at: null,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          }
        },
        message: 'User registered successfully'
      };

      service.register(registerData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should send POST request to logout endpoint', () => {
      const mockResponse = { message: 'Logged out successfully' };

      service.logout().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('refreshToken', () => {
    it('should send POST request to refresh token endpoint', () => {
      const mockResponse: AuthResponse = {
        success: true,
        data: {
          token: 'new-token',
          user: {
            id: 1,
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '1990-01-01',
            gender: 'male',
            country_code: '+1',
            email_verified_at: null,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          }
        },
        message: 'Token refreshed successfully'
      };

      service.refreshToken().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should send POST request to forgot password endpoint', () => {
      const forgotPasswordData: ForgotPasswordRequest = { email: 'test@example.com' };
      const mockResponse = { message: 'Password reset email sent' };

      service.forgotPassword(forgotPasswordData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(forgotPasswordData);
      req.flush(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('should send POST request to reset password endpoint', () => {
      const resetData = {
        token: 'reset-token',
        email: 'test@example.com',
        password: 'newpassword123',
        password_confirmation: 'newpassword123'
      };
      const mockResponse = { message: 'Password reset successfully' };

      service.resetPassword(resetData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(resetData);
      req.flush(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('should send GET request to get current user endpoint', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        gender: 'male' as const,
        country_code: '+1',
        email_verified_at: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      service.getCurrentUser().subscribe(response => {
        expect(response).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockUser });
    });
  });

  describe('changePassword', () => {
    it('should send POST request to change password endpoint', () => {
      const passwordData = {
        current_password: 'oldpassword',
        new_password: 'newpassword123',
        confirm_password: 'newpassword123'
      };
      const mockResponse = { message: 'Password changed successfully' };

      service.changePassword('oldpassword', 'newpassword123', 'newpassword123').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/change-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(passwordData);
      req.flush(mockResponse);
    });
  });

  describe('enableTwoFactor', () => {
    it('should send POST request to enable 2FA endpoint', () => {
      const mockResponse = { message: '2FA enabled successfully' };

      service.enableTwoFactor().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/2fa/enable`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('deleteAccount', () => {
    it('should send DELETE request to delete account endpoint', () => {
      const mockResponse = { message: 'Account deleted successfully' };

      service.deleteAccount('password123').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/account`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({ password: 'password123' });
      req.flush(mockResponse);
    });
  });

  describe('verifyEmail', () => {
    it('should send GET request to verify email endpoint', () => {
      const mockResponse = { message: 'Email verified successfully' };

      service.verifyEmail('user-id', 'verification-hash').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/email/verify/user-id/verification-hash`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should send POST request to resend verification email endpoint', () => {
      const mockResponse = { message: 'Verification email sent' };

      service.resendVerificationEmail().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/email/resend`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('checkEmailVerificationStatus', () => {
    it('should send GET request to check email verification status endpoint', () => {
      const mockResponse = { verified: true };

      service.checkEmailVerificationStatus().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/email/check`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('socialLogin', () => {
    it('should send POST request to social login endpoint', () => {
      const socialLoginData = { provider: 'google', token: 'social-token' };
      const mockResponse: AuthResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: 1,
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '1990-01-01',
            gender: 'male',
            country_code: '+1',
            email_verified_at: null,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          }
        },
        message: 'Social login successful'
      };

      service.socialLogin('google', 'social-token').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/social-login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(socialLoginData);
      req.flush(mockResponse);
    });
  });

  describe('authentication state', () => {
    it('should initialize with no authentication', () => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUserValue()).toBeNull();
      expect(service.getToken()).toBeNull();
    });

    it('should update authentication state after successful login', () => {
      const mockResponse: AuthResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: 1,
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '1990-01-01',
            gender: 'male',
            country_code: '+1',
            email_verified_at: null,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          }
        },
        message: 'Login successful'
      };

      service.login({ email: 'test@example.com', password: 'password123' }).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);

      expect(service.isAuthenticated()).toBe(true);
      expect(service.getCurrentUserValue()).toEqual(mockResponse.data.user);
      expect(service.getToken()).toBe('test-token');
    });

    it('should clear authentication state after logout', () => {
      // First login
      const mockResponse: AuthResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: 1,
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '1990-01-01',
            gender: 'male',
            country_code: '+1',
            email_verified_at: null,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          }
        },
        message: 'Login successful'
      };

      service.login({ email: 'test@example.com', password: 'password123' }).subscribe();
      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      loginReq.flush(mockResponse);

      // Then logout
      service.logout().subscribe();
      const logoutReq = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      logoutReq.flush({ message: 'Logged out successfully' });

      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUserValue()).toBeNull();
      expect(service.getToken()).toBeNull();
    });
  });

  describe('role checking', () => {
    it('should check user roles correctly', () => {
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        date_of_birth: '1990-01-01',
        gender: 'male',
        country_code: '+1',
        email_verified_at: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        role: 'admin'
      };

      // Set current user
      (service as any).currentUserSubject.next(mockUser);

      expect(service.hasRole('admin')).toBe(true);
      expect(service.hasRole('user')).toBe(false);
      expect(service.isAdmin()).toBe(true);
    });

    it('should check premium status correctly', () => {
      const mockUser = {
        id: 1,
        email: 'premium@example.com',
        first_name: 'Premium',
        last_name: 'User',
        date_of_birth: '1990-01-01',
        gender: 'male',
        country_code: '+1',
        email_verified_at: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        subscription: {
          status: 'active',
          plan_type: 'premium'
        }
      };

      // Set current user
      (service as any).currentUserSubject.next(mockUser);

      expect(service.isPremium()).toBe(true);
    });
  });
}); 