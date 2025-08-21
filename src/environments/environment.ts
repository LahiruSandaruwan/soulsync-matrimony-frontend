export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  wsUrl: 'http://localhost:8000',
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
      publishableKey: 'pk_test_51234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
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
    enableGoogleAnalytics: false,
    googleAnalyticsId: 'G-SOULSYNC2024-DEV'
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
}; 