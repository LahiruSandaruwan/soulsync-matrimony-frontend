import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SuccessStoryService } from '../../core/services/success-story.service';
import { SuccessStoryCard } from '../../core/models/success-story.model';
import { OptimizedImageComponent } from '../../shared/components/optimized-image/optimized-image.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-success-stories-list',
  standalone: true,
  imports: [CommonModule, RouterLink, OptimizedImageComponent, PaginationComponent],
  templateUrl: './success-stories-list.component.html',
  styleUrls: ['./success-stories-list.component.scss']
})
export class SuccessStoriesListComponent implements OnInit, OnDestroy {
  stories: SuccessStoryCard[] = [];
  loading = true;
  error = '';

  // Pagination
  currentPage = 1;
  lastPage = 1;
  totalStories = 0;
  perPage = 12;

  private destroy$ = new Subject<void>();

  constructor(
    private successStoryService: SuccessStoryService,
    private router: Router
  ) {}

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

    this.successStoryService.getApprovedStories({
      page,
      per_page: this.perPage
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.stories = response.data;
          this.currentPage = response.meta.current_page;
          this.lastPage = response.meta.last_page;
          this.totalStories = response.meta.total;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load success stories. Please try again.';
          this.loading = false;
          console.error('Error loading stories:', err);
        }
      });
  }

  viewStory(storyId: number): void {
    this.router.navigate(['/success-stories', storyId]);
  }

  onPageChange(page: number): void {
    this.loadStories(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getCoupleNames(story: SuccessStoryCard): string {
    if (story.couple?.user1_name && story.couple?.user2_name) {
      return `${story.couple.user1_name} & ${story.couple.user2_name}`;
    }
    return story.couple?.user1_name || 'A Happy Couple';
  }

  get skeletonItems(): number[] {
    return Array.from({ length: this.perPage }, (_, i) => i + 1);
  }
}
