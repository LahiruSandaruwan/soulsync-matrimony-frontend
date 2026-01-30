// Dashboard Data Models

export interface UserProfile {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  age: number;
  profilePictureUrl: string;
  completeness: number;
  location: string;
  occupation: string;
  lastActive: string;
  isOnline: boolean;
}

export interface Match {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  age: number;
  location: string;
  compatibilityScore: number;
  matchedAt: string;
  isNew: boolean;
  lastActive: string;
}

export interface ChatConversation {
  id: number;
  userId: number;
  name: string;
  photoUrl: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  lastActive: string;
}

export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  type: 'match' | 'message' | 'like' | 'view' | 'system';
  isRead: boolean;
  userId?: number;
  photoUrl?: string;
}

export interface NotificationSummary {
  count: number;
  unreadCount: number;
  items: Notification[];
}

export interface Subscription {
  tier: 'free' | 'premium' | 'vip';
  status: 'active' | 'expired' | 'cancelled';
  planName: string;
  expiresAt: string;
  features: string[];
  price: number;
  currency: string;
}

export interface DashboardStats {
  totalMatches: number;
  newMessages: number;
  profileViews: number;
  likesReceived: number;
  activeSubscriptions: number;
  profileCompletion: number;
  unreadNotifications: number;
}

export interface SearchPreferences {
  ageRange: {
    min: number;
    max: number;
  };
  location: string;
  distance: number;
  interests: string[];
  lastSearch: string;
}

// API Response Models
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
