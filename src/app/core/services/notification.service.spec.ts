import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService, Notification, NotificationSettings } from './notification.service';
import { environment } from '../../../environments/environment';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  const mockNotification: Notification = {
    id: 1,
    type: 'match',
    title: 'New Match!',
    message: 'You have a new match with John Doe',
    data: { user_id: 123 },
    is_read: false,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 1,
    sender_id: 123,
    sender: { id: 123, name: 'John Doe', photo_url: 'photo.jpg' }
  };

  const mockNotificationSettings: NotificationSettings = {
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    match_notifications: true,
    like_notifications: true,
    message_notifications: true,
    profile_view_notifications: true,
    reminder_notifications: true,
    marketing_notifications: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationService]
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNotifications', () => {
    it('should fetch notifications successfully', () => {
      const mockResponse = {
        success: true,
        data: [mockNotification]
      };

      service.getNotifications(1, 20).subscribe(notifications => {
        expect(notifications).toEqual([mockNotification]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/notifications?page=1&limit=20`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when fetching notifications fails', () => {
      service.getNotifications().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/notifications?page=1&limit=20`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getUnreadNotifications', () => {
    it('should fetch unread notifications successfully', () => {
      const mockResponse = {
        success: true,
        data: [mockNotification]
      };

      service.getUnreadNotifications().subscribe(notifications => {
        expect(notifications).toEqual([mockNotification]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/notifications?type=unread`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getNotificationCount', () => {
    it('should fetch notification count successfully', () => {
      const mockResponse = {
        success: true,
        data: {
          unread_count: 5,
          total_count: 20
        }
      };

      service.getNotificationCount().subscribe(counts => {
        expect(counts.unread_count).toBe(5);
        expect(counts.total_count).toBe(20);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/notifications/unread-count`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', () => {
      const notificationId = 1;
      const mockResponse = { success: true };

      service.markAsRead(notificationId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/notifications/${notificationId}/read`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', () => {
      const mockResponse = { success: true };

      service.markAllAsRead().subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/notifications/read-all`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('archiveNotification', () => {
    it('should archive notification successfully', () => {
      const notificationId = 1;
      const mockResponse = { success: true };

      service.archiveNotification(notificationId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/notifications/${notificationId}/archive`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', () => {
      const notificationId = 1;
      const mockResponse = { success: true };

      service.deleteNotification(notificationId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/notifications/${notificationId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getSettings', () => {
    it('should fetch notification settings successfully', () => {
      const mockResponse = {
        success: true,
        data: mockNotificationSettings
      };

      service.getSettings().subscribe(settings => {
        expect(settings).toEqual(mockNotificationSettings);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/settings/notifications`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateSettings', () => {
    it('should update notification settings successfully', () => {
      const updatedSettings = { ...mockNotificationSettings, email_notifications: false };
      const mockResponse = {
        success: true,
        data: updatedSettings
      };

      service.updateSettings(updatedSettings).subscribe(settings => {
        expect(settings).toEqual(updatedSettings);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/settings/notifications`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedSettings);
      req.flush(mockResponse);
    });
  });

  describe('subscribeToPushNotifications', () => {
    it('should subscribe to push notifications successfully', () => {
      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/token123',
        keys: {
          p256dh: 'p256dh_key',
          auth: 'auth_key'
        }
      } as PushSubscription;

      const mockResponse = { success: true };

      service.subscribeToPushNotifications(mockSubscription).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/notifications/push-subscription`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        endpoint: mockSubscription.endpoint,
        keys: mockSubscription.keys
      });
      req.flush(mockResponse);
    });
  });

  describe('unsubscribeFromPushNotifications', () => {
    it('should unsubscribe from push notifications successfully', () => {
      const mockResponse = { success: true };

      service.unsubscribeFromPushNotifications().subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/notifications/push-subscription`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('local notification management', () => {
    it('should add notification locally', () => {
      service.addNotification(mockNotification);
      
      service.getNotificationsValue().subscribe(notifications => {
        expect(notifications).toContain(mockNotification);
      });
    });

    it('should update notification locally', () => {
      service.addNotification(mockNotification);
      const updates = { is_read: true };
      
      service.updateNotification(1, updates);
      
      service.getNotificationsValue().subscribe(notifications => {
        const updatedNotification = notifications.find(n => n.id === 1);
        expect(updatedNotification?.is_read).toBe(true);
      });
    });
  });

  describe('observables', () => {
    it('should provide notifications observable', () => {
      service.notifications$.subscribe(notifications => {
        expect(notifications).toEqual([]); // Initially empty
      });
    });

    it('should provide unread count observable', () => {
      service.unreadCount$.subscribe(count => {
        expect(count).toBe(0); // Initially 0
      });
    });

    it('should provide settings observable', () => {
      service.settings$.subscribe(settings => {
        expect(settings).toBeNull(); // Initially null
      });
    });
  });

  describe('utility methods', () => {
    it('should get current notifications value', () => {
      const notifications = service.getNotificationsValue();
      expect(notifications).toEqual([]);
    });

    it('should get current unread count value', () => {
      const count = service.getUnreadCountValue();
      expect(count).toBe(0);
    });

    it('should get current settings value', () => {
      const settings = service.getSettingsValue();
      expect(settings).toBeNull();
    });

    it('should clear cache', () => {
      service.addNotification(mockNotification);
      service.clearCache();
      
      expect(service.getNotificationsValue()).toEqual([]);
      expect(service.getUnreadCountValue()).toBe(0);
      expect(service.getSettingsValue()).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors gracefully', () => {
      service.getNotifications().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/notifications?page=1&limit=20`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
