import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SuccessStoryService } from '../../../core/services/success-story.service';
import { SuccessStoryCard } from '../../../core/models/success-story.model';
import { OptimizedImageComponent } from '../optimized-image/optimized-image.component';

@Component({
  selector: 'app-success-stories-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink, OptimizedImageComponent],
  templateUrl: './success-stories-carousel.component.html',
  styleUrls: ['./success-stories-carousel.component.scss']
})
export class SuccessStoriesCarouselComponent implements OnInit, OnDestroy {
  stories: SuccessStoryCard[] = [];
  loading = true;
  error = '';

  private destroy$ = new Subject<void>();

  constructor(
    private successStoryService: SuccessStoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedStories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFeaturedStories(): void {
    this.loading = true;
    this.error = '';

    this.successStoryService.getFeaturedStories(6)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stories) => {
          this.stories = stories;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load success stories';
          this.loading = false;
          console.error('Error loading success stories:', err);
        }
      });
  }

  viewStory(storyId: number): void {
    this.router.navigate(['/success-stories', storyId]);
  }

  viewAllStories(): void {
    this.router.navigate(['/success-stories']);
  }

  getCoupleNames(story: SuccessStoryCard): string {
    if (story.couple?.user1_name && story.couple?.user2_name) {
      return `${story.couple.user1_name} & ${story.couple.user2_name}`;
    }
    return story.couple?.user1_name || 'Anonymous';
  }

  getDefaultImage(): string {
    return 'assets/images/default-couple.jpg';
  }

  get skeletonItems(): number[] {
    return [1, 2, 3, 4, 5, 6];
  }
}
