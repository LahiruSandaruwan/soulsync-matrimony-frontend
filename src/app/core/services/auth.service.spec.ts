import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send POST request to login endpoint', () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const mockResponse = { token: 'test-token', user: { id: 1, email: 'test@example.com' } };

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
      const registerData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        date_of_birth: '1990-01-01',
        gender: 'male'
      };
      const mockResponse = { message: 'User registered successfully' };

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
      const mockResponse = { token: 'new-token' };

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
      const email = 'test@example.com';
      const mockResponse = { message: 'Password reset email sent' };

      service.forgotPassword(email).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email });
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
      const mockResponse = { message: 'Two-factor authentication enabled' };

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
      const password = 'password123';
      const mockResponse = { message: 'Account deleted successfully' };

      service.deleteAccount(password).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/account`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({ password });
      req.flush(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('should send GET request to get current user endpoint', () => {
      const mockResponse = { id: 1, email: 'test@example.com', name: 'Test User' };

      service.getCurrentUser().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/user`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateProfile', () => {
    it('should send PUT request to update profile endpoint', () => {
      const profileData = {
        first_name: 'John',
        last_name: 'Doe',
        about_me: 'Test description'
      };
      const mockResponse = { message: 'Profile updated successfully' };

      service.updateProfile(profileData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(profileData);
      req.flush(mockResponse);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      spyOn(localStorage, 'getItem').and.returnValue('test-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue('test-token');
      expect(service.getToken()).toBe('test-token');
    });
  });

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      spyOn(localStorage, 'setItem');
      service.setToken('new-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
    });
  });

  describe('removeToken', () => {
    it('should remove token from localStorage', () => {
      spyOn(localStorage, 'removeItem');
      service.removeToken();
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('getAuthHeaders', () => {
    it('should return headers with authorization token', () => {
      spyOn(localStorage, 'getItem').and.returnValue('test-token');
      const headers = service.getAuthHeaders();
      expect(headers.get('Authorization')).toBe('Bearer test-token');
    });
  });

  describe('handleError', () => {
    it('should handle HTTP errors', () => {
      const errorResponse = { status: 401, message: 'Unauthorized' };
      
      service.login({ email: 'test@example.com', password: 'wrong' }).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
    });
  });
}); 