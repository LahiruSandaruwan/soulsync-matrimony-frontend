import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, catchError, of, Observable } from 'rxjs';
import { DashboardService } from './services/dashboard.service';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';
import { TopLiveProfilesComponent } from '../shared/components/top-live-profiles/top-live-profiles.component';
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
  FavoriteProfile,
  FavoritesResponse,
  ProfileViewsResponse
} from './models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, TopLiveProfilesComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data observables
  userProfile$!: Observable<ApiResponse<UserProfile>>;
  matches$!: Observable<ApiResponse<PaginatedResponse<Match>>>;
  chatConversations$!: Observable<ApiResponse<PaginatedResponse<ChatConversation>>>;
  notifications$!: Observable<ApiResponse<NotificationSummary>>;
  subscription$!: Observable<ApiResponse<Subscription>>;
  dashboardStats$!: Observable<ApiResponse<DashboardStats>>;
  searchPreferences$!: Observable<ApiResponse<SearchPreferences>>;
  horoscopePreview$!: Observable<ApiResponse<HoroscopeCompatibilityPreview>>;
  favorites$!: Observable<ApiResponse<FavoritesResponse>>;
  profileViewers$!: Observable<ApiResponse<ProfileViewsResponse>>;

  // Loading state
  loading$!: Observable<boolean>;

  // Local data
  userProfile: UserProfile | null = null;
  matches: Match[] = [];
  chatConversations: ChatConversation[] = [];
  notifications: NotificationSummary | null = null;
  subscription: Subscription | null = null;
  dashboardStats: DashboardStats | null = null;
  searchPreferences: SearchPreferences | null = null;
  horoscopePreview: HoroscopeCompatibilityPreview | null = null;
  favorites: FavoriteProfile[] = [];
  favoritesTotal = 0;
  favoritesHasMore = false;
  profileViewers: ProfileViewsResponse | null = null;

  // UI state
  showNotifications = false;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize observables
    this.userProfile$ = this.dashboardService.getUserProfile();
    this.matches$ = this.dashboardService.getMatches();
    this.chatConversations$ = this.dashboardService.getChatConversations();
    this.notifications$ = this.dashboardService.getNotifications();
    this.subscription$ = this.dashboardService.getSubscription();
    this.dashboardStats$ = this.dashboardService.getDashboardStats();
    this.searchPreferences$ = this.dashboardService.getSearchPreferences();
    this.horoscopePreview$ = this.dashboardService.getHoroscopeCompatibilityPreview();
    this.favorites$ = this.dashboardService.getFavorites(4);
    this.profileViewers$ = this.dashboardService.getProfileViewers(5);
    this.loading$ = this.dashboardService.loading$;

    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAllData(): void {
    // Load all data in parallel
    forkJoin({
      userProfile: this.userProfile$.pipe(catchError(() => of(null))),
      matches: this.matches$.pipe(catchError(() => of(null))),
      chatConversations: this.chatConversations$.pipe(catchError(() => of(null))),
      notifications: this.notifications$.pipe(catchError(() => of(null))),
      subscription: this.subscription$.pipe(catchError(() => of(null))),
      dashboardStats: this.dashboardStats$.pipe(catchError(() => of(null))),
      searchPreferences: this.searchPreferences$.pipe(catchError(() => of(null))),
      horoscopePreview: this.horoscopePreview$.pipe(catchError(() => of(null))),
      favorites: this.favorites$.pipe(catchError(() => of(null))),
      profileViewers: this.profileViewers$.pipe(catchError(() => of(null)))
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.processData(data);
      },
      error: (error) => {
        this.error = 'Failed to load dashboard data. Please try again.';
        console.error('Dashboard loading error:', error);
      }
    });
  }

  private processData(data: any): void {
    this.userProfile = data.userProfile?.data || null;
    this.matches = data.matches?.data?.data || [];
    this.chatConversations = data.chatConversations?.data?.data || [];
    this.notifications = data.notifications?.data || null;
    this.subscription = data.subscription?.data || null;
    this.dashboardStats = data.dashboardStats?.data || null;
    this.searchPreferences = data.searchPreferences?.data || null;

    // Process new widget data
    this.horoscopePreview = data.horoscopePreview?.data || null;

    const favoritesData = data.favorites?.data;
    if (favoritesData) {
      this.favorites = favoritesData.favorites || [];
      this.favoritesTotal = favoritesData.total || 0;
      this.favoritesHasMore = favoritesData.hasMore || false;
    }

    this.profileViewers = data.profileViewers?.data || null;
  }

  // UI Methods
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  refreshData(): void {
    this.error = '';
    this.loadAllData();
  }

  // Navigation Methods
  onViewProfile(): void {
    this.router.navigate(['/app/profile']);
  }

  onViewMatches(): void {
    this.router.navigate(['/app/matches']);
  }

  onViewChat(conversationId: number): void {
    this.router.navigate(['/app/chat', conversationId]);
  }

  onViewAllChats(): void {
    this.router.navigate(['/app/chat']);
  }

  onViewNotifications(): void {
    this.router.navigate(['/app/notifications']);
  }

  onViewSubscription(): void {
    this.router.navigate(['/app/subscription']);
  }

  onSearch(): void {
    this.router.navigate(['/app/search']);
  }

  // New Widget Navigation Methods
  onViewHoroscope(): void {
    this.router.navigate(['/app/horoscope']);
  }

  onSetupHoroscope(): void {
    this.router.navigate(['/app/horoscope/setup']);
  }

  onViewFavorites(): void {
    this.router.navigate(['/app/matches'], { queryParams: { tab: 'favorites' } });
  }

  onViewAllViewers(): void {
    this.router.navigate(['/app/insights/profile-views']);
  }

  onViewUserProfile(userId: number): void {
    this.router.navigate(['/app/users', userId]);
  }

  onRemoveFavorite(favoriteId: number): void {
    this.dashboardService.removeFromFavorites(favoriteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.favorites = this.favorites.filter(f => f.favoriteId !== favoriteId);
          this.favoritesTotal = Math.max(0, this.favoritesTotal - 1);
        },
        error: (error) => {
          console.error('Failed to remove favorite:', error);
        }
      });
  }

  onLikeViewer(viewerId: number): void {
    this.router.navigate(['/app/users', viewerId]);
  }

  // Utility Methods
  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  }

  getCompatibilityColor(score: number): string {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 80) return '#F59E0B'; // Yellow
    if (score >= 70) return '#F97316'; // Orange
    return '#EF4444'; // Red
  }

  getSubscriptionColor(tier: string): string {
    switch (tier) {
      case 'vip': return '#8B5CF6'; // Purple
      case 'premium': return '#F59E0B'; // Yellow
      default: return '#6B7280'; // Gray
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'like': return '❤️';
      case 'message': return '💬';
      case 'view': return '👁️';
      case 'match': return '💕';
      default: return '🔔';
    }
  }

  // Skeleton loading methods
  getSkeletonArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  // Horoscope utility methods
  getZodiacEmoji(sign: string | null | undefined): string {
    if (!sign) return '⭐';
    const zodiacEmojis: { [key: string]: string } = {
      'Aries': '♈',
      'Taurus': '♉',
      'Gemini': '♊',
      'Cancer': '♋',
      'Leo': '♌',
      'Virgo': '♍',
      'Libra': '♎',
      'Scorpio': '♏',
      'Sagittarius': '♐',
      'Capricorn': '♑',
      'Aquarius': '♒',
      'Pisces': '♓'
    };
    return zodiacEmojis[sign] || '⭐';
  }

  formatCompatibilityGrade(grade: string | undefined): string {
    if (!grade) return 'Unknown';
    const gradeLabels: { [key: string]: string } = {
      'excellent': 'Excellent Match',
      'very_good': 'Very Good',
      'good': 'Good Match',
      'average': 'Average',
      'low': 'Low Compatibility'
    };
    return gradeLabels[grade] || grade;
  }

  getDeviceIcon(deviceType: string | undefined): string {
    const icons: { [key: string]: string } = {
      'mobile': '📱',
      'desktop': '💻',
      'tablet': '📲'
    };
    return icons[deviceType || ''] || '📱';
  }
}
