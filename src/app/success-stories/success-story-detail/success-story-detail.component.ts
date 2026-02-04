import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SuccessStoryService } from '../../core/services/success-story.service';
import { SuccessStory, SuccessStoryPhoto } from '../../core/models/success-story.model';
import { OptimizedImageComponent } from '../../shared/components/optimized-image/optimized-image.component';
import { PhotoGalleryComponent, Photo } from '../../shared/components/photo-gallery/photo-gallery.component';

@Component({
  selector: 'app-success-story-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, OptimizedImageComponent, PhotoGalleryComponent],
  templateUrl: './success-story-detail.component.html',
  styleUrls: ['./success-story-detail.component.scss']
})
export class SuccessStoryDetailComponent implements OnInit, OnDestroy {
  story: SuccessStory | null = null;
  loading = true;
  error = '';
  activePhotoIndex = 0;
  showGallery = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private successStoryService: SuccessStoryService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = +params['id'];
        if (id) {
          this.loadStory(id);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStory(id: number): void {
    this.loading = true;
    this.error = '';

    this.successStoryService.getStoryById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (story) => {
          this.story = story;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load story. It may have been removed or is not available.';
          this.loading = false;
          console.error('Error loading story:', err);
        }
      });
  }

  getCoupleNames(): string {
    if (this.story?.couple?.user1_name && this.story?.couple?.user2_name) {
      return `${this.story.couple.user1_name} & ${this.story.couple.user2_name}`;
    }
    return this.story?.couple?.user1_name || 'A Happy Couple';
  }

  openGallery(index: number = 0): void {
    this.activePhotoIndex = index;
    this.showGallery = true;
  }

  closeGallery(): void {
    this.showGallery = false;
  }

  getGalleryImages(): Photo[] {
    return this.story?.photos?.map((photo, index) => ({
      id: photo.id || index + 1,
      file_path: photo.url || photo.medium || '',
      is_primary: index === 0,
      is_private: false,
      status: 'approved' as const,
      created_at: new Date().toISOString()
    })) || [];
  }

  shareOnFacebook(): void {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  }

  shareOnTwitter(): void {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${this.getCoupleNames()}'s love story on SoulSync Matrimony`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
  }

  shareOnWhatsApp(): void {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out ${this.getCoupleNames()}'s love story: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      // Could show a toast notification here
      alert('Link copied to clipboard!');
    });
  }

  goBack(): void {
    this.router.navigate(['/success-stories']);
  }
}
