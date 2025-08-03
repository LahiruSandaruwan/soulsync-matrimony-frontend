import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, forkJoin, catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
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
    private authService: AuthService
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
    // Mock data - replace with actual API call
    return of({
      totalUsers: 1250,
      activeUsers: 890,
      premiumUsers: 320,
      totalMatches: 2150,
      totalConversations: 1890,
      totalReports: 45,
      pendingReports: 12,
      revenueThisMonth: 12500,
      revenueLastMonth: 11800,
      growthRate: 5.9
    });
  }

  private loadRecentActivity(): any {
    // Mock data - replace with actual API call
    return of([
      {
        id: 1,
        type: 'user_registration',
        description: 'New user registered',
        user: { name: 'John Doe', email: 'john@example.com' },
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        type: 'match_created',
        description: 'New match created',
        user: { name: 'Jane Smith', email: 'jane@example.com' },
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        type: 'report_submitted',
        description: 'User report submitted',
        user: { name: 'Bob Wilson', email: 'bob@example.com' },
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ]);
  }

  private loadTopUsers(): any {
    // Mock data - replace with actual API call
    return of([
      {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        profile_completion: 95,
        matches_count: 25,
        last_active: new Date().toISOString(),
        subscription_status: 'premium'
      },
      {
        id: 2,
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        profile_completion: 88,
        matches_count: 18,
        last_active: new Date(Date.now() - 86400000).toISOString(),
        subscription_status: 'basic'
      }
    ]);
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
