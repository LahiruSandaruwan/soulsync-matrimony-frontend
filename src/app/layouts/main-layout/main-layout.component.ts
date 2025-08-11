import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
import { WebSocketService } from '../../core/services/websocket.service';
import { ToastService } from '../../core/services/toast.service';
import { Subject, takeUntil } from 'rxjs';

export class MainLayoutComponent implements OnInit, OnDestroy {
  isSidebarOpen = true;
  private destroy$ = new Subject<void>();

  constructor(private ws: WebSocketService, private toast: ToastService) {}
  
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  ngOnInit(): void {
    this.ws.notification$.pipe(takeUntil(this.destroy$)).subscribe(n => {
      const title = n?.title || 'New Notification';
      this.toast.info(n?.message || 'You have a new notification', title);
    });
    this.ws.matchNotification$.pipe(takeUntil(this.destroy$)).subscribe(m => {
      this.toast.success('It\'s a match! 💕', `Match ${m.match_percentage || 0}%`);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
} 