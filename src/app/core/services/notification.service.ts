import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: number;
  type: 'match' | 'like' | 'message' | 'super_like' | 'profile_view' | 'system' | 'reminder';
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  user_id: number;
  sender_id?: number;
  sender?: {
    id: number;
    name: string;
    photo_url?: string;
  };
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  match_notifications: boolean;
  like_notifications: boolean;
  message_notifications: boolean;
  profile_view_notifications: boolean;
  reminder_notifications: boolean;
  marketing_notifications: boolean;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  message: string;
}

export interface NotificationCountResponse {
  success: boolean;
  data: {
    unread_count: number;
    total_count: number;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private settingsSubject = new BehaviorSubject<NotificationSettings | null>(null);
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all notifications
  getNotifications(page: number = 1, limit: number = 20): Observable<Notification[]> {
    const headers = this.getAuthHeaders();
    const params = { page: page.toString(), limit: limit.toString() };

    return this.http.get<NotificationResponse>(`${environment.apiUrl}/notifications`, { headers, params })
      .pipe(
        map(response => response.data),
        tap(notifications => {
          this.notificationsSubject.next(notifications);
          this.updateUnreadCount(notifications);
        }),
        catchError(this.handleError)
      );
  }

  // Get unread notifications
  // Optional: backend does not expose /notifications/unread in docs
  getUnreadNotifications(): Observable<Notification[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<NotificationResponse>(`${environment.apiUrl}/notifications?type=unread`, { headers })
      .pipe(
        map(response => response.data),
        tap(notifications => {
          this.updateUnreadCount(notifications);
        }),
        catchError(this.handleError)
      );
  }

  // Get notification count
  getNotificationCount(): Observable<{ unread_count: number; total_count: number }> {
    const headers = this.getAuthHeaders();
    return this.http.get<NotificationCountResponse>(`${environment.apiUrl}/notifications/unread-count`, { headers })
      .pipe(
        map(response => response.data),
        tap(counts => {
          this.unreadCountSubject.next(counts.unread_count);
        }),
        catchError(this.handleError)
      );
  }

  // Mark notification as read
  markAsRead(notificationId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/notifications/${notificationId}/read`, {}, { headers })
      .pipe(
        tap(() => {
          this.updateNotificationReadStatus(notificationId, true);
        }),
        catchError(this.handleError)
      );
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/notifications/read-all`, {}, { headers })
      .pipe(
        tap(() => {
          this.markAllNotificationsAsRead();
        }),
        catchError(this.handleError)
      );
  }

  // Archive notification
  archiveNotification(notificationId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${environment.apiUrl}/notifications/${notificationId}/archive`, {}, { headers })
      .pipe(
        tap(() => {
          this.updateNotificationArchiveStatus(notificationId, true);
        }),
        catchError(this.handleError)
      );
  }

  // Delete notification
  deleteNotification(notificationId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${environment.apiUrl}/notifications/${notificationId}`, { headers })
      .pipe(
        tap(() => {
          this.removeNotification(notificationId);
        }),
        catchError(this.handleError)
      );
  }

  // Get notification settings (via /settings/notifications)
  getSettings(): Observable<NotificationSettings> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: NotificationSettings }>(`${environment.apiUrl}/settings/notifications`, { headers })
      .pipe(
        map(response => response.data),
        tap(settings => {
          this.settingsSubject.next(settings);
        }),
        catchError(this.handleError)
      );
  }

  // Update notification settings (via /settings/notifications)
  updateSettings(settings: Partial<NotificationSettings>): Observable<NotificationSettings> {
    const headers = this.getAuthHeaders();
    return this.http.put<{ success: boolean, data: NotificationSettings }>(`${environment.apiUrl}/settings/notifications`, settings, { headers })
      .pipe(
        map(response => response.data),
        tap(settings => {
          this.settingsSubject.next(settings);
        }),
        catchError(this.handleError)
      );
  }

  // Subscribe to push notifications
  subscribeToPushNotifications(subscription: PushSubscription): Observable<any> {
    const headers = this.getAuthHeaders();
    const payload = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')!)))),
        auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')!))))
      }
    };

    return this.http.post(`${environment.apiUrl}/notifications/push-subscription`, payload, { headers })
      .pipe(catchError(this.handleError));
  }

  // Helper to request and persist subscription using VAPID
  async ensurePushSubscription(vapidPublicKey: string): Promise<void> {
    if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;
    let sub = await registration.pushManager.getSubscription();
    if (!sub) {
      sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });
    }
    const { firstValueFrom } = await import('rxjs');
    await firstValueFrom(this.subscribeToPushNotifications(sub));
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Unsubscribe from push notifications
  unsubscribeFromPushNotifications(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${environment.apiUrl}/notifications/push-subscription`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Add notification locally (for real-time updates)
  addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [notification, ...currentNotifications];
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  // Update notification locally
  updateNotification(notificationId: number, updates: Partial<Notification>): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId ? { ...notification, ...updates } : notification
    );
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  // Utility methods
  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private updateNotificationReadStatus(notificationId: number, isRead: boolean): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId ? { ...notification, is_read: isRead } : notification
    );
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  private updateNotificationArchiveStatus(notificationId: number, isArchived: boolean): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId ? { ...notification, is_archived: isArchived } : notification
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  private markAllNotificationsAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      is_read: true
    }));
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  private removeNotification(notificationId: number): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(notification => notification.id !== notificationId);
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  // Get current values
  getNotificationsValue(): Notification[] {
    return this.notificationsSubject.value;
  }

  getUnreadCountValue(): number {
    return this.unreadCountSubject.value;
  }

  getSettingsValue(): NotificationSettings | null {
    return this.settingsSubject.value;
  }

  // Clear cache
  clearCache(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
    this.settingsSubject.next(null);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Notification Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 