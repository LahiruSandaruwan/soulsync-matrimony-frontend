import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  buffer: number;
  threshold: number;
}

@Component({
  selector: 'app-virtual-scroll',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      #scrollContainer
      class="virtual-scroll-container"
      [style.height.px]="config.containerHeight"
      (scroll)="onScroll($event)"
    >
      <div 
        class="virtual-scroll-spacer-before"
        [style.height.px]="offsetY"
      ></div>
      
      <div class="virtual-scroll-content">
        <ng-content></ng-content>
      </div>
      
      <div 
        class="virtual-scroll-spacer-after"
        [style.height.px]="totalHeight - offsetY - visibleHeight"
      ></div>
    </div>
  `,
  styles: [`
    .virtual-scroll-container {
      overflow-y: auto;
      position: relative;
    }
    
    .virtual-scroll-content {
      position: relative;
    }
    
    .virtual-scroll-spacer-before,
    .virtual-scroll-spacer-after {
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualScrollComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() items: any[] = [];
  @Input() config: VirtualScrollConfig = {
    itemHeight: 100,
    containerHeight: 400,
    buffer: 5,
    threshold: 0.8
  };

  @Output() scrollEnd = new EventEmitter<void>();
  @Output() visibleItemsChange = new EventEmitter<{ start: number; end: number; items: any[] }>();

  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef<HTMLDivElement>;

  private destroy$ = new Subject<void>();
  private scrollSubject = new Subject<Event>();
  
  startIndex = 0;
  endIndex = 0;
  offsetY = 0;
  visibleHeight = 0;
  totalHeight = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setupScrollListener();
    this.calculateVisibleItems();
  }

  ngAfterViewInit(): void {
    this.updateDimensions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupScrollListener(): void {
    this.scrollSubject
      .pipe(
        debounceTime(16), // ~60fps
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.calculateVisibleItems();
        this.checkScrollEnd();
      });
  }

  onScroll(event: Event): void {
    this.scrollSubject.next(event);
  }

  private calculateVisibleItems(): void {
    if (!this.scrollContainer) return;

    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    const containerHeight = this.config.containerHeight;
    const itemHeight = this.config.itemHeight;
    const buffer = this.config.buffer;

    // Calculate visible range with buffer
    this.startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    this.endIndex = Math.min(
      this.items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
    );

    // Calculate offset and dimensions
    this.offsetY = this.startIndex * itemHeight;
    this.visibleHeight = (this.endIndex - this.startIndex) * itemHeight;
    this.totalHeight = this.items.length * itemHeight;

    // Emit visible items
    const visibleItems = this.items.slice(this.startIndex, this.endIndex);
    this.visibleItemsChange.emit({
      start: this.startIndex,
      end: this.endIndex,
      items: visibleItems
    });

    this.cdr.detectChanges();
  }

  private checkScrollEnd(): void {
    if (!this.scrollContainer) return;

    const element = this.scrollContainer.nativeElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage >= this.config.threshold) {
      this.scrollEnd.emit();
    }
  }

  private updateDimensions(): void {
    if (this.scrollContainer) {
      const element = this.scrollContainer.nativeElement;
      this.config.containerHeight = element.clientHeight;
      this.calculateVisibleItems();
    }
  }

  /**
   * Scroll to specific item index
   */
  scrollToIndex(index: number): void {
    if (!this.scrollContainer || index < 0 || index >= this.items.length) return;

    const scrollTop = index * this.config.itemHeight;
    this.scrollContainer.nativeElement.scrollTop = scrollTop;
  }

  /**
   * Scroll to top
   */
  scrollToTop(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = 0;
    }
  }

  /**
   * Get current scroll position as percentage
   */
  getScrollPercentage(): number {
    if (!this.scrollContainer) return 0;

    const element = this.scrollContainer.nativeElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    return Math.min(100, (scrollTop / (scrollHeight - clientHeight)) * 100);
  }

  /**
   * Update items and recalculate
   */
  updateItems(newItems: any[]): void {
    this.items = newItems;
    this.calculateVisibleItems();
  }

  /**
   * Reset scroll position
   */
  reset(): void {
    this.scrollToTop();
    this.startIndex = 0;
    this.endIndex = 0;
    this.offsetY = 0;
    this.calculateVisibleItems();
  }
}
