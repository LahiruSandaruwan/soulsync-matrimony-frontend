export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  wsUrl: 'ws://localhost:6001',
  appName: 'SoulSync Matrimony',
  version: '1.0.0',
  
  // Feature flags
  features: {
    chat: true,
    voiceMessages: true,
    videoCalls: false,
    horoscope: true,
    premiumFeatures: true,
    adminPanel: true,
  },
  
  // Payment configuration
  payments: {
    stripe: {
      publishableKey: 'pk_test_your_stripe_key_here',
    },
    paypal: {
      clientId: 'your_paypal_client_id_here',
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
  
  // Cache settings
  cache: {
    userProfile: 5 * 60 * 1000, // 5 minutes
    matches: 2 * 60 * 1000, // 2 minutes
    conversations: 1 * 60 * 1000, // 1 minute
  },
}; 