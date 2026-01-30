import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface ServiceWorkerConfig {
  scope?: string;
  updateViaCache?: 'all' | 'none';
  skipWaiting?: boolean;
  clientsClaim?: boolean;
}

export interface PushNotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// Fallback typing for Background Sync options (not in lib.dom)
type BackgroundSyncOptions = any;

@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerService {
  private swRegistration?: ServiceWorkerRegistration;
  private readonly SW_URL = '/sw.js';
  private readonly SW_SCOPE = '/';

  constructor() {}

  /**
   * Register service worker
   */
  async registerServiceWorker(config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register(this.SW_URL, {
        scope: config.scope || this.SW_SCOPE,
        updateViaCache: config.updateViaCache || 'none'
      });

      // Handle service worker updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && typeof navigator !== 'undefined' && navigator.serviceWorker.controller) {
              // New service worker available
              this.showUpdateNotification();
            }
          });
        }
      });

      // Handle service worker controller change
      if (typeof navigator !== 'undefined') {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker activated');
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        });
      }

      return this.swRegistration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Check if service worker is registered
   */
  isRegistered(): boolean {
    return !!this.swRegistration;
  }

  /**
   * Get service worker registration
   */
  getRegistration(): ServiceWorkerRegistration | undefined {
    return this.swRegistration;
  }

  /**
   * Unregister service worker
   */
  async unregisterServiceWorker(): Promise<boolean> {
    if (this.swRegistration) {
      return await this.swRegistration.unregister();
    }
    return false;
  }

  /**
   * Update service worker
   */
  async updateServiceWorker(): Promise<void> {
    if (this.swRegistration) {
      await this.swRegistration.update();
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    try {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(config: PushNotificationConfig): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    const options: any = {
      body: config.body,
      icon: config.icon || '/assets/icons/icon-192x192.png',
      badge: config.badge || '/assets/icons/badge-72x72.png',
      tag: config.tag,
      data: config.data,
      actions: config.actions,
      requireInteraction: true,
      silent: false
    };

    await this.swRegistration.showNotification(config.title, options);
  }

  /**
   * Register background sync
   */
  async registerBackgroundSync(tag: string, options?: BackgroundSyncOptions): Promise<void> {
    if (!this.swRegistration || !('sync' in this.swRegistration)) {
      throw new Error('Background Sync not supported');
    }

    try {
      await (this.swRegistration as any).sync.register(tag, options);
    } catch (error) {
      console.error('Background sync registration failed:', error);
      throw error;
    }
  }

  /**
   * Get background sync tags
   */
  async getBackgroundSyncTags(): Promise<string[]> {
    if (!this.swRegistration || !('sync' in this.swRegistration)) {
      return [];
    }

    try {
      return await (this.swRegistration as any).sync.getTags();
    } catch (error) {
      console.error('Get background sync tags failed:', error);
      return [];
    }
  }

  /**
   * Check if app is online
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Get online status observable
   */
  getOnlineStatus(): Observable<boolean> {
    return new Observable(observer => {
      if (typeof navigator === 'undefined' || typeof window === 'undefined') {
        observer.next(true);
        return;
      }

      const updateOnlineStatus = () => observer.next(navigator.onLine);
      
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      
      // Initial status
      observer.next(navigator.onLine);
      
      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    });
  }

  /**
   * Cache API response
   */
  async cacheApiResponse(url: string, response: Response): Promise<void> {
    if (!this.swRegistration) {
      return;
    }

    try {
      const cache = await caches.open('api-cache-v1');
      await cache.put(url, response.clone());
    } catch (error) {
      console.error('Cache API response failed:', error);
    }
  }

  /**
   * Get cached API response
   */
  async getCachedApiResponse(url: string): Promise<Response | null> {
    try {
      const cache = await caches.open('api-cache-v1');
      return (await cache.match(url)) ?? null;
    } catch (error) {
      console.error('Get cached API response failed:', error);
      return null;
    }
  }

  /**
   * Clear API cache
   */
  async clearApiCache(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      const apiCaches = cacheNames.filter(name => name.startsWith('api-cache-'));
      await Promise.all(apiCaches.map(name => caches.delete(name)));
    } catch (error) {
      console.error('Clear API cache failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ name: string; size: number }[]> {
    try {
      const cacheNames = await caches.keys();
      const stats = await Promise.all(
        cacheNames.map(async name => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return { name, size: keys.length };
        })
      );
      return stats;
    } catch (error) {
      console.error('Get cache stats failed:', error);
      return [];
    }
  }

  /**
   * Show update notification
   */
  private showUpdateNotification(): void {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Show update notification to user
      if (typeof window !== 'undefined' && confirm('A new version is available. Would you like to update?')) {
        this.skipWaiting();
      }
    }
  }

  /**
   * Convert VAPID public key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Send message to service worker
   */
  async sendMessageToSW(message: any): Promise<any> {
    if (!this.swRegistration || !this.swRegistration.active) {
      throw new Error('Service Worker not active');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };

      this.swRegistration!.active!.postMessage(message, [messageChannel.port2]);
    });
  }

  /**
   * Listen for messages from service worker
   */
  onMessageFromSW(): Observable<any> {
    return new Observable(observer => {
      const messageHandler = (event: MessageEvent) => {
        observer.next(event.data);
      };

      navigator.serviceWorker.addEventListener('message', messageHandler);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
      };
    });
  }
} 