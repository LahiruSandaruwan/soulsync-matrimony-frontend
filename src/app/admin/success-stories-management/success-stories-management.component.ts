import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SuccessStoryService } from '../../core/services/success-story.service';
import { SuccessStory, SuccessStoryStats, SuccessStoryStatus } from '../../core/models/success-story.model';
import { OptimizedImageComponent } from '../../shared/components/optimized-image/optimized-image.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-success-stories-management',
  standalone: true,
  imports: [CommonModule, FormsModule, OptimizedImageComponent, PaginationComponent],
  templateUrl: './success-stories-management.component.html',
  styleUrls: ['./success-stories-management.component.scss']
})
export class SuccessStoriesManagementComponent implements OnInit, OnDestroy {
  stories: SuccessStory[] = [];
  stats: SuccessStoryStats | null = null;
  loading = true;
  error = '';

  // Filters
  statusFilter: SuccessStoryStatus | 'all' = 'all';
  searchQuery = '';
  featuredFilter: 'all' | 'featured' | 'not_featured' = 'all';

  // Pagination
  currentPage = 1;
  lastPage = 1;
  perPage = 20;

  // Modal
  showModal = false;
  modalMode: 'view' | 'approve' | 'reject' = 'view';
  selectedStory: SuccessStory | null = null;
  actionNotes = '';
  rejectReason = '';
  featureOnApprove = false;

  // Selection
  selectedIds: Set<number> = new Set();

  private destroy$ = new Subject<void>();

  constructor(private successStoryService: SuccessStoryService) {}

  ngOnInit(): void {
    this.loadStories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStories(page: number = 1): void {
    this.loading = true;
    this.error = '';
    this.currentPage = page;

    const params: any = {
      page,
      per_page: this.perPage
    };

    if (this.statusFilter !== 'all') {
      params.status = this.statusFilter;
    }
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    if (this.featuredFilter === 'featured') {
      params.featured = true;
    } else if (this.featuredFilter === 'not_featured') {
      params.featured = false;
    }

    this.successStoryService.getAllStoriesAdmin(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.stories = response.data;
          this.stats = response.stats;
          this.currentPage = response.meta.current_page;
          this.lastPage = response.meta.last_page;
          this.loading = false;
          this.selectedIds.clear();
        },
        error: (err) => {
          this.error = 'Failed to load stories';
          this.loading = false;
          console.error('Error loading stories:', err);
        }
      });
  }

  onSearch(): void {
    this.loadStories(1);
  }

  onFilterChange(): void {
    this.loadStories(1);
  }

  onPageChange(page: number): void {
    this.loadStories(page);
  }

  // Selection
  toggleSelection(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedIds.size === this.stories.length) {
      this.selectedIds.clear();
    } else {
      this.stories.forEach(s => this.selectedIds.add(s.id));
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  get allSelected(): boolean {
    return this.stories.length > 0 && this.selectedIds.size === this.stories.length;
  }

  // Modal
  openModal(mode: 'view' | 'approve' | 'reject', story: SuccessStory): void {
    this.modalMode = mode;
    this.selectedStory = story;
    this.actionNotes = '';
    this.rejectReason = '';
    this.featureOnApprove = false;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedStory = null;
  }

  // Actions
  approveStory(): void {
    if (!this.selectedStory) return;

    this.successStoryService.approveStory(
      this.selectedStory.id,
      this.actionNotes || undefined,
      this.featureOnApprove
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadStories(this.currentPage);
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to approve story';
        }
      });
  }

  rejectStory(): void {
    if (!this.selectedStory || !this.rejectReason) return;

    this.successStoryService.rejectStory(
      this.selectedStory.id,
      this.rejectReason,
      this.actionNotes || undefined
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadStories(this.currentPage);
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to reject story';
        }
      });
  }

  toggleFeatured(story: SuccessStory): void {
    const action = story.featured
      ? this.successStoryService.removeFeatured(story.id)
      : this.successStoryService.setFeatured(story.id);

    action.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadStories(this.currentPage),
      error: (err) => {
        this.error = err?.error?.message || 'Failed to update featured status';
      }
    });
  }

  deleteStory(story: SuccessStory): void {
    if (!confirm(`Are you sure you want to delete "${story.title}"? This cannot be undone.`)) {
      return;
    }

    this.successStoryService.deleteStoryAdmin(story.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadStories(this.currentPage),
        error: (err) => {
          this.error = err?.error?.message || 'Failed to delete story';
        }
      });
  }

  // Bulk Actions
  bulkApprove(): void {
    if (this.selectedIds.size === 0) return;

    this.successStoryService.bulkApprove(Array.from(this.selectedIds))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadStories(this.currentPage),
        error: (err) => {
          this.error = err?.error?.message || 'Failed to bulk approve';
        }
      });
  }

  bulkReject(): void {
    if (this.selectedIds.size === 0) return;

    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    this.successStoryService.bulkReject(Array.from(this.selectedIds), reason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadStories(this.currentPage),
        error: (err) => {
          this.error = err?.error?.message || 'Failed to bulk reject';
        }
      });
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      draft: 'status-draft',
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    };
    return classes[status] || '';
  }
}
