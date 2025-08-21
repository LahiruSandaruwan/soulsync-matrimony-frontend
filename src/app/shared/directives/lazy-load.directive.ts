import { 
  Directive, 
  ElementRef, 
  EventEmitter, 
  OnDestroy, 
  OnInit, 
  Output,
  Input
} from '@angular/core';

/**
 * Lazy loading directive using Intersection Observer API
 * Usage: <img [src]="placeholder" [lazySrc]="actualSrc" (lazyLoad)="onLoad()" lazyLoad>
 */
@Directive({
  selector: '[lazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() lazySrc: string = '';
  @Input() lazyPlaceholder: string = '/assets/images/placeholder.svg';
  @Input() lazyThreshold: number = 0.1;
  @Input() lazyRootMargin: string = '50px';
  
  @Output() lazyLoad = new EventEmitter<void>();
  @Output() lazyError = new EventEmitter<Event>();

  private observer?: IntersectionObserver;
  private hasLoaded = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.loadImage();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasLoaded) {
            this.loadImage();
          }
        });
      },
      {
        threshold: this.lazyThreshold,
        rootMargin: this.lazyRootMargin
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    if (this.hasLoaded || !this.lazySrc) return;

    const element = this.el.nativeElement;
    
    if (element.tagName.toLowerCase() === 'img') {
      const img = element as HTMLImageElement;
      
      // Set placeholder first
      if (this.lazyPlaceholder && !img.src) {
        img.src = this.lazyPlaceholder;
      }

      // Create a new image to preload the actual source
      const imageLoader = new Image();
      
      imageLoader.onload = () => {
        img.src = this.lazySrc;
        img.classList.add('lazy-loaded');
        this.hasLoaded = true;
        this.lazyLoad.emit();
        this.cleanup();
      };

      imageLoader.onerror = (event) => {
        img.classList.add('lazy-error');
        this.lazyError.emit(event);
        this.cleanup();
      };

      imageLoader.src = this.lazySrc;
    } else {
      // For background images or other elements
      element.style.backgroundImage = `url(${this.lazySrc})`;
      element.classList.add('lazy-loaded');
      this.hasLoaded = true;
      this.lazyLoad.emit();
      this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }
}

/**
 * Performance optimization for image loading
 */
export interface LazyLoadConfig {
  threshold?: number;
  rootMargin?: string;
  placeholder?: string;
  enableBlur?: boolean;
  fadeInDuration?: number;
}
