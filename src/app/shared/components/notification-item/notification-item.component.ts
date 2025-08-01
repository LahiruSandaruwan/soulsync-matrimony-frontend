import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface NotificationItem {
  id: number;
  user_id: number;
  type: 'match' | 'message' | 'like' | 'super_like' | 'profile_view' | 'subscription' | 'system';
  title: string;
  message: string;
  data?: {
    match_id?: number;
    conversation_id?: number;
    sender_id?: number;
    sender_name?: string;
    profile_photo?: string;
    [key: string]: any;
  };
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent {
  @Input() notification!: NotificationItem;
  @Input() showActions: boolean = true;
  
  @Output() markAsRead = new EventEmitter<number>();
  @Output() deleteNotification = new EventEmitter<number>();
  @Output() notificationClick = new EventEmitter<NotificationItem>();

  getNotificationIcon(): string {
    switch (this.notification.type) {
      case 'match':
        return '💕';
      case 'message':
        return '💬';
      case 'like':
        return '❤️';
      case 'super_like':
        return '⭐';
      case 'profile_view':
        return '👁️';
      case 'subscription':
        return '💎';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  }

  getNotificationColor(): string {
    switch (this.notification.type) {
      case 'match':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'message':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'like':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'super_like':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'profile_view':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'subscription':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'system':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getTimeAgo(): string {
    const now = new Date();
    const created = new Date(this.notification.created_at);
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  }

  onMarkAsRead(event: Event): void {
    event.stopPropagation();
    this.markAsRead.emit(this.notification.id);
  }

  onDeleteNotification(event: Event): void {
    event.stopPropagation();
    this.deleteNotification.emit(this.notification.id);
  }

  onNotificationClick(): void {
    this.notificationClick.emit(this.notification);
  }

  getRouterLink(): string[] {
    switch (this.notification.type) {
      case 'match':
        return ['/matches'];
      case 'message':
        return ['/chat', this.notification.data?.conversation_id?.toString() || ''];
      case 'profile_view':
        return ['/profile', this.notification.data?.sender_id?.toString() || ''];
      case 'subscription':
        return ['/subscription'];
      default:
        return ['/notifications'];
    }
  }

  shouldShowAvatar(): boolean {
    return ['match', 'message', 'like', 'super_like', 'profile_view'].includes(this.notification.type) && 
           this.notification.data?.profile_photo;
  }

  getAvatarSrc(): string {
    return this.notification.data?.profile_photo || 'assets/images/default-avatar.png';
  }
} 