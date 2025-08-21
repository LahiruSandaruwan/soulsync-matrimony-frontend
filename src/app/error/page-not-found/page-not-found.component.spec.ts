import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

import { PageNotFoundComponent } from './page-not-found.component';

describe('PageNotFoundComponent', () => {
  let component: PageNotFoundComponent;
  let fixture: ComponentFixture<PageNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule.forRoot([]),
        PageNotFoundComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Template', () => {
    it('should display 404 error message', () => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.textContent).toContain('Oops! Page Not Found');
      expect(compiled.textContent).toContain('💔');
    });

    it('should display helpful message', () => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.textContent).toContain('vanished into thin air');
      expect(compiled.textContent).toContain('soulmates sometimes take wrong turns');
    });

    it('should have proper accessibility attributes', () => {
      const compiled = fixture.debugElement.nativeElement;
      const mainElement = compiled.querySelector('[role="main"]');
      const errorTitle = compiled.querySelector('#error-title');
      const brokenHeartIcon = compiled.querySelector('[role="img"]');
      
      expect(mainElement).toBeTruthy();
      expect(errorTitle).toBeTruthy();
      expect(brokenHeartIcon).toBeTruthy();
      expect(brokenHeartIcon.getAttribute('aria-label')).toBe('Broken heart emoji');
    });

    it('should have action buttons with proper labels', () => {
      const compiled = fixture.debugElement.nativeElement;
      const homeButton = compiled.querySelector('[aria-label="Navigate to dashboard homepage"]');
      const backButton = compiled.querySelector('[aria-label="Go back to previous page"]');
      const reportButton = compiled.querySelector('[aria-label="Report this broken link to support team"]');
      
      expect(homeButton).toBeTruthy();
      expect(backButton).toBeTruthy();
      expect(reportButton).toBeTruthy();
    });
  });

  describe('goHome', () => {
    it('should navigate to dashboard', () => {
      spyOn(window.location, 'href', 'set');
      
      component.goHome();
      
      expect(window.location.href).toBe('/dashboard');
    });
  });

  describe('goBack', () => {
    it('should go back in history when history length > 1', () => {
      spyOn(window.history, 'back');
      Object.defineProperty(window.history, 'length', { value: 3, configurable: true });
      
      component.goBack();
      
      expect(window.history.back).toHaveBeenCalled();
    });

    it('should navigate to dashboard when history length <= 1', () => {
      spyOn(window.location, 'href', 'set');
      Object.defineProperty(window.history, 'length', { value: 1, configurable: true });
      
      component.goBack();
      
      expect(window.location.href).toBe('/dashboard');
    });
  });

  describe('reportBrokenLink', () => {
    it('should open mailto link with current URL', () => {
      spyOn(window, 'open');
      const currentUrl = window.location.href;
      
      component.reportBrokenLink();
      
      expect(window.open).toHaveBeenCalled();
      const mailtoCall = (window.open as jasmine.Spy).calls.mostRecent().args[0];
      expect(mailtoCall).toContain('mailto:support@soulsync.com');
      expect(mailtoCall).toContain('Broken Link Report');
      expect(mailtoCall).toContain(encodeURIComponent(currentUrl));
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile devices', () => {
      const compiled = fixture.debugElement.nativeElement;
      const container = compiled.querySelector('.max-w-md');
      
      expect(container).toBeTruthy();
      expect(container.classList.contains('w-full')).toBe(true);
    });
  });

  describe('Animation and Styling', () => {
    it('should have animated broken heart icon', () => {
      const compiled = fixture.debugElement.nativeElement;
      const icon = compiled.querySelector('.animate-bounce');
      
      expect(icon).toBeTruthy();
    });

    it('should have proper button styling classes', () => {
      const compiled = fixture.debugElement.nativeElement;
      const primaryButton = compiled.querySelector('.bg-gradient-to-r.from-pink-500');
      const secondaryButton = compiled.querySelector('.bg-white.border-gray-300');
      
      expect(primaryButton).toBeTruthy();
      expect(secondaryButton).toBeTruthy();
    });

    it('should have focus states for accessibility', () => {
      const compiled = fixture.debugElement.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      
      buttons.forEach((button: HTMLElement) => {
        expect(button.classList.contains('focus:outline-none')).toBe(true);
        expect(button.classList.contains('focus:ring-2')).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing window.history gracefully', () => {
      const originalHistory = window.history;
      (window as any).history = undefined;
      
      expect(() => component.goBack()).not.toThrow();
      
      window.history = originalHistory;
    });

    it('should handle mailto open failure gracefully', () => {
      spyOn(window, 'open').and.throwError('Cannot open mailto');
      
      expect(() => component.reportBrokenLink()).not.toThrow();
    });
  });
});
