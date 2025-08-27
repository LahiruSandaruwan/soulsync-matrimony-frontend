import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BrowseService } from '../../core/services/browse.service';
import { MatchService } from '../../core/services/match.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { UserCardComponent, UserCard } from '../../shared/components/user-card/user-card.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-browse-recent',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    LoadingSpinnerComponent, 
    UserCardComponent,
    PaginationComponent
  ],
  templateUrl: './browse-recent.component.html',
  styleUrls: ['./browse-recent.component.scss']
})
export class BrowseRecentComponent implements OnInit, OnDestroy {
  users: UserCard[] = [];
  loading = false;
  loadingMore = false;
  hasMoreUsers = false;
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  pageSize = 20;
  
  // Filter options for recent profiles
  filters = {
    period: '7', // days
    ageMin: null as number | null,
    ageMax: null as number | null,
    location: '',
    gender: ''
  };

  periodOptions = [
    { value: '1', label: 'Last 24 hours' },
    { value: '7', label: 'Last week' },
    { value: '30', label: 'Last month' },
    { value: '90', label: 'Last 3 months' }
  ];

  genderOptions = [
    { value: '', label: 'All Genders' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private browseService: BrowseService,
    private matchService: MatchService
  ) {}

  ngOnInit(): void {
    this.loadRecentProfiles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load recently joined profiles from API
   */
  loadRecentProfiles(): void {
    this.loading = true;
    
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      period: this.filters.period,
      ...(this.filters.ageMin && { age_min: this.filters.ageMin }),
      ...(this.filters.ageMax && { age_max: this.filters.ageMax }),
      ...(this.filters.location && { location: this.filters.location }),
      ...(this.filters.gender && { gender: this.filters.gender })
    };

    this.browseService.getRecent()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.users = response.data.profiles || response.data || [];
            this.totalUsers = response.data.pagination?.total || this.users.length;
            this.totalPages = response.data.pagination?.total_pages || 1;
            this.hasMoreUsers = response.data.pagination?.has_more || false;
          } else {
            this.users = [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading recent profiles:', error);
          this.users = [];
          this.loading = false;
        }
      });
  }

  /**
   * Handle filter changes
   */
  onFilterChange(): void {
    this.currentPage = 1;
    this.loadRecentProfiles();
  }

  /**
   * Handle period changes
   */
  onPeriodChange(period: string): void {
    this.filters.period = period;
    this.onFilterChange();
  }

  /**
   * Handle page changes
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRecentProfiles();
  }

  /**
   * Handle like action
   */
  onLike(userId: number): void {
    this.matchService.likeUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Update user in list
            const user = this.users.find(u => u.id === userId);
            if (user) {
              (user as any).is_liked = true;
            }
          }
        },
        error: (error) => {
          console.error('Error liking user:', error);
        }
      });
  }

  /**
   * Handle dislike action
   */
  onDislike(userId: number): void {
    this.matchService.dislikeUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Remove user from list
            this.users = this.users.filter(u => u.id !== userId);
          }
        },
        error: (error) => {
          console.error('Error disliking user:', error);
        }
      });
  }

  /**
   * Handle super like action
   */
  onSuperLike(userId: number): void {
    this.matchService.superLikeUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Update user in list
            const user = this.users.find(u => u.id === userId);
            if (user) {
              (user as any).is_super_liked = true;
            }
          }
        },
        error: (error) => {
          console.error('Error super liking user:', error);
        }
      });
  }

  /**
   * Handle view profile action
   */
  onViewProfile(userId: number): void {
    // Navigate to user profile
    // This will be handled by router
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filters = {
      period: '7',
      ageMin: null,
      ageMax: null,
      location: '',
      gender: ''
    };
    this.onFilterChange();
  }

  /**
   * Track function for ngFor performance
   */
  trackByUserId(index: number, user: UserCard): number {
    return user.id;
  }

  /**
   * Get recent members badge text
   */
  getRecentBadgeText(): string {
    const periodLabels: { [key: string]: string } = {
      '1': 'today',
      '7': 'this week',
      '30': 'this month',
      '90': 'in 3 months'
    };
    const period = periodLabels[this.filters.period] || 'recently';
    return `${this.totalUsers} members joined ${period}`;
  }

  /**
   * Get join date display text
   */
  getJoinDateText(user: any): string {
    if (!user.created_at) return 'Recently joined';
    
    const joinDate = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Joined today';
    if (diffDays <= 7) return `Joined ${diffDays} days ago`;
    if (diffDays <= 30) return `Joined ${Math.ceil(diffDays / 7)} weeks ago`;
    return `Joined ${Math.ceil(diffDays / 30)} months ago`;
  }
}