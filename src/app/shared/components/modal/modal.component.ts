import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() title?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() closeOnBackdrop: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() showCloseButton: boolean = true;
  @Input() backdropClass: string = 'bg-black bg-opacity-50';
  
  @Output() close = new EventEmitter<void>();
  @Output() backdropClick = new EventEmitter<void>();

  private escapeKeyHandler?: (event: KeyboardEvent) => void;

  ngOnInit(): void {
    this.setupEscapeKeyHandler();
  }

  ngOnDestroy(): void {
    this.removeEscapeKeyHandler();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget && this.closeOnBackdrop) {
      this.backdropClick.emit();
      this.closeModal();
    }
  }

  onCloseClick(): void {
    this.closeModal();
  }

  private closeModal(): void {
    this.close.emit();
  }

  private setupEscapeKeyHandler(): void {
    if (this.closeOnEscape) {
      this.escapeKeyHandler = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.isOpen) {
          this.closeModal();
        }
      };
      document.addEventListener('keydown', this.escapeKeyHandler);
    }
  }

  private removeEscapeKeyHandler(): void {
    if (this.escapeKeyHandler) {
      document.removeEventListener('keydown', this.escapeKeyHandler);
    }
  }

  getModalClasses(): string {
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4'
    };

    return `bg-white rounded-lg shadow-xl transform transition-all duration-300 ${sizeClasses[this.size]}`;
  }

  getBackdropClasses(): string {
    return `fixed inset-0 z-50 flex items-center justify-center p-4 ${this.backdropClass}`;
  }

  getContentClasses(): string {
    return this.isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95';
  }
} 