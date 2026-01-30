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
  PaginatedResponse
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
}
