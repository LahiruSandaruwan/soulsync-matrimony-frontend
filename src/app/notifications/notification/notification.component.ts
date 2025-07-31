import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-romantic text-gradient mb-2">🔔 Notifications</h1>
          <p class="text-gray-600">Stay updated with your matches and activities</p>
        </div>

        <!-- Notification Filters -->
        <div class="card mb-6">
          <div class="flex flex-wrap items-center gap-4">
            <button 
              *ngFor="let filter of filters" 
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [class.bg-primary-600]="activeFilter === filter.value"
              [class.text-white]="activeFilter === filter.value"
              [class.bg-gray-100]="activeFilter !== filter.value"
              [class.text-gray-700]="activeFilter !== filter.value"
              (click)="setFilter(filter.value)"
            >
              {{ filter.icon }} {{ filter.label }}
            </button>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="space-y-4">
          <div 
            *ngFor="let notification of filteredNotifications" 
            class="card hover:shadow-romantic transition-all duration-200 cursor-pointer"
            [class.opacity-60]="notification.isRead"
            (click)="markAsRead(notification.id)"
          >
            <div class="flex items-start space-x-4">
              <!-- Notification Icon -->
              <div class="flex-shrink-0">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  [class.bg-primary-100]="notification.type === 'match'"
                  [class.bg-rose-100]="notification.type === 'like'"
                  [class.bg-lavender-100]="notification.type === 'message'"
                  [class.bg-gold-100]="notification.type === 'system'"
                >
                  {{ getNotificationIcon(notification.type) }}
                </div>
              </div>

              <!-- Notification Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="text-lg font-medium text-gray-900">{{ notification.title }}</h3>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500">{{ notification.time }}</span>
                    <div 
                      *ngIf="!notification.isRead" 
                      class="w-2 h-2 bg-primary-600 rounded-full"
                    ></div>
                  </div>
                </div>
                
                <p class="text-gray-600 mb-3">{{ notification.message }}</p>

                <!-- Action Buttons -->
                <div class="flex space-x-2">
                  <button 
                    *ngIf="notification.actionUrl"
                    class="btn-primary text-sm"
                    [routerLink]="notification.actionUrl"
                  >
                    {{ notification.actionText }}
                  </button>
                  <button 
                    class="btn-outline text-sm"
                    (click)="dismissNotification(notification.id, $event)"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredNotifications.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">🔔</div>
          <h3 class="text-xl font-romantic text-gradient mb-2">No notifications</h3>
          <p class="text-gray-600 mb-4">
            {{ activeFilter === 'all' ? 'You\'re all caught up!' : 'No ' + activeFilter + ' notifications' }}
          </p>
          <button 
            *ngIf="activeFilter !== 'all'"
            class="btn-primary"
            (click)="setFilter('all')"
          >
            View All Notifications
          </button>
        </div>

        <!-- Load More -->
        <div *ngIf="hasMoreNotifications" class="text-center mt-8">
          <button 
            (click)="loadMoreNotifications()" 
            class="btn-primary"
            [disabled]="isLoadingMore"
          >
            <span *ngIf="isLoadingMore" class="loading-spinner mr-2"></span>
            {{ isLoadingMore ? 'Loading...' : '📱 Load More' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];
  filteredNotifications: any[] = [];
  activeFilter = 'all';
  isLoadingMore = false;
  hasMoreNotifications = true;

  filters = [
    { value: 'all', label: 'All', icon: '🔔' },
    { value: 'match', label: 'Matches', icon: '💕' },
    { value: 'like', label: 'Likes', icon: '❤️' },
    { value: 'message', label: 'Messages', icon: '💬' },
    { value: 'system', label: 'System', icon: '⚙️' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    // TODO: Implement API call to load notifications
    this.notifications = [
      {
        id: 1,
        type: 'match',
        title: 'New Match! 💕',
        message: 'You and Priya Sharma are a 85% match! Start a conversation to get to know each other better.',
        time: '2 minutes ago',
        isRead: false,
        actionUrl: '/chat/1',
        actionText: 'Start Chat'
      },
      {
        id: 2,
        type: 'like',
        title: 'Someone liked your profile! ❤️',
        message: 'Aisha Khan liked your profile. Check out their profile and see if you\'re interested!',
        time: '1 hour ago',
        isRead: false,
        actionUrl: '/profile/2',
        actionText: 'View Profile'
      },
      {
        id: 3,
        type: 'message',
        title: 'New message from Nimali 💬',
        message: 'Nimali Perera sent you a message: "Hi! I really enjoyed your profile. Would you like to chat?"',
        time: '3 hours ago',
        isRead: true,
        actionUrl: '/chat/3',
        actionText: 'Reply'
      },
      {
        id: 4,
        type: 'system',
        title: 'Profile verification completed! ✅',
        message: 'Congratulations! Your profile has been verified. This will help you get more matches.',
        time: '1 day ago',
        isRead: true,
        actionUrl: null,
        actionText: null
      },
      {
        id: 5,
        type: 'match',
        title: 'Daily matches are ready! 💕',
        message: 'We found 5 new potential matches for you based on your preferences.',
        time: '2 days ago',
        isRead: true,
        actionUrl: '/matches',
        actionText: 'View Matches'
      }
    ];

    this.filterNotifications();
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterNotifications();
  }

  filterNotifications(): void {
    if (this.activeFilter === 'all') {
      this.filteredNotifications = [...this.notifications];
    } else {
      this.filteredNotifications = this.notifications.filter(
        notification => notification.type === this.activeFilter
      );
    }
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      match: '💕',
      like: '❤️',
      message: '💬',
      system: '⚙️'
    };
    return icons[type] || '🔔';
  }

  markAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      // TODO: Implement API call to mark as read
      console.log('Marked notification as read:', notificationId);
    }
  }

  dismissNotification(notificationId: number, event: Event): void {
    event.stopPropagation();
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.filterNotifications();
    // TODO: Implement API call to dismiss notification
    console.log('Dismissed notification:', notificationId);
  }

  loadMoreNotifications(): void {
    this.isLoadingMore = true;
    // TODO: Implement pagination to load more notifications
    setTimeout(() => {
      this.isLoadingMore = false;
      this.hasMoreNotifications = false; // For demo purposes
    }, 1000);
  }
} 