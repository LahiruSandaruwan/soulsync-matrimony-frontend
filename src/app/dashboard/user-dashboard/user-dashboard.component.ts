import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { MatchService } from '../../core/services/match.service';
import { ChatService } from '../../core/services/chat.service';
import { ProfileService } from '../../core/services/profile.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserCardComponent } from '../../shared/components/user-card/user-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface DashboardStats {
  totalMatches: number;
  newMessages: number;
  profileViews: number;
  activeSubscriptions: number;
  profileCompletion: number;
  unreadNotifications: number;
}

interface RecentMatch {
  id: number;
  user: any;
  matched_at: string;
  compatibility_score: number;
}

interface RecentMessage {
  id: number;
  conversation_id: number;
  sender: any;
  content: string;
  created_at: string;
  is_read: boolean;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    UserCardComponent, 
    LoadingSpinnerComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  error = '';
  
  stats: DashboardStats = {
    totalMatches: 0,
    newMessages: 0,
    profileViews: 0,
    activeSubscriptions: 0,
    profileCompletion: 0,
    unreadNotifications: 0
  };

  recentMatches: RecentMatch[] = [];
  recentMessages: RecentMessage[] = [];
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private matchService: MatchService,
    private chatService: ChatService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    console.log('Loading dashboard data...');

    // Load all dashboard data in parallel
    forkJoin({
      matches: this.matchService.getMatches().pipe(catchError((err) => {
        console.error('Matches error:', err);
        return of({ data: [] });
      })),
      conversations: this.chatService.getConversations().pipe(catchError((err) => {
        console.error('Conversations error:', err);
        return of({ data: [] });
      })),
      profileCompletion: this.profileService.getProfileCompletion().pipe(catchError((err) => {
        console.error('Profile completion error:', err);
        return of({ completion_percentage: 0 });
      })),
      unreadCount: this.notificationService.unreadCount$.pipe(catchError((err) => {
        console.error('Unread count error:', err);
        return of(0);
      })),
      profile: this.profileService.getProfile().pipe(catchError((err) => {
        console.error('Profile error:', err);
        return of(null);
      }))
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        console.log('Dashboard data loaded:', data);
        this.processDashboardData(data);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
        console.error('Dashboard loading error:', error);
      }
    });
  }

  private processDashboardData(data: any): void {
    // Process matches
    const matches = data.matches?.data || [];
    this.stats.totalMatches = matches.length;
    this.recentMatches = matches.slice(0, 5).map((match: any) => ({
      id: match.id,
      user: match.user,
      matched_at: match.created_at,
      compatibility_score: match.compatibility_score || 0
    }));

    // Process conversations and messages
    const conversations = data.conversations?.data || [];
    this.stats.newMessages = conversations.reduce((total: number, conv: any) => 
      total + (conv.unread_count || 0), 0);
    
    this.recentMessages = conversations
      .filter((conv: any) => conv.last_message)
      .slice(0, 5)
      .map((conv: any) => ({
        id: conv.last_message.id,
        conversation_id: conv.id,
        sender: conv.last_message.sender,
        content: conv.last_message.content,
        created_at: conv.last_message.created_at,
        is_read: conv.last_message.is_read
      }));

    // Process profile data
    this.stats.profileCompletion = data.profileCompletion?.completion_percentage || 0;
    
    if (data.profile) {
      this.stats.profileViews = data.profile.profile_views || 0;
    }

    // Process subscription data
    if (this.currentUser?.subscription) {
      this.stats.activeSubscriptions = this.currentUser.subscription.status === 'active' ? 1 : 0;
    }

    // Process notifications
    this.stats.unreadNotifications = data.unreadCount || 0;
  }

  onViewProfile(userId: number): void {
    this.router.navigate(['/app/profile']);
  }

  onViewConversation(conversationId: number): void {
    this.router.navigate(['/app/chat', conversationId]);
  }

  onViewMatches(): void {
    this.router.navigate(['/app/matches']);
  }

  onViewMessages(): void {
    this.router.navigate(['/app/chat']);
  }

  onCompleteProfile(): void {
    this.router.navigate(['/app/profile/edit']);
  }

  refreshData(): void {
    this.loadDashboardData();
  }
} 