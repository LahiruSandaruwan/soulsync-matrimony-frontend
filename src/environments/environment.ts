export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  wsUrl: 'http://localhost:8000',
  appName: 'SoulSync Matrimony',
  version: '1.0.0',
  
  // Security Configuration
  security: {
    enableCSRF: true,
    enableXSSProtection: true,
    enableContentSecurityPolicy: true,
    enableRateLimiting: true,
    maxRequestSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  },
  
  // Payment Configuration
  payments: {
    stripe: {
      publishableKey: 'pk_test_your_stripe_key_here',
      currency: 'usd',
      supportedCountries: ['US', 'CA', 'GB', 'AU', 'IN', 'LK']
    },
    paypal: {
      clientId: 'your_paypal_client_id_here',
      currency: 'USD',
      environment: 'sandbox' // or 'production'
    }
  },
  
  // Feature Flags
  features: {
    enableRealTimeChat: true,
    enablePushNotifications: true,
    enableVideoCalls: false,
    enableVoiceMessages: false,
    enableAdvancedSearch: true,
    enableProfileVerification: true,
    enablePremiumFeatures: true
  },
  
  // Performance Configuration
  performance: {
    enableServiceWorker: true,
    enablePWA: true,
    enableCaching: true,
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    cacheExpiration: 7 * 24 * 60 * 60 * 1000, // 7 days
    enableImageOptimization: true,
    enableLazyLoading: true
  },
  
  // Analytics Configuration
  analytics: {
    enableGoogleAnalytics: false,
    googleAnalyticsId: 'GA_MEASUREMENT_ID',
    enableErrorTracking: true,
    enablePerformanceMonitoring: true
  },
  
  // Social Login Configuration
  social: {
    google: {
      clientId: 'your_google_client_id_here',
      enabled: true
    },
    facebook: {
      appId: 'your_facebook_app_id_here',
      enabled: false
    }
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxImagesPerUser: 10,
    imageQuality: 0.8,
    enableCompression: true
  },
  
  // Notification Configuration
  notifications: {
    enableEmail: true,
    enableSMS: false,
    enablePush: true,
    enableInApp: true,
    maxNotifications: 100
  },
  
  // Chat Configuration
  chat: {
    maxMessageLength: 1000,
    enableFileSharing: true,
    enableEmoji: true,
    enableTypingIndicator: true,
    messageRetentionDays: 365
  },
  
  // Search Configuration
  search: {
    maxResults: 50,
    enableAdvancedFilters: true,
    enableLocationSearch: true,
    enableCompatibilityScoring: true,
    maxDistanceKm: 100
  },
  
  // Subscription Configuration
  subscription: {
    enableTrial: true,
    trialDays: 7,
    enableAutoRenewal: true,
    enableCoupons: true,
    maxCouponUsage: 1
  },
  
  // Admin Configuration
  admin: {
    enableUserManagement: true,
    enableContentModeration: true,
    enableAnalytics: true,
    enableReports: true,
    maxUsersPerPage: 50
  }
}; 