import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

import { UnauthorizedComponent } from './unauthorized.component';
import { AuthService } from '../../core/services/auth.service';

describe('UnauthorizedComponent', () => {
  let component: UnauthorizedComponent;
  let fixture: ComponentFixture<UnauthorizedComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser = {
    id: 1,
    email: 'test@soulsync.com',
    first_name: 'John',
    last_name: 'Doe'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: of(mockUser)
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule.forRoot([]),
        UnauthorizedComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnauthorizedComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.userEmail).toBe('');
    expect(component.isLoggedIn).toBe(false);
  });

  describe('ngOnInit', () => {
    it('should set user data when user is logged in', () => {
      component.ngOnInit();

      expect(component.isLoggedIn).toBe(true);
      expect(component.userEmail).toBe('test@soulsync.com');
    });

    it('should handle null user', () => {
      authService.currentUser$ = of(null);
      
      component.ngOnInit();

      expect(component.isLoggedIn).toBe(false);
      expect(component.userEmail).toBe('');
    });
  });

  describe('goBack', () => {
    it('should go back in history when history length > 1', () => {
      spyOn(window.history, 'back');
      Object.defineProperty(window.history, 'length', { value: 3, configurable: true });
      
      component.goBack();
      
      expect(window.history.back).toHaveBeenCalled();
    });

    it('should call goHome when history length <= 1', () => {
      spyOn(component, 'goHome');
      Object.defineProperty(window.history, 'length', { value: 1, configurable: true });
      
      component.goBack();
      
      expect(component.goHome).toHaveBeenCalled();
    });
  });

  describe('goHome', () => {
    it('should navigate to dashboard when user is logged in', () => {
      component.isLoggedIn = true;
      
      component.goHome();
      
      expect(router.navigate).toHaveBeenCalledWith(['/app/dashboard']);
    });

    it('should navigate to login when user is not logged in', () => {
      component.isLoggedIn = false;
      
      component.goHome();
      
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('logout', () => {
    it('should logout and redirect to login on success', () => {
      authService.logout.and.returnValue(of({}));
      
      component.logout();
      
      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should redirect to login even on logout error', () => {
      authService.logout.and.returnValue(throwError('Logout error'));
      
      component.logout();
      
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('contactSupport', () => {
    it('should open mailto link with user details', () => {
      spyOn(window, 'open');
      component.userEmail = 'test@soulsync.com';
      
      component.contactSupport();
      
      expect(window.open).toHaveBeenCalled();
      const mailtoCall = (window.open as jasmine.Spy).calls.mostRecent().args[0];
      expect(mailtoCall).toContain('mailto:support@soulsync.com');
      expect(mailtoCall).toContain('Access Request');
      expect(mailtoCall).toContain('test@soulsync.com');
    });
  });

  describe('requestAdminAccess', () => {
    it('should open mailto link for admin access request', () => {
      spyOn(window, 'open');
      component.userEmail = 'test@soulsync.com';
      
      component.requestAdminAccess();
      
      expect(window.open).toHaveBeenCalled();
      const mailtoCall = (window.open as jasmine.Spy).calls.mostRecent().args[0];
      expect(mailtoCall).toContain('mailto:admin@soulsync.com');
      expect(mailtoCall).toContain('Admin Access Request');
      expect(mailtoCall).toContain('test@soulsync.com');
    });
  });

  describe('Template - Logged In User', () => {
    beforeEach(() => {
      component.isLoggedIn = true;
      component.userEmail = 'test@soulsync.com';
      fixture.detectChanges();
    });

    it('should display user-specific error message', () => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.textContent).toContain('test@soulsync.com');
      expect(compiled.textContent).toContain('you don\'t have permission');
    });

    it('should show logout button for logged in users', () => {
      const compiled = fixture.debugElement.nativeElement;
      const logoutButton = compiled.querySelector('[aria-label="Logout and return to login page"]');
      expect(logoutButton).toBeTruthy();
    });

    it('should show request admin access button', () => {
      const compiled = fixture.debugElement.nativeElement;
      const adminButton = compiled.querySelector('[aria-label="Request admin access from administrators"]');
      expect(adminButton).toBeTruthy();
    });

    it('should show "Go to Dashboard" button', () => {
      const compiled = fixture.debugElement.nativeElement;
      const dashboardButton = compiled.querySelector('[aria-label="Navigate to dashboard"]');
      expect(dashboardButton).toBeTruthy();
      expect(dashboardButton.textContent).toContain('Go to Dashboard');
    });
  });

  describe('Template - Not Logged In User', () => {
    beforeEach(() => {
      component.isLoggedIn = false;
      component.userEmail = '';
      fixture.detectChanges();
    });

    it('should display login prompt message', () => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.textContent).toContain('need to be logged in');
      expect(compiled.textContent).toContain('sign in to continue');
    });

    it('should show "Sign In" button', () => {
      const compiled = fixture.debugElement.nativeElement;
      const signInButton = compiled.querySelector('[aria-label="Navigate to login page"]');
      expect(signInButton).toBeTruthy();
      expect(signInButton.textContent).toContain('Sign In');
    });

    it('should not show logout button', () => {
      const compiled = fixture.debugElement.nativeElement;
      const logoutButton = compiled.querySelector('[aria-label="Logout and return to login page"]');
      expect(logoutButton).toBeFalsy();
    });

    it('should not show admin access request button', () => {
      const compiled = fixture.debugElement.nativeElement;
      const adminButton = compiled.querySelector('[aria-label="Request admin access from administrators"]');
      expect(adminButton).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA attributes', () => {
      const compiled = fixture.debugElement.nativeElement;
      const mainElement = compiled.querySelector('[role="main"]');
      const lockIcon = compiled.querySelector('[role="img"]');
      
      expect(mainElement).toBeTruthy();
      expect(lockIcon).toBeTruthy();
      expect(lockIcon.getAttribute('aria-label')).toBe('Access denied icon');
    });

    it('should have proper heading structure', () => {
      const compiled = fixture.debugElement.nativeElement;
      const h1 = compiled.querySelector('h1');
      const h2 = compiled.querySelector('h2');
      
      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(h1.textContent).toContain('Access Denied');
    });

    it('should have focus management for buttons', () => {
      const compiled = fixture.debugElement.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      
      buttons.forEach((button: HTMLElement) => {
        expect(button.classList.contains('focus:outline-none')).toBe(true);
        expect(button.classList.contains('focus:ring-2')).toBe(true);
      });
    });
  });

  describe('Animations and Styling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have animated lock icon', () => {
      const compiled = fixture.debugElement.nativeElement;
      const icon = compiled.querySelector('.animate-pulse');
      expect(icon).toBeTruthy();
    });

    it('should have gradient background', () => {
      const compiled = fixture.debugElement.nativeElement;
      const background = compiled.querySelector('.bg-gradient-to-br');
      expect(background).toBeTruthy();
    });

    it('should have informational section with proper styling', () => {
      const compiled = fixture.debugElement.nativeElement;
      const infoSection = compiled.querySelector('.bg-blue-50');
      expect(infoSection).toBeTruthy();
    });
  });
});
