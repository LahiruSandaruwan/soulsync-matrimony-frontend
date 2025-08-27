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
  selector: 'app-browse-verified',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    LoadingSpinnerComponent, 
    UserCardComponent,
    PaginationComponent
  ],
  templateUrl: './browse-verified.component.html',
  styleUrls: ['./browse-verified.component.scss']
})
export class BrowseVerifiedComponent implements OnInit, OnDestroy {
  users: UserCard[] = [];
  loading = false;
  loadingMore = false;
  hasMoreUsers = false;
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  pageSize = 20;
  
  // Filter options for verified profiles
  filters = {
    sortBy: 'verification_date',
    verificationType: 'all',
    ageMin: null as number | null,
    ageMax: null as number | null,
    location: '',
    profession: '',
    education: ''
  };

  sortOptions = [
    { value: 'verification_date', label: 'Recently Verified' },
    { value: 'compatibility', label: 'Best Match' },
    { value: 'active', label: 'Recently Active' },
    { value: 'profile_completion', label: 'Profile Completion' }
  ];

  verificationTypeOptions = [
    { value: 'all', label: 'All Verified' },
    { value: 'photo_verified', label: 'Photo Verified' },
    { value: 'document_verified', label: 'Document Verified' },
    { value: 'phone_verified', label: 'Phone Verified' },
    { value: 'fully_verified', label: 'Fully Verified' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private browseService: BrowseService,
    private matchService: MatchService
  ) {}

  ngOnInit(): void {
    this.loadVerifiedProfiles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load verified profiles from API
   */
  loadVerifiedProfiles(): void {
    this.loading = true;
    
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      sort_by: this.filters.sortBy,
      verification_type: this.filters.verificationType,
      ...(this.filters.ageMin && { age_min: this.filters.ageMin }),
      ...(this.filters.ageMax && { age_max: this.filters.ageMax }),
      ...(this.filters.location && { location: this.filters.location }),
      ...(this.filters.profession && { profession: this.filters.profession }),
      ...(this.filters.education && { education: this.filters.education })
    };

    this.browseService.getVerified()
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
          console.error('Error loading verified profiles:', error);
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
    this.loadVerifiedProfiles();
  }

  /**
   * Handle sort changes
   */
  onSortChange(sortBy: string): void {
    this.filters.sortBy = sortBy;
    this.onFilterChange();
  }

  /**
   * Handle verification type changes
   */
  onVerificationTypeChange(type: string): void {
    this.filters.verificationType = type;
    this.onFilterChange();
  }

  /**
   * Handle page changes
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadVerifiedProfiles();
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
      sortBy: 'verification_date',
      verificationType: 'all',
      ageMin: null,
      ageMax: null,
      location: '',
      profession: '',
      education: ''
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
   * Get verified badge text
   */
  getVerifiedBadgeText(): string {
    return `${this.totalUsers} Verified Members`;
  }

  /**
   * Get verification badges for user
   */
  getVerificationBadges(user: any): string[] {
    const badges: string[] = [];
    
    if (user.is_photo_verified) badges.push('photo');
    if (user.is_document_verified) badges.push('document');
    if (user.is_phone_verified) badges.push('phone');
    if (user.is_email_verified) badges.push('email');
    
    return badges;
  }

  /**
   * Get verification level
   */
  getVerificationLevel(user: any): 'basic' | 'advanced' | 'complete' {
    const badges = this.getVerificationBadges(user);
    
    if (badges.length >= 4) return 'complete';
    if (badges.length >= 2) return 'advanced';
    return 'basic';
  }

  /**
   * Get verification badge color
   */
  getVerificationBadgeColor(type: string): string {
    const colors: { [key: string]: string } = {
      photo: 'bg-blue-500',
      document: 'bg-green-500',
      phone: 'bg-purple-500',
      email: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  }

  /**
   * Get verification badge icon
   */
  getVerificationBadgeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      photo: '📸',
      document: '📄',
      phone: '📱',
      email: '📧'
    };
    return icons[type] || '✓';
  }
}