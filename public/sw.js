const CACHE_NAME = 'soulsync-v1';
const STATIC_CACHE = 'soulsync-static-v1';
const API_CACHE = 'soulsync-api-v1';
const IMAGE_CACHE = 'soulsync-images-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/badge-72x72.png',
  '/assets/images/default-avatar.png',
  '/assets/images/default-thumbnail.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/auth/profile',
  '/api/matches/suggestions',
  '/api/notifications'
];

// Image patterns to cache
const IMAGE_PATTERNS = [
  /\.(jpg|jpeg|png|gif|webp|svg)$/i,
  /\/api\/upload\//,
  /\/assets\/images\//
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== API_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle different types of requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (isStaticFile(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isApiRequest(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
  } else if (isImageRequest(url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Soulsync Matrimony',
    body: 'You have a new notification!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    tag: 'default',
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Failed to parse push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/assets/icons/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    Promise.all([
      // Focus existing window or open new one
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        const client = clients.find(c => c.focus);
        if (client) {
          return client.focus();
        }
        return self.clients.openWindow('/');
      }),
      
      // Handle specific actions
      handleNotificationAction(event.action, event.notification.data)
    ])
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Cache strategies
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && cacheName) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    if (cacheName) {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Helper functions
function isStaticFile(url) {
  return STATIC_FILES.includes(url.pathname) ||
         url.pathname.startsWith('/assets/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js');
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') ||
         API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint));
}

function isImageRequest(url) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

async function performBackgroundSync() {
  try {
    // Perform background sync operations
    console.log('Performing background sync...');
    
    // Example: Sync offline data
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
    }
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function handleNotificationAction(action, data) {
  switch (action) {
    case 'open':
      // Open specific page based on notification data
      if (data.url) {
        const client = await self.clients.openWindow(data.url);
        if (client) {
          client.focus();
        }
      }
      break;
      
    case 'dismiss':
      // Notification already closed
      break;
      
    default:
      console.log('Unknown notification action:', action);
  }
}

async function getOfflineData() {
  // Get offline data from IndexedDB or localStorage
  // This is a placeholder implementation
  return [];
}

async function syncOfflineData(data) {
  // Sync offline data with server
  // This is a placeholder implementation
  console.log('Syncing offline data:', data);
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
}); 