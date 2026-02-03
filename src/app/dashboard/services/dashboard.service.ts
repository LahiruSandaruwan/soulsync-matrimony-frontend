import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  UserProfile,
  Match,
  ChatConversation,
  NotificationSummary,
  Subscription,
  DashboardStats,
  SearchPreferences,
  ApiResponse,
  PaginatedResponse,
  HoroscopeCompatibilityPreview,
  DailyHoroscopeReading,
  FavoritesResponse,
  ProfileViewsResponse
} from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }

  // User Profile
  getUserProfile(): Observable<ApiResponse<UserProfile>> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/auth/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      delay(500), // Simulate network delay
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError('getUserProfile', this.getMockUserProfile()))
    );
  }

  // Matches
  getMatches(): Observable<ApiResponse<PaginatedResponse<Match>>> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<PaginatedResponse<Match>>>(`${this.apiUrl}/matches`, {
      headers: this.getAuthHeaders()
    }).pipe(
      delay(300),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError('getMatches', this.getMockMatches()))
    );
  }

  // Chat Conversations
  getChatConversations(): Observable<ApiResponse<PaginatedResponse<ChatConversation>>> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<PaginatedResponse<ChatConversation>>>(`${this.apiUrl}/chat/conversations`, {
      headers: this.getAuthHeaders()
    }).pipe(
      delay(400),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError('getChatConversations', this.getMockChatConversations()))
    );
  }

  // Notifications
  getNotifications(): Observable<ApiResponse<NotificationSummary>> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<NotificationSummary>>(`${this.apiUrl}/notifications`, {
      headers: this.getAuthHeaders()
    }).pipe(
      delay(200),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError('getNotifications', this.getMockNotifications()))
    );
  }

  // Subscription
  getSubscription(): Observable<ApiResponse<Subscription>> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<Subscription>>(`${this.apiUrl}/subscription/status`, {
      headers: this.getAuthHeaders()
    }).pipe(
      delay(300),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError('getSubscription', this.getMockSubscription()))
    );
  }

  // Dashboard Stats
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard/stats`, {
      headers: this.getAuthHeaders()
    }).pipe(
      delay(600),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError('getDashboardStats', this.getMockDashboardStats()))
    );
  }

  // Search Preferences
  getSearchPreferences(): Observable<ApiResponse<SearchPreferences>> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<SearchPreferences>>(`${this.apiUrl}/preferences/search`, {
      headers: this.getAuthHeaders()
    }).pipe(
      delay(250),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError('getSearchPreferences', this.getMockSearchPreferences()))
    );
  }

  // Mock Data Methods
  private getMockUserProfile(): ApiResponse<UserProfile> {
    return {
      success: true,
      data: {
        id: 1,
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        age: 28,
        profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        completeness: 85,
        location: 'New York, NY',
        occupation: 'Software Engineer',
        lastActive: new Date().toISOString(),
        isOnline: true
      }
    };
  }

  private getMockMatches(): ApiResponse<PaginatedResponse<Match>> {
    return {
      success: true,
      data: {
        data: [
          {
            id: 1,
            name: 'Sarah Johnson',
            firstName: 'Sarah',
            lastName: 'Johnson',
            photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            age: 26,
            location: 'Brooklyn, NY',
            compatibilityScore: 92,
            matchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            isNew: true,
            lastActive: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Emily Chen',
            firstName: 'Emily',
            lastName: 'Chen',
            photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            age: 24,
            location: 'Manhattan, NY',
            compatibilityScore: 88,
            matchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            isNew: false,
            lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            name: 'Jessica Williams',
            firstName: 'Jessica',
            lastName: 'Williams',
            photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            age: 27,
            location: 'Queens, NY',
            compatibilityScore: 85,
            matchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: false,
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 4,
            name: 'Amanda Davis',
            firstName: 'Amanda',
            lastName: 'Davis',
            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
            age: 25,
            location: 'Bronx, NY',
            compatibilityScore: 90,
            matchedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: false,
            lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        ],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 4,
        from: 1,
        to: 4
      }
    };
  }

  private getMockChatConversations(): ApiResponse<PaginatedResponse<ChatConversation>> {
    return {
      success: true,
      data: {
        data: [
          {
            id: 1,
            userId: 1,
            name: 'Sarah Johnson',
            photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            lastMessage: 'Hey! I loved your profile. Would you like to grab coffee sometime? ☕',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            unreadCount: 2,
            isOnline: true,
            lastActive: new Date().toISOString()
          },
          {
            id: 2,
            userId: 2,
            name: 'Emily Chen',
            photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            lastMessage: 'Thanks for the match! I think we have a lot in common 💕',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            unreadCount: 0,
            isOnline: false,
            lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            userId: 3,
            name: 'Jessica Williams',
            photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            lastMessage: 'I saw you like hiking too! Any favorite trails in the area? 🏔️',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            unreadCount: 1,
            isOnline: true,
            lastActive: new Date().toISOString()
          }
        ],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 3,
        from: 1,
        to: 3
      }
    };
  }

  private getMockNotifications(): ApiResponse<NotificationSummary> {
    return {
      success: true,
      data: {
        count: 5,
        unreadCount: 3,
        items: [
          {
            id: 1,
            message: 'Sarah Johnson liked your profile! ❤️',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            type: 'like',
            isRead: false,
            userId: 1,
            photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face'
          },
          {
            id: 2,
            message: 'New message from Emily Chen 💬',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            type: 'message',
            isRead: false,
            userId: 2,
            photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face'
          },
          {
            id: 3,
            message: 'Jessica Williams viewed your profile 👁️',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            type: 'view',
            isRead: false,
            userId: 3,
            photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face'
          },
          {
            id: 4,
            message: 'You have 5 new matches today! 🎉',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            type: 'system',
            isRead: true
          },
          {
            id: 5,
            message: 'Your profile was featured in today\'s picks! ⭐',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            type: 'system',
            isRead: true
          }
        ]
      }
    };
  }

  private getMockSubscription(): ApiResponse<Subscription> {
    return {
      success: true,
      data: {
        tier: 'premium',
        status: 'active',
        planName: 'Premium Plan',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: [
          'Unlimited likes',
          'See who liked you',
          'Advanced search filters',
          'Priority customer support',
          'Profile boost'
        ],
        price: 29.99,
        currency: 'USD'
      }
    };
  }

  private getMockDashboardStats(): ApiResponse<DashboardStats> {
    return {
      success: true,
      data: {
        totalMatches: 24,
        newMessages: 8,
        profileViews: 156,
        likesReceived: 42,
        activeSubscriptions: 1,
        profileCompletion: 85,
        unreadNotifications: 3
      }
    };
  }

  private getMockSearchPreferences(): ApiResponse<SearchPreferences> {
    return {
      success: true,
      data: {
        ageRange: {
          min: 23,
          max: 32
        },
        location: 'New York, NY',
        distance: 25,
        interests: ['Travel', 'Music', 'Cooking', 'Fitness', 'Reading'],
        lastSearch: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Horoscope Compatibility Preview
  // ═══════════════════════════════════════════════════════════════════════════

  getHoroscopeCompatibilityPreview(): Observable<ApiResponse<HoroscopeCompatibilityPreview>> {
    return this.http.get<ApiResponse<HoroscopeCompatibilityPreview>>(
      `${this.apiUrl}/dashboard/horoscope-preview`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      delay(300),
      catchError(this.handleError('getHoroscopeCompatibilityPreview', this.getMockHoroscopePreview()))
    );
  }

  getDailyHoroscopeReading(): Observable<ApiResponse<DailyHoroscopeReading>> {
    return this.http.get<ApiResponse<DailyHoroscopeReading>>(
      `${this.apiUrl}/horoscope/daily`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError('getDailyHoroscopeReading', this.getMockDailyReading()))
    );
  }

  private getMockHoroscopePreview(): ApiResponse<HoroscopeCompatibilityPreview> {
    return {
      success: true,
      data: {
        hasHoroscope: true,
        userSign: 'Leo',
        userMoonSign: 'Aries',
        topMatches: [
          {
            userId: 101,
            name: 'Maya Patel',
            photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
            age: 27,
            location: 'Mumbai, India',
            zodiacSign: 'Sagittarius',
            moonSign: 'Leo',
            compatibilityScore: 92,
            compatibilityGrade: 'excellent',
            keyFactors: ['Fire signs harmony', 'Mutual moon compatibility'],
            lastActive: new Date().toISOString()
          },
          {
            userId: 102,
            name: 'Priya Sharma',
            photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
            age: 25,
            location: 'Delhi, India',
            zodiacSign: 'Aries',
            moonSign: 'Sagittarius',
            compatibilityScore: 88,
            compatibilityGrade: 'very_good',
            keyFactors: ['Perfect nakshatra match', 'Strong planetary alignment'],
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            userId: 103,
            name: 'Ananya Reddy',
            photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
            age: 26,
            location: 'Bangalore, India',
            zodiacSign: 'Gemini',
            moonSign: 'Libra',
            compatibilityScore: 84,
            compatibilityGrade: 'good',
            keyFactors: ['Air-fire element balance', 'Favorable guna matching'],
            lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          }
        ],
        dailyReading: {
          general: 'Venus aligns with your moon, bringing romantic opportunities today.',
          love: 'An unexpected connection may spark feelings of deep attraction.',
          luckyNumbers: [7, 14, 21],
          luckyColors: ['Gold', 'Orange', 'Red'],
          compatibleSignsToday: ['Sagittarius', 'Aries', 'Libra'],
          date: new Date().toISOString().split('T')[0]
        }
      }
    };
  }

  private getMockDailyReading(): ApiResponse<DailyHoroscopeReading> {
    return {
      success: true,
      data: {
        general: 'The stars favor new beginnings in love.',
        love: 'Open your heart to unexpected connections.',
        luckyNumbers: [3, 7, 12],
        luckyColors: ['Purple', 'Silver'],
        compatibleSignsToday: ['Aries', 'Leo', 'Sagittarius'],
        date: new Date().toISOString().split('T')[0]
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Favorites / Shortlist
  // ═══════════════════════════════════════════════════════════════════════════

  getFavorites(limit: number = 4): Observable<ApiResponse<FavoritesResponse>> {
    return this.http.get<ApiResponse<FavoritesResponse>>(
      `${this.apiUrl}/matches?type=favorites&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      delay(350),
      catchError(this.handleError('getFavorites', this.getMockFavorites()))
    );
  }

  removeFromFavorites(favoriteId: number): Observable<ApiResponse<{ success: boolean }>> {
    return this.http.delete<ApiResponse<{ success: boolean }>>(
      `${this.apiUrl}/matches/favorites/${favoriteId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError('removeFromFavorites', { success: true, data: { success: true } }))
    );
  }

  private getMockFavorites(): ApiResponse<FavoritesResponse> {
    return {
      success: true,
      data: {
        favorites: [
          {
            id: 1,
            favoriteId: 201,
            userId: 201,
            name: 'Aisha Khan',
            firstName: 'Aisha',
            photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
            age: 26,
            location: 'Hyderabad, India',
            occupation: 'Data Scientist',
            compatibilityScore: 89,
            isOnline: true,
            lastActive: new Date().toISOString(),
            savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            isPremium: true
          },
          {
            id: 2,
            favoriteId: 202,
            userId: 202,
            name: 'Sneha Joshi',
            firstName: 'Sneha',
            photoUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face',
            age: 24,
            location: 'Pune, India',
            occupation: 'Marketing Manager',
            compatibilityScore: 85,
            isOnline: false,
            lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            isPremium: false
          },
          {
            id: 3,
            favoriteId: 203,
            userId: 203,
            name: 'Ritika Gupta',
            firstName: 'Ritika',
            photoUrl: 'https://images.unsplash.com/photo-1502767089025-6572583495b9?w=150&h=150&fit=crop&crop=face',
            age: 27,
            location: 'Chennai, India',
            occupation: 'Architect',
            compatibilityScore: 82,
            isOnline: true,
            lastActive: new Date().toISOString(),
            savedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            isPremium: true
          },
          {
            id: 4,
            favoriteId: 204,
            userId: 204,
            name: 'Kavya Nair',
            firstName: 'Kavya',
            photoUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=150&h=150&fit=crop&crop=face',
            age: 25,
            location: 'Kochi, India',
            occupation: 'Doctor',
            compatibilityScore: 78,
            isOnline: false,
            lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            savedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            isPremium: false
          }
        ],
        total: 12,
        hasMore: true
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Who Viewed Me
  // ═══════════════════════════════════════════════════════════════════════════

  getProfileViewers(limit: number = 5): Observable<ApiResponse<ProfileViewsResponse>> {
    return this.http.get<ApiResponse<ProfileViewsResponse>>(
      `${this.apiUrl}/insights/profile-views?limit=${limit}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      delay(400),
      catchError(this.handleError('getProfileViewers', this.getMockProfileViewers()))
    );
  }

  private getMockProfileViewers(): ApiResponse<ProfileViewsResponse> {
    return {
      success: true,
      data: {
        viewers: [
          {
            id: 1,
            viewId: 301,
            viewerId: 301,
            name: 'Neha Verma',
            firstName: 'Neha',
            photoUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop&crop=face',
            age: 26,
            location: 'Kolkata, India',
            occupation: 'Software Engineer',
            isOnline: true,
            lastActive: new Date().toISOString(),
            viewedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            isPremium: true,
            isAnonymous: false,
            deviceType: 'mobile'
          },
          {
            id: 2,
            viewId: 302,
            viewerId: 302,
            name: 'Pooja Singh',
            firstName: 'Pooja',
            photoUrl: 'https://images.unsplash.com/photo-1523264939339-c89f9dadde2e?w=150&h=150&fit=crop&crop=face',
            age: 24,
            location: 'Jaipur, India',
            occupation: 'Teacher',
            isOnline: false,
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            isPremium: false,
            isAnonymous: false,
            deviceType: 'desktop'
          },
          {
            id: 3,
            viewId: 303,
            viewerId: 303,
            name: 'Anonymous',
            firstName: 'Anonymous',
            photoUrl: '',
            age: 0,
            location: '',
            isOnline: false,
            viewedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            isPremium: false,
            isAnonymous: true,
            deviceType: 'mobile'
          },
          {
            id: 4,
            viewId: 304,
            viewerId: 304,
            name: 'Divya Menon',
            firstName: 'Divya',
            photoUrl: 'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=150&h=150&fit=crop&crop=face',
            age: 27,
            location: 'Ahmedabad, India',
            occupation: 'Business Analyst',
            isOnline: true,
            lastActive: new Date().toISOString(),
            viewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            isPremium: true,
            isAnonymous: false,
            deviceType: 'tablet'
          },
          {
            id: 5,
            viewId: 305,
            viewerId: 305,
            name: 'Sana Ahmed',
            firstName: 'Sana',
            photoUrl: 'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=150&h=150&fit=crop&crop=face',
            age: 25,
            location: 'Lucknow, India',
            occupation: 'HR Manager',
            isOnline: false,
            lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            isPremium: false,
            isAnonymous: false,
            deviceType: 'mobile'
          }
        ],
        totalViews: 156,
        uniqueViewers: 89,
        todayViews: 12,
        hasMore: true,
        isPremiumRequired: false
      }
    };
  }
}
