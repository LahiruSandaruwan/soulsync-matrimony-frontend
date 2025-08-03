import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, interval } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface Notification {
  id: number;
  user_id: number;
  type: 'match' | 'message' | 'like' | 'super_like' | 'profile_view' | 'system';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule, 
    LoadingSpinnerComponent
  ],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  notifications: Notification[] = [];
  currentUser: any = null;
  loading = true;
  error = '';
  success = '';
  
  // Filtering
  activeFilter = 'all';
  unreadCount = 0;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  hasMore = true;
  loadingMore = false;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadNotifications();
    this.setupRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private loadNotifications(): void {
    this.loading = true;
    this.error = '';

    this.notificationService.getNotifications(this.currentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.notifications = response.data.notifications;
          this.unreadCount = response.data.unread_count;
          this.totalPages = response.data.total_pages;
          this.hasMore = this.currentPage < this.totalPages;
          this.loading = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to load notifications';
          this.loading = false;
        }
      });
  }

  private setupRealTimeUpdates(): void {
    // Poll for new notifications every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkForNewNotifications();
      });
  }

  private checkForNewNotifications(): void {
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const newCount = response.data.unread_count;
          if (newCount > this.unreadCount) {
            this.unreadCount = newCount;
            this.loadNotifications(); // Reload to get new notifications
          }
        },
        error: (error: any) => {
          // Silently handle error for background polling
        }
      });
  }

  onFilterChange(filter: string): void {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.loadNotifications();
  }

  onLoadMore(): void {
    if (!this.hasMore || this.loadingMore) {
      return;
    }

    this.loadingMore = true;
    this.currentPage++;

    this.notificationService.getNotifications(this.currentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.notifications = [...this.notifications, ...response.data.notifications];
          this.totalPages = response.data.total_pages;
          this.hasMore = this.currentPage < this.totalPages;
          this.loadingMore = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to load more notifications';
          this.loadingMore = false;
          this.currentPage--; // Revert page number on error
        }
      });
  }

  onMarkAsRead(notification: Notification): void {
    if (notification.is_read) {
      return;
    }

    this.notificationService.markAsRead(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          notification.is_read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.success = 'Notification marked as read';
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to mark notification as read';
        }
      });
  }

  onMarkAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.forEach(notification => {
            notification.is_read = true;
          });
          this.unreadCount = 0;
          this.success = 'All notifications marked as read';
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to mark all notifications as read';
        }
      });
  }

  onDeleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          if (!notification.is_read) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
          this.success = 'Notification deleted';
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to delete notification';
        }
      });
  }

  onClearSuccess(): void {
    this.success = '';
  }

  onClearError(): void {
    this.error = '';
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'match': return '💕';
      case 'message': return '💬';
      case 'like': return '👍';
      case 'super_like': return '⭐';
      case 'profile_view': return '👁️';
      case 'system': return '🔔';
      default: return '📢';
    }
  }

  getNotificationClass(type: string): string {
    switch (type) {
      case 'match': return 'notification-match';
      case 'message': return 'notification-message';
      case 'like': return 'notification-like';
      case 'super_like': return 'notification-super-like';
      case 'profile_view': return 'notification-view';
      case 'system': return 'notification-system';
      default: return 'notification-default';
    }
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return notificationTime.toLocaleDateString();
    }
  }

  getFilterCount(filter: string): number {
    if (filter === 'all') {
      return this.notifications.length;
    } else if (filter === 'unread') {
      return this.unreadCount;
    } else {
      return this.notifications.filter(n => n.type === filter).length;
    }
  }

  onRefresh(): void {
    this.currentPage = 1;
    this.loadNotifications();
  }

  trackByNotificationId(index: number, notification: Notification): number {
    return notification.id;
  }
}
