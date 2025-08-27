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
  selector: 'app-browse-premium',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    LoadingSpinnerComponent, 
    UserCardComponent,
    PaginationComponent
  ],
  templateUrl: './browse-premium.component.html',
  styleUrls: ['./browse-premium.component.scss']
})
export class BrowsePremiumComponent implements OnInit, OnDestroy {
  users: UserCard[] = [];
  loading = false;
  loadingMore = false;
  hasMoreUsers = false;
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  pageSize = 20;
  
  // Filter options for premium profiles
  filters = {
    sortBy: 'newest',
    ageMin: null as number | null,
    ageMax: null as number | null,
    location: '',
    education: '',
    occupation: ''
  };

  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'compatibility', label: 'Best Match' },
    { value: 'active', label: 'Recently Active' },
    { value: 'verified', label: 'Verified First' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private browseService: BrowseService,
    private matchService: MatchService
  ) {}

  ngOnInit(): void {
    this.loadPremiumProfiles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load premium profiles from API
   */
  loadPremiumProfiles(): void {
    this.loading = true;
    
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      sort_by: this.filters.sortBy,
      ...(this.filters.ageMin && { age_min: this.filters.ageMin }),
      ...(this.filters.ageMax && { age_max: this.filters.ageMax }),
      ...(this.filters.location && { location: this.filters.location }),
      ...(this.filters.education && { education: this.filters.education }),
      ...(this.filters.occupation && { occupation: this.filters.occupation })
    };

    this.browseService.getPremium()
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
          console.error('Error loading premium profiles:', error);
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
    this.loadPremiumProfiles();
  }

  /**
   * Handle sort changes
   */
  onSortChange(sortBy: string): void {
    this.filters.sortBy = sortBy;
    this.onFilterChange();
  }

  /**
   * Handle page changes
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPremiumProfiles();
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
      sortBy: 'newest',
      ageMin: null,
      ageMax: null,
      location: '',
      education: '',
      occupation: ''
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
   * Get premium badge text
   */
  getPremiumBadgeText(): string {
    return `${this.totalUsers} Premium Members`;
  }
}