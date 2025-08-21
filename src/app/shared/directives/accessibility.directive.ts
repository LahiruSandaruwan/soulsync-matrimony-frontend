import { 
  Directive, 
  ElementRef, 
  Input, 
  OnInit, 
  OnDestroy,
  HostListener,
  Renderer2 
} from '@angular/core';

/**
 * Auto-focus directive for accessibility
 * Usage: <input autoFocus>
 */
@Directive({
  selector: '[autoFocus]',
  standalone: true
})
export class AutoFocusDirective implements OnInit {
  @Input() autoFocusDelay: number = 0;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.elementRef.nativeElement.focus();
    }, this.autoFocusDelay);
  }
}

/**
 * Skip link directive for accessibility
 * Usage: <a skipLink href="#main">Skip to main content</a>
 */
@Directive({
  selector: '[skipLink]',
  standalone: true
})
export class SkipLinkDirective implements OnInit {
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Add skip link styles
    this.renderer.addClass(this.elementRef.nativeElement, 'skip-link');
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.preventDefault();
    const href = this.elementRef.nativeElement.getAttribute('href');
    if (href && href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        (target as HTMLElement).focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}

/**
 * Accessible modal directive
 * Usage: <div accessibleModal>
 */
@Directive({
  selector: '[accessibleModal]',
  standalone: true
})
export class AccessibleModalDirective implements OnInit, OnDestroy {
  @Input() modalTitle: string = '';
  @Input() closeOnEscape: boolean = true;
  @Input() trapFocus: boolean = true;

  private originalActiveElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];
  private keydownHandler?: (event: KeyboardEvent) => void;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupModal();
    this.setupFocusTrap();
    this.setupKeyboardHandlers();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private setupModal(): void {
    const element = this.elementRef.nativeElement;
    
    // Set ARIA attributes
    this.renderer.setAttribute(element, 'role', 'dialog');
    this.renderer.setAttribute(element, 'aria-modal', 'true');
    
    if (this.modalTitle) {
      this.renderer.setAttribute(element, 'aria-label', this.modalTitle);
    }

    // Store currently focused element
    this.originalActiveElement = document.activeElement as HTMLElement;
  }

  private setupFocusTrap(): void {
    if (!this.trapFocus) return;

    const element = this.elementRef.nativeElement;
    this.focusableElements = this.getFocusableElements(element);
    
    // Focus first focusable element
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
  }

  private setupKeyboardHandlers(): void {
    this.keydownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.closeOnEscape) {
        this.closeModal();
      } else if (event.key === 'Tab' && this.trapFocus) {
        this.handleTabKey(event);
      }
    };

    document.addEventListener('keydown', this.keydownHandler);
  }

  private handleTabKey(event: KeyboardEvent): void {
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

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

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  }

  private closeModal(): void {
    // Emit close event or call close method
    const closeEvent = new CustomEvent('modalClose');
    this.elementRef.nativeElement.dispatchEvent(closeEvent);
  }

  private cleanup(): void {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }

    // Restore focus to original element
    if (this.originalActiveElement) {
      this.originalActiveElement.focus();
    }
  }
}

/**
 * Accessible dropdown directive
 * Usage: <div accessibleDropdown>
 */
@Directive({
  selector: '[accessibleDropdown]',
  standalone: true
})
export class AccessibleDropdownDirective implements OnInit {
  @Input() dropdownId: string = '';
  
  private isOpen = false;
  private triggerElement?: HTMLElement;
  private menuElement?: HTMLElement;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupDropdown();
  }

  private setupDropdown(): void {
    const container = this.elementRef.nativeElement;
    this.triggerElement = container.querySelector('[aria-haspopup]');
    this.menuElement = container.querySelector('[role="menu"], [role="listbox"]');

    if (this.triggerElement && this.menuElement) {
      // Set up ARIA relationship
      const menuId = this.dropdownId || `dropdown-${Math.random().toString(36).substr(2, 9)}`;
      this.renderer.setAttribute(this.menuElement, 'id', menuId);
      this.renderer.setAttribute(this.triggerElement, 'aria-controls', menuId);
      
      // Set initial state
      this.updateMenuState(false);
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    if (this.triggerElement && this.triggerElement.contains(target)) {
      this.toggleMenu();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        this.closeMenu();
        this.triggerElement?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem();
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstItem();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastItem();
        break;
    }
  }

  private toggleMenu(): void {
    this.isOpen = !this.isOpen;
    this.updateMenuState(this.isOpen);
    
    if (this.isOpen) {
      this.focusFirstItem();
    }
  }

  private closeMenu(): void {
    this.isOpen = false;
    this.updateMenuState(false);
  }

  private updateMenuState(isOpen: boolean): void {
    if (this.triggerElement && this.menuElement) {
      this.renderer.setAttribute(this.triggerElement, 'aria-expanded', isOpen.toString());
      this.renderer.setStyle(this.menuElement, 'display', isOpen ? 'block' : 'none');
    }
  }

  private getMenuItems(): HTMLElement[] {
    if (!this.menuElement) return [];
    return Array.from(this.menuElement.querySelectorAll('[role="menuitem"], [role="option"]'));
  }

  private focusFirstItem(): void {
    const items = this.getMenuItems();
    if (items.length > 0) {
      items[0].focus();
    }
  }

  private focusLastItem(): void {
    const items = this.getMenuItems();
    if (items.length > 0) {
      items[items.length - 1].focus();
    }
  }

  private focusNextItem(): void {
    const items = this.getMenuItems();
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % items.length;
    items[nextIndex]?.focus();
  }

  private focusPreviousItem(): void {
    const items = this.getMenuItems();
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
    items[prevIndex]?.focus();
  }
}
