export const environment = {
  production: true,
  apiUrl: 'https://api.soulsync.com/api/v1',
  wsUrl: 'https://api.soulsync.com',
  appName: 'SoulSync Matrimony',
  version: '1.0.0',
  
  // Feature flags
  features: {
    chat: true,
    voiceMessages: true,
    videoCalls: true,
    horoscope: true,
    premiumFeatures: true,
    adminPanel: true,
    advancedSearch: true,
    profileVerification: true,
    videoInterview: true,
  },
  
  // Payment configuration
  payments: {
    stripe: {
      publishableKey: 'pk_live_51234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    },
    paypal: {
      clientId: 'AY1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    },
  },
  
  // File upload limits
  upload: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVoiceSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
    allowedVoiceTypes: ['audio/mp3', 'audio/wav', 'audio/m4a'],
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  
  // Real-time settings
  realtime: {
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
  },
  
  // Analytics
  analytics: {
    enableGoogleAnalytics: true,
    googleAnalyticsId: 'G-SOULSYNC2024-PROD'
  },

  // Notifications
  notifications: {
    enablePush: true,
    vapidPublicKey: 'BN1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  
  // Cache settings
  cache: {
    userProfile: 5 * 60 * 1000, // 5 minutes
    matches: 2 * 60 * 1000, // 2 minutes
    conversations: 1 * 60 * 1000, // 1 minute
  },

  // Performance settings
  performance: {
    enablePWA: true,
    enableServiceWorker: true,
    enableImageOptimization: true,
    enableLazyLoading: true,
    enableCaching: true,
  },

  // Security settings
  security: {
    enableContentSecurityPolicy: true,
    enableHttpsRedirect: true,
    enableXSSProtection: true,
    enableCSRFProtection: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // Social login settings
  social: {
    google: {
      clientId: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
      enabled: true,
    },
    facebook: {
      appId: '123456789012345',
      enabled: true,
    },
  },
}; 