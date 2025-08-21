import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BrowseService } from '../../core/services/browse.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-browse-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './browse-list.component.html',
  styleUrls: ['./browse-list.component.scss']
})
export class BrowseListComponent implements OnInit, OnDestroy {
  users: any[] = [];
  loading = false;
  loadingMore = false;
  hasMoreUsers = false;
  currentFilter = 'all';
  private destroy$ = new Subject<void>();

  constructor(private browse: BrowseService) {}

  ngOnInit(): void { this.loadAll(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadAll(): void {
    this.loading = true;
    this.browse.getAll().pipe(takeUntil(this.destroy$)).subscribe({ next: d => { this.users = d; this.loading = false; }, error: _ => this.loading = false });
  }
  loadPremium(): void {
    this.loading = true;
    this.browse.getPremium().pipe(takeUntil(this.destroy$)).subscribe({ next: d => { this.users = d; this.loading = false; }, error: _ => this.loading = false });
  }
  loadRecent(): void {
    this.loading = true;
    this.browse.getRecent().pipe(takeUntil(this.destroy$)).subscribe({ next: d => { this.users = d; this.loading = false; }, error: _ => this.loading = false });
  }
  loadVerified(): void {
    this.loading = true;
    this.currentFilter = 'verified';
    this.browse.getVerified().pipe(takeUntil(this.destroy$)).subscribe({ next: d => { this.users = d; this.loading = false; }, error: _ => this.loading = false });
  }

  /**
   * Handle image loading errors
   * @param event Error event
   */
  onImageError(event: any): void {
    event.target.src = '/assets/images/default-avatar.png';
  }

  /**
   * Like a user profile
   * @param userId User ID to like
   */
  onLike(userId: number): void {
    // Find user and update like status
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.is_liked = true;
    }
    // API call would go here
  }

  /**
   * Unlike a user profile
   * @param userId User ID to unlike
   */
  onUnlike(userId: number): void {
    // Find user and update like status
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.is_liked = false;
    }
    // API call would go here
  }

  /**
   * Load more users
   */
  loadMore(): void {
    this.loadingMore = true;
    // Implementation would load next page based on current filter
    setTimeout(() => {
      this.loadingMore = false;
      this.hasMoreUsers = false; // For demo purposes
    }, 1000);
  }

  /**
   * Track function for ngFor performance
   * @param index Index
   * @param user User object
   * @returns User ID
   */
  trackByUserId(index: number, user: any): number {
    return user.id;
  }
}


