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

// ═══════════════════════════════════════════════════════════════════════════
// Horoscope Compatibility Models
// ═══════════════════════════════════════════════════════════════════════════

export interface HoroscopeCompatibilityPreview {
  hasHoroscope: boolean;
  userSign: string | null;
  userMoonSign?: string;
  topMatches: HoroscopeMatch[];
  dailyReading?: DailyHoroscopeReading;
}

export interface HoroscopeMatch {
  userId: number;
  name: string;
  photoUrl: string;
  age: number;
  location: string;
  zodiacSign: string;
  moonSign?: string;
  compatibilityScore: number;
  compatibilityGrade: 'excellent' | 'very_good' | 'good' | 'average' | 'low';
  keyFactors: string[];
  lastActive?: string;
}

export interface DailyHoroscopeReading {
  general: string;
  love: string;
  luckyNumbers: number[];
  luckyColors: string[];
  compatibleSignsToday: string[];
  date: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Favorites/Shortlist Models
// ═══════════════════════════════════════════════════════════════════════════

export interface FavoriteProfile {
  id: number;
  favoriteId: number;
  userId: number;
  name: string;
  firstName: string;
  photoUrl: string;
  age: number;
  location: string;
  occupation?: string;
  compatibilityScore: number;
  isOnline: boolean;
  lastActive: string;
  savedAt: string;
  notes?: string;
  isPremium: boolean;
}

export interface FavoritesResponse {
  favorites: FavoriteProfile[];
  total: number;
  hasMore: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Who Viewed Me Models
// ═══════════════════════════════════════════════════════════════════════════

export interface ProfileViewer {
  id: number;
  viewId: number;
  viewerId: number;
  name: string;
  firstName: string;
  photoUrl: string;
  age: number;
  location: string;
  occupation?: string;
  isOnline: boolean;
  lastActive?: string;
  viewedAt: string;
  isPremium: boolean;
  isAnonymous: boolean;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
}

export interface ProfileViewsResponse {
  viewers: ProfileViewer[];
  totalViews: number;
  uniqueViewers: number;
  todayViews: number;
  hasMore: boolean;
  isPremiumRequired: boolean;
}
