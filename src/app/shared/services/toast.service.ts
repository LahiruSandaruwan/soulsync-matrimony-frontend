import { Injectable, ComponentRef, createComponent, ApplicationRef, Injector, Type } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastComponent, ToastConfig } from '../components/toast/toast.component';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastOptions {
  position?: ToastPosition;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastConfig[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private toastRefs = new Map<string, ComponentRef<ToastComponent>>();
  private containerRefs = new Map<ToastPosition, HTMLElement>();

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
    this.initializeContainers();
  }

  private initializeContainers(): void {
    const positions: ToastPosition[] = [
      'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
    ];

    positions.forEach(position => {
      this.createContainer(position);
    });
  }

  private createContainer(position: ToastPosition): void {
    const container = document.createElement('div');
    container.id = `toast-container-${position.replace('-', '-')}`;
    container.className = `toast-container ${this.getPositionClasses(position)}`;
    document.body.appendChild(container);
    this.containerRefs.set(position, container);
  }

  private getPositionClasses(position: ToastPosition): string {
    const baseClasses = 'fixed z-50 flex flex-col gap-2 p-4 pointer-events-none';
    
    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    return `${baseClasses} ${positionClasses[position]}`;
  }

  show(config: ToastConfig, options: ToastOptions = {}): string {
    const id = config.id || this.generateId();
    const position = options.position || 'top-right';
    
    const toastConfig: ToastConfig = {
      ...config,
      id,
      duration: options.duration ?? config.duration ?? 5000,
      dismissible: options.dismissible ?? config.dismissible ?? true,
      action: options.action ?? config.action
    };

    // Add to toasts array
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toastConfig]);

    // Create and show toast component
    this.createToastComponent(toastConfig, position);

    return id;
  }

  success(message: string, title?: string, options?: ToastOptions): string {
    return this.show({
      type: 'success',
      title,
      message
    }, options);
  }

  error(message: string, title?: string, options?: ToastOptions): string {
    return this.show({
      type: 'error',
      title,
      message
    }, options);
  }

  warning(message: string, title?: string, options?: ToastOptions): string {
    return this.show({
      type: 'warning',
      title,
      message
    }, options);
  }

  info(message: string, title?: string, options?: ToastOptions): string {
    return this.show({
      type: 'info',
      title,
      message
    }, options);
  }

  private createToastComponent(config: ToastConfig, position: ToastPosition): void {
    const container = this.containerRefs.get(position);
    if (!container) return;

    // Create component
    const componentRef = createComponent(ToastComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    // Set input
    componentRef.instance.config = config;

    // Subscribe to dismiss event
    componentRef.instance.dismissEvent.subscribe((id: string) => {
      this.dismiss(id);
    });

    // Add to container
    const toastElement = componentRef.location.nativeElement;
    toastElement.classList.add('pointer-events-auto');
    container.appendChild(toastElement);

    // Store reference
    this.toastRefs.set(config.id!, componentRef);

    // Attach to application
    this.appRef.attachView(componentRef.hostView);
  }

  dismiss(id: string): void {
    const componentRef = this.toastRefs.get(id);
    if (componentRef) {
      // Remove from DOM
      const element = componentRef.location.nativeElement;
      element.parentNode?.removeChild(element);

      // Detach from application
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();

      // Remove from refs
      this.toastRefs.delete(id);
    }

    // Remove from toasts array
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(updatedToasts);
  }

  dismissAll(): void {
    // Dismiss all toast components
    this.toastRefs.forEach((componentRef, id) => {
      const element = componentRef.location.nativeElement;
      element.parentNode?.removeChild(element);
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    });

    // Clear refs
    this.toastRefs.clear();

    // Clear toasts array
    this.toastsSubject.next([]);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods
  getToasts(): ToastConfig[] {
    return this.toastsSubject.value;
  }

  getToastCount(): number {
    return this.toastsSubject.value.length;
  }

  hasToasts(): boolean {
    return this.getToastCount() > 0;
  }
} 