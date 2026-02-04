import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, forkJoin, catchError, of, map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AdminSettingsService } from '../../core/services/admin-settings.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalMatches: number;
  totalConversations: number;
  totalReports: number;
  pendingReports: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  growthRate: number;
}

interface RecentActivity {
  id: number;
  type: 'user_registration' | 'match_created' | 'report_submitted' | 'payment_received';
  description: string;
  user?: any;
  created_at: string;
}

interface TopUsers {
  id: number;
  name: string;
  email: string;
  profile_completion: number;
  matches_count: number;
  last_active: string;
  subscription_status: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  error = '';
  
  stats: AdminStats = {
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalMatches: 0,
    totalConversations: 0,
    totalReports: 0,
    pendingReports: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
    growthRate: 0
  };

  recentActivity: RecentActivity[] = [];
  topUsers: TopUsers[] = [];
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private adminService: AdminSettingsService
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

    // Load all dashboard data in parallel
    forkJoin({
      stats: this.loadStats(),
      activity: this.loadRecentActivity(),
      users: this.loadTopUsers()
    })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.error = 'Failed to load dashboard data';
          return of({ 
            stats: this.stats, 
            activity: [] as RecentActivity[], 
            users: [] as TopUsers[] 
          });
        })
      )
      .subscribe({
        next: (data) => {
          if (data.stats) {
            this.stats = data.stats as AdminStats;
          }
          this.recentActivity = data.activity as RecentActivity[];
          this.topUsers = data.users as TopUsers[];
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load dashboard data';
          this.loading = false;
        }
      });
  }

  private loadStats(): any {
    return this.adminService.getDashboardStats().pipe(
      map((data: any) => ({
        totalUsers: data.total_users || 0,
        activeUsers: data.active_users || 0,
        premiumUsers: data.premium_users || 0,
        totalMatches: data.total_matches || 0,
        totalConversations: data.total_messages || 0,
        totalReports: data.pending_reports || 0,
        pendingReports: data.pending_reports || 0,
        revenueThisMonth: data.monthly_revenue || 0,
        revenueLastMonth: (data.monthly_revenue || 0) / (1 + (data.revenue_growth_rate || 0) / 100),
        growthRate: data.user_growth_rate || 0
      })),
      catchError(() => of(this.stats))
    );
  }

  private loadRecentActivity(): any {
    return this.adminService.getDetailedStats(7).pipe(
      map((data: any) => {
        const activities: RecentActivity[] = [];

        // Convert recent users to activity items
        if (data.recent_activity?.recent_users) {
          data.recent_activity.recent_users.forEach((user: any, index: number) => {
            activities.push({
              id: index + 1,
              type: 'user_registration',
              description: `${user.first_name} ${user.last_name} registered`,
              user: { name: `${user.first_name} ${user.last_name}` },
              created_at: user.created_at
            });
          });
        }

        // Convert recent matches to activity items
        if (data.recent_activity?.recent_matches) {
          data.recent_activity.recent_matches.forEach((match: any, index: number) => {
            activities.push({
              id: 100 + index,
              type: 'match_created',
              description: `${match.user1} matched with ${match.user2}`,
              user: { name: match.user1 },
              created_at: match.matched_at
            });
          });
        }

        // Convert recent reports to activity items
        if (data.recent_activity?.recent_reports) {
          data.recent_activity.recent_reports.forEach((report: any, index: number) => {
            activities.push({
              id: 200 + index,
              type: 'report_submitted',
              description: `${report.reporter} reported ${report.reported_user}: ${report.reason}`,
              user: { name: report.reporter },
              created_at: report.created_at
            });
          });
        }

        // Sort by date and return top 10
        return activities
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10);
      }),
      catchError(() => of([]))
    );
  }

  private loadTopUsers(): any {
    return this.adminService.getDetailedStats(30).pipe(
      map((data: any) => {
        const topUsers: TopUsers[] = [];

        if (data.top_metrics?.most_active_users) {
          data.top_metrics.most_active_users.forEach((user: any) => {
            topUsers.push({
              id: user.id,
              name: `${user.first_name} ${user.last_name}`,
              email: '',
              profile_completion: 100,
              matches_count: user.sent_messages_count || 0,
              last_active: new Date().toISOString(),
              subscription_status: 'active'
            });
          });
        }

        return topUsers;
      }),
      catchError(() => of([]))
    );
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user_registration': return '👤';
      case 'match_created': return '💕';
      case 'report_submitted': return '🚨';
      case 'payment_received': return '💰';
      default: return '📝';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'user_registration': return 'text-blue-600';
      case 'match_created': return 'text-pink-600';
      case 'report_submitted': return 'text-red-600';
      case 'payment_received': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onViewUser(userId: number): void {
    // Navigate to user management
    console.log('View user:', userId);
  }

  onViewReports(): void {
    // Navigate to reports
    console.log('View reports');
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
