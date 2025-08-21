import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
}

export interface AccessibilityError {
  element: HTMLElement;
  type: 'missing-alt' | 'missing-label' | 'insufficient-contrast' | 'missing-focus' | 'invalid-markup';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private preferencesSubject = new BehaviorSubject<AccessibilityPreferences>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderMode: false,
    keyboardNavigation: true,
    focusVisible: true
  });

  public preferences$ = this.preferencesSubject.asObservable();

  constructor() {
    this.initializeAccessibilityFeatures();
    this.loadUserPreferences();
  }

  /**
   * Initialize accessibility features
   */
  private initializeAccessibilityFeatures(): void {
    this.detectUserPreferences();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupAnnouncements();
  }

  /**
   * Detect user accessibility preferences from system
   */
  private detectUserPreferences(): void {
    if (typeof window === 'undefined') return;

    const preferences: Partial<AccessibilityPreferences> = {};

    // Detect reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      preferences.reducedMotion = true;
    }

    // Detect high contrast preference
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      preferences.highContrast = true;
    }

    this.updatePreferences(preferences);
  }

  /**
   * Setup keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      // Tab key navigation
      if (event.key === 'Tab') {
        this.handleTabNavigation(event);
      }
      
      // Escape key to close modals/dropdowns
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      }
      
      // Enter and Space for activation
      if (event.key === 'Enter' || event.key === ' ') {
        this.handleActivationKeys(event);
      }
    });

    // Show focus indicators when using keyboard
    document.addEventListener('keydown', () => {
      document.body.classList.add('keyboard-navigation');
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  /**
   * Setup focus management
   */
  private setupFocusManagement(): void {
    // Track focus for screen readers
    let lastFocusedElement: HTMLElement | null = null;

    document.addEventListener('focusin', (event) => {
      lastFocusedElement = event.target as HTMLElement;
      this.announceFocusChange(lastFocusedElement);
    });

    // Store last focused element for modal management
    (window as any).__lastFocusedElement = () => lastFocusedElement;
  }

  /**
   * Setup ARIA live announcements
   */
  private setupAnnouncements(): void {
    // Create announcement region if it doesn't exist
    if (!document.getElementById('aria-announcements')) {
      const announcements = document.createElement('div');
      announcements.id = 'aria-announcements';
      announcements.setAttribute('aria-live', 'polite');
      announcements.setAttribute('aria-atomic', 'true');
      announcements.className = 'sr-only';
      document.body.appendChild(announcements);
    }
  }

  /**
   * Handle tab navigation
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (event.shiftKey) {
      // Shift+Tab (previous)
      if (currentIndex <= 0) {
        event.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
      }
    } else {
      // Tab (next)
      if (currentIndex >= focusableElements.length - 1) {
        event.preventDefault();
        focusableElements[0]?.focus();
      }
    }
  }

  /**
   * Handle escape key
   */
  private handleEscapeKey(): void {
    // Close any open modals or dropdowns
    const modals = document.querySelectorAll('[role="dialog"][aria-hidden="false"]');
    modals.forEach(modal => {
      const closeButton = modal.querySelector('[aria-label*="close"], [data-dismiss]');
      if (closeButton) {
        (closeButton as HTMLElement).click();
      }
    });
  }

  /**
   * Handle activation keys
   */
  private handleActivationKeys(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Handle custom interactive elements
    if (target.getAttribute('role') === 'button' || 
        target.classList.contains('clickable') ||
        target.hasAttribute('data-clickable')) {
      event.preventDefault();
      target.click();
    }
  }

  /**
   * Get all focusable elements
   */
  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ].join(', ');

    return Array.from(document.querySelectorAll(selector))
      .filter(el => this.isVisible(el)) as HTMLElement[];
  }

  /**
   * Check if element is visible
   */
  private isVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  /**
   * Announce focus change to screen readers
   */
  private announceFocusChange(element: HTMLElement): void {
    const preferences = this.preferencesSubject.value;
    if (!preferences.screenReaderMode) return;

    const announcement = this.generateFocusAnnouncement(element);
    if (announcement) {
      this.announce(announcement);
    }
  }

  /**
   * Generate focus announcement
   */
  private generateFocusAnnouncement(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const label = element.getAttribute('aria-label') || 
                  element.getAttribute('aria-labelledby') ||
                  element.textContent?.trim();

    if (tagName === 'button') {
      return `Button: ${label}`;
    } else if (tagName === 'a') {
      return `Link: ${label}`;
    } else if (tagName === 'input') {
      const type = element.getAttribute('type');
      return `${type} input: ${label}`;
    } else if (role) {
      return `${role}: ${label}`;
    }

    return label || '';
  }

  /**
   * Update accessibility preferences
   */
  updatePreferences(newPreferences: Partial<AccessibilityPreferences>): void {
    const current = this.preferencesSubject.value;
    const updated = { ...current, ...newPreferences };
    
    this.preferencesSubject.next(updated);
    this.applyPreferences(updated);
    this.saveUserPreferences(updated);
  }

  /**
   * Apply preferences to the DOM
   */
  private applyPreferences(preferences: AccessibilityPreferences): void {
    const body = document.body;

    body.classList.toggle('high-contrast', preferences.highContrast);
    body.classList.toggle('large-text', preferences.largeText);
    body.classList.toggle('reduced-motion', preferences.reducedMotion);
    body.classList.toggle('screen-reader-mode', preferences.screenReaderMode);
    body.classList.toggle('focus-visible', preferences.focusVisible);

    // Apply CSS custom properties
    document.documentElement.style.setProperty(
      '--motion-duration', 
      preferences.reducedMotion ? '0ms' : '300ms'
    );
  }

  /**
   * Save user preferences to localStorage
   */
  private saveUserPreferences(preferences: AccessibilityPreferences): void {
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save accessibility preferences:', error);
    }
  }

  /**
   * Load user preferences from localStorage
   */
  private loadUserPreferences(): void {
    try {
      const saved = localStorage.getItem('accessibility-preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.updatePreferences(preferences);
      }
    } catch (error) {
      console.warn('Failed to load accessibility preferences:', error);
    }
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcements = document.getElementById('aria-announcements');
    if (announcements) {
      announcements.setAttribute('aria-live', priority);
      announcements.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        announcements.textContent = '';
      }, 1000);
    }
  }

  /**
   * Focus first error in form
   */
  focusFirstError(container: HTMLElement = document.body): void {
    const errorElement = container.querySelector('[aria-invalid="true"], .error, .has-error');
    if (errorElement) {
      (errorElement as HTMLElement).focus();
      this.announce('Please correct the errors in the form');
    }
  }

  /**
   * Skip to main content
   */
  skipToMain(): void {
    const main = document.querySelector('main, [role="main"], #main-content');
    if (main) {
      (main as HTMLElement).focus();
      this.announce('Skipped to main content');
    }
  }

  /**
   * Trap focus within container
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }

  /**
   * Audit page for accessibility issues
   */
  auditPage(): AccessibilityError[] {
    const errors: AccessibilityError[] = [];

    // Check for missing alt text on images
    document.querySelectorAll('img:not([alt])').forEach(img => {
      errors.push({
        element: img as HTMLElement,
        type: 'missing-alt',
        severity: 'error',
        message: 'Image missing alt text',
        suggestion: 'Add descriptive alt text or alt="" for decorative images'
      });
    });

    // Check for missing labels on inputs
    document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
      const associatedLabel = document.querySelector(`label[for="${input.id}"]`);
      if (!associatedLabel) {
        errors.push({
          element: input as HTMLElement,
          type: 'missing-label',
          severity: 'error',
          message: 'Form input missing label',
          suggestion: 'Add a label element or aria-label attribute'
        });
      }
    });

    // Check for missing focus indicators
    document.querySelectorAll('button, a, input, select, textarea').forEach(element => {
      const style = window.getComputedStyle(element, ':focus');
      if (!style.outline && !style.boxShadow && !style.border) {
        errors.push({
          element: element as HTMLElement,
          type: 'missing-focus',
          severity: 'warning',
          message: 'Focusable element missing focus indicator',
          suggestion: 'Add visible focus styles with outline or box-shadow'
        });
      }
    });

    return errors;
  }

  /**
   * Get current accessibility preferences
   */
  getPreferences(): AccessibilityPreferences {
    return this.preferencesSubject.value;
  }

  /**
   * Reset preferences to defaults
   */
  resetPreferences(): void {
    const defaults: AccessibilityPreferences = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReaderMode: false,
      keyboardNavigation: true,
      focusVisible: true
    };
    
    this.updatePreferences(defaults);
  }
}
