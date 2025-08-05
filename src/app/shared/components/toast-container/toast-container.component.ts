import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { ToastComponent } from '../toast/toast.component';
import { ToastConfig } from '../toast/toast.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="toast-container-wrapper">
      <app-toast
        *ngFor="let toast of toasts"
        [config]="toast"
        (dismissEvent)="onToastDismiss($event)"
      ></app-toast>
    </div>
  `,
  styles: [`
    .toast-container-wrapper {
      @apply fixed top-4 right-4 z-50 space-y-2 max-w-sm;
    }
    
    /* Mobile responsive */
    @media (max-width: 640px) {
      .toast-container-wrapper {
        @apply top-2 right-2 left-2 max-w-none;
      }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .toast-container-wrapper {
        @apply text-white;
      }
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  toasts: ToastConfig[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(toasts => {
        this.toasts = toasts;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToastDismiss(toastId: string): void {
    this.toastService.dismiss(toastId);
  }
} 