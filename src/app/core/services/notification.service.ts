import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Notification {
  id: number;
  user_id: number;
  type: 'match' | 'message' | 'like' | 'super_like' | 'profile_view' | 'subscription' | 'system' | 'verification';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: number;
  user_id: number;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  match_notifications: boolean;
  message_notifications: boolean;
  like_notifications: boolean;
  profile_view_notifications: boolean;
  subscription_notifications: boolean;
  system_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  message: string;
}

export interface NotificationDetailResponse {
  success: boolean;
  data: Notification;
  message: string;
}

export interface PreferencesResponse {
  success: boolean;
  data: NotificationPreferences;
  message: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  by_type: {
    match: number;
    message: number;
    like: number;
    super_like: number;
    profile_view: number;
    subscription: number;
    system: number;
    verification: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private preferencesSubject = new BehaviorSubject<NotificationPreferences | null>(null);
  public preferences$ = this.preferencesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Notifications
  getNotifications(page: number = 1, limit: number = 20): Observable<Notification[]> {
    const headers = this.getAuthHeaders();
    const params = { page: page.toString(), limit: limit.toString() };
    
    return this.http.get<NotificationResponse>(`${environment.apiUrl}/notifications`, { 
      headers, 
      params 
    }).pipe(
      map(response => response.data),
      tap(notifications => {
        if (page === 1) {
          this.notificationsSubject.next(notifications);
        } else {
          const currentNotifications = this.notificationsSubject.value;
          this.notificationsSubject.next([...currentNotifications, ...notifications]);
        }
        this.updateUnreadCount();
      }),
      catchError(this.handleError)
    );
  }

  getNotification(notificationId: number): Observable<Notification> {
    const headers = this.getAuthHeaders();
    return this.http.get<NotificationDetailResponse>(`${environment.apiUrl}/notifications/${notificationId}`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  markAsRead(notificationId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${environment.apiUrl}/notifications/${notificationId}/read`, {}, { headers })
      .pipe(
        tap(() => {
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notification => 
            notification.id === notificationId ? { ...notification, is_read: true } : notification
          );
          this.notificationsSubject.next(updatedNotifications);
          this.updateUnreadCount();
        }),
        catchError(this.handleError)
      );
  }

  markAllAsRead(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${environment.apiUrl}/notifications/read-all`, {}, { headers })
      .pipe(
        tap(() => {
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notification => ({
            ...notification,
            is_read: true
          }));
          this.notificationsSubject.next(updatedNotifications);
          this.updateUnreadCount();
        }),
        catchError(this.handleError)
      );
  }

  deleteNotification(notificationId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${environment.apiUrl}/notifications/${notificationId}`, { headers })
      .pipe(
        tap(() => {
          const currentNotifications = this.notificationsSubject.value;
          const filteredNotifications = currentNotifications.filter(notification => notification.id !== notificationId);
          this.notificationsSubject.next(filteredNotifications);
          this.updateUnreadCount();
        }),
        catchError(this.handleError)
      );
  }

  deleteAllNotifications(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${environment.apiUrl}/notifications`, { headers })
      .pipe(
        tap(() => {
          this.notificationsSubject.next([]);
          this.updateUnreadCount();
        }),
        catchError(this.handleError)
      );
  }

  // Notification Statistics
  getNotificationStats(): Observable<NotificationStats> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: NotificationStats }>(`${environment.apiUrl}/notifications/stats`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Notification Preferences
  getPreferences(): Observable<NotificationPreferences> {
    const headers = this.getAuthHeaders();
    return this.http.get<PreferencesResponse>(`${environment.apiUrl}/notifications/preferences`, { headers })
      .pipe(
        map(response => response.data),
        tap(preferences => {
          this.preferencesSubject.next(preferences);
        }),
        catchError(this.handleError)
      );
  }

  updatePreferences(preferences: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    const headers = this.getAuthHeaders();
    return this.http.put<PreferencesResponse>(`${environment.apiUrl}/notifications/preferences`, preferences, { headers })
      .pipe(
        map(response => response.data),
        tap(preferences => {
          this.preferencesSubject.next(preferences);
        }),
        catchError(this.handleError)
      );
  }

  // Push Notification Token
  registerPushToken(token: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/notifications/push-token`, { token }, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  unregisterPushToken(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${environment.apiUrl}/notifications/push-token`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Test Notifications
  sendTestNotification(type: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/notifications/test`, { type }, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Utility Methods
  private updateUnreadCount(): void {
    const notifications = this.notificationsSubject.value;
    const unreadCount = notifications.filter(notification => !notification.is_read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  getNotificationsValue(): Notification[] {
    return this.notificationsSubject.value;
  }

  getUnreadCountValue(): number {
    return this.unreadCountSubject.value;
  }

  getPreferencesValue(): NotificationPreferences | null {
    return this.preferencesSubject.value;
  }

  getUnreadNotifications(): Notification[] {
    return this.notificationsSubject.value.filter(notification => !notification.is_read);
  }

  getNotificationsByType(type: string): Notification[] {
    return this.notificationsSubject.value.filter(notification => notification.type === type);
  }

  hasUnreadNotifications(): boolean {
    return this.unreadCountSubject.value > 0;
  }

  clearCache(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
    this.preferencesSubject.next(null);
  }

  // Real-time notification handling (for WebSocket integration)
  addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
    this.updateUnreadCount();
  }

  updateNotification(updatedNotification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => 
      notification.id === updatedNotification.id ? updatedNotification : notification
    );
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
  }

  removeNotification(notificationId: number): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(notification => notification.id !== notificationId);
    this.notificationsSubject.next(filteredNotifications);
    this.updateUnreadCount();
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