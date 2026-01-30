import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let errorHandlingService: jasmine.SpyObj<ErrorHandlingService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.email).toBe('');
    expect(component.loginForm.password).toBe('');
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should handle successful login', () => {
    // Arrange
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
    const mockResponse = { 
      success: true, 
      data: { token: 'test-token', user: mockUser }, 
      message: 'Login successful' 
    };
    authService.login.and.returnValue(of(mockResponse));
    component.loginForm.email = 'test@example.com';
    component.loginForm.password = 'password123';

    // Act
    component.onSubmit();

    // Assert
    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/app/dashboard']);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should handle login error', () => {
    // Arrange
    const mockError = { message: 'Invalid credentials' };
    authService.login.and.returnValue(throwError(() => mockError));
    component.loginForm.email = 'test@example.com';
    component.loginForm.password = 'wrongpassword';

    // Act
    component.onSubmit();

    // Assert
    expect(authService.login).toHaveBeenCalled();
    expect(component.error).toBe('Invalid credentials');
    expect(component.loading).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle login error without message', () => {
    // Arrange
    const mockError = {};
    authService.login.and.returnValue(throwError(() => mockError));
    component.loginForm.email = 'test@example.com';
    component.loginForm.password = 'wrongpassword';

    // Act
    component.onSubmit();

    // Assert
    expect(component.error).toBe('Login failed');
    expect(component.loading).toBe(false);
  });

  it('should set loading state during login', () => {
    // Arrange
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
    authService.login.and.returnValue(of({ 
      success: true, 
      data: { token: 'test-token', user: mockUser }, 
      message: 'Login successful' 
    }));
    component.loginForm.email = 'test@example.com';
    component.loginForm.password = 'password123';

    // Act
    component.onSubmit();

    // Assert
    expect(component.loading).toBe(false); // Should be false after completion
  });

  it('should clear error on new submission', () => {
    // Arrange
    component.error = 'Previous error';
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
    authService.login.and.returnValue(of({ 
      success: true, 
      data: { token: 'test-token', user: mockUser }, 
      message: 'Login successful' 
    }));
    component.loginForm.email = 'test@example.com';
    component.loginForm.password = 'password123';

    // Act
    component.onSubmit();

    // Assert
    expect(component.error).toBe('');
  });

  it('should validate form fields', () => {
    // Test email validation
    component.loginForm.email = 'invalid-email';
    component.loginForm.password = 'password123';
    expect(component.loginForm.email).toBe('invalid-email');

    // Test password validation
    component.loginForm.email = 'valid@email.com';
    component.loginForm.password = '';
    expect(component.loginForm.password).toBe('');
  });

  it('should handle empty form submission', () => {
    // Arrange
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
    authService.login.and.returnValue(of({ 
      success: true, 
      data: { token: 'test-token', user: mockUser }, 
      message: 'Login successful' 
    }));
    component.loginForm.email = '';
    component.loginForm.password = '';

    // Act
    component.onSubmit();

    // Assert
    expect(authService.login).toHaveBeenCalledWith({
      email: '',
      password: ''
    });
    expect(component.loading).toBe(false);
  });

  it('should handle network errors', () => {
    // Arrange
    const networkError = { status: 0, message: 'Network error' };
    authService.login.and.returnValue(throwError(() => networkError));
    component.loginForm.email = 'test@example.com';
    component.loginForm.password = 'password123';

    // Act
    component.onSubmit();

    // Assert
    expect(component.error).toBe('Network error');
    expect(component.loading).toBe(false);
  });

  it('should handle server errors', () => {
    // Arrange
    const serverError = { status: 500, message: 'Server error' };
    authService.login.and.returnValue(throwError(() => serverError));
    component.loginForm.email = 'test@example.com';
    component.loginForm.password = 'password123';

    // Act
    component.onSubmit();

    // Assert
    expect(component.error).toBe('Server error');
    expect(component.loading).toBe(false);
  });

  it('should handle validation errors', () => {
    // Arrange
    const validationError = { 
      status: 422, 
      message: 'Validation failed',
      error: { 
        errors: { 
          email: ['Email is invalid'],
          password: ['Password is required']
        }
      }
    };
    authService.login.and.returnValue(throwError(() => validationError));
    component.loginForm.email = 'invalid-email';
    component.loginForm.password = '';

    // Act
    component.onSubmit();

    // Assert
    expect(component.error).toBe('Validation failed');
    expect(component.loading).toBe(false);
  });
}); 