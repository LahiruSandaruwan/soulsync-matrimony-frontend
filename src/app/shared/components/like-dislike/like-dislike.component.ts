import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatchService } from '../../../core/services/match.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

interface UserProfile {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    photos: any[];
  };
  compatibility_score: number;
  distance_km?: number;
  mutual_interests?: string[];
}

@Component({
  selector: 'app-like-dislike',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './like-dislike.component.html',
  styleUrls: ['./like-dislike.component.scss']
})
export class LikeDislikeComponent implements OnInit, OnDestroy {
  @Input() profile: UserProfile | null = null;
  @Input() showButtons = true;
  @Input() showSwipe = true;
  
  @Output() like = new EventEmitter<UserProfile>();
  @Output() dislike = new EventEmitter<UserProfile>();
  @Output() superLike = new EventEmitter<UserProfile>();
  @Output() match = new EventEmitter<UserProfile>();
  
  @ViewChild('cardElement') cardElement!: ElementRef;
  
  private destroy$ = new Subject<void>();
  
  currentUser: any = null;
  loading = false;
  error = '';
  successMessage = '';
  
  // Swipe gesture tracking
  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;
  isDragging = false;
  swipeDirection: 'left' | 'right' | 'up' | null = null;
  
  // Animation states
  cardTransform = '';
  cardOpacity = 1;
  cardRotation = 0;
  
  // Action states
  isLiking = false;
  isDisliking = false;
  isSuperLiking = false;

  constructor(
    private matchService: MatchService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
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

  // Swipe Gesture Methods
  onTouchStart(event: TouchEvent): void {
    if (!this.showSwipe) return;
    
    const touch = event.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.isDragging = true;
    this.swipeDirection = null;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.showSwipe || !this.isDragging) return;
    
    const touch = event.touches[0];
    this.currentX = touch.clientX;
    this.currentY = touch.clientY;
    
    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      this.swipeDirection = deltaX > 0 ? 'right' : 'left';
    } else {
      this.swipeDirection = deltaY < 0 ? 'up' : null;
    }
    
    // Apply transform
    const maxDelta = 100;
    const progress = Math.min(Math.abs(deltaX), maxDelta) / maxDelta;
    const rotation = (deltaX / maxDelta) * 15; // Max 15 degrees rotation
    
    this.cardTransform = `translate(${deltaX * 0.5}px, ${deltaY * 0.5}px) rotate(${rotation}deg)`;
    this.cardOpacity = 1 - progress * 0.3;
    this.cardRotation = rotation;
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.showSwipe || !this.isDragging) return;
    
    this.isDragging = false;
    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Minimum swipe distance
    if (distance > 50) {
      if (this.swipeDirection === 'right') {
        this.onLike();
      } else if (this.swipeDirection === 'left') {
        this.onDislike();
      } else if (this.swipeDirection === 'up') {
        this.onSuperLike();
      }
    } else {
      // Reset card position
      this.resetCardPosition();
    }
  }

  private resetCardPosition(): void {
    this.cardTransform = '';
    this.cardOpacity = 1;
    this.cardRotation = 0;
    this.swipeDirection = null;
  }

  // Button Action Methods
  onLike(): void {
    if (!this.profile || this.isLiking) return;
    
    this.isLiking = true;
    this.loading = true;
    
    this.matchService.likeUser(this.profile.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLiking = false;
          this.loading = false;
          this.successMessage = 'Profile liked! ❤️';
          
          // Check if it's a match
          if (response.data.is_match) {
            this.successMessage = 'It\'s a match! 🎉';
            this.match.emit(this.profile!);
          }
          
          this.like.emit(this.profile!);
          this.animateCardOut('right');
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.isLiking = false;
          this.loading = false;
          this.error = error.message || 'Failed to like profile';
          this.resetCardPosition();
          
          setTimeout(() => {
            this.error = '';
          }, 3000);
        }
      });
  }

  onDislike(): void {
    if (!this.profile || this.isDisliking) return;
    
    this.isDisliking = true;
    this.loading = true;
    
    this.matchService.dislikeUser(this.profile.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isDisliking = false;
          this.loading = false;
          this.dislike.emit(this.profile!);
          this.animateCardOut('left');
        },
        error: (error: any) => {
          this.isDisliking = false;
          this.loading = false;
          this.error = error.message || 'Failed to dislike profile';
          this.resetCardPosition();
          
          setTimeout(() => {
            this.error = '';
          }, 3000);
        }
      });
  }

  onSuperLike(): void {
    if (!this.profile || this.isSuperLiking) return;
    
    this.isSuperLiking = true;
    this.loading = true;
    
    this.matchService.superLikeUser(this.profile.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isSuperLiking = false;
          this.loading = false;
          this.successMessage = 'Super like sent! ⭐';
          this.superLike.emit(this.profile!);
          this.animateCardOut('up');
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.isSuperLiking = false;
          this.loading = false;
          this.error = error.message || 'Failed to send super like';
          this.resetCardPosition();
          
          setTimeout(() => {
            this.error = '';
          }, 3000);
        }
      });
  }

  private animateCardOut(direction: 'left' | 'right' | 'up'): void {
    const translations = {
      left: 'translate(-200%, 0) rotate(-15deg)',
      right: 'translate(200%, 0) rotate(15deg)',
      up: 'translate(0, -200%) rotate(0deg)'
    };
    
    this.cardTransform = translations[direction];
    this.cardOpacity = 0;
    
    setTimeout(() => {
      this.resetCardPosition();
    }, 300);
  }

  // Utility Methods
  getAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getFullName(): string {
    if (!this.profile) return '';
    return `${this.profile.user.first_name} ${this.profile.user.last_name}`;
  }

  getPrimaryPhoto(): string {
    if (!this.profile?.user.photos || this.profile.user.photos.length === 0) {
      return '/assets/images/default-avatar.png';
    }
    
    const primaryPhoto = this.profile.user.photos.find((photo: any) => photo.is_primary);
    return primaryPhoto ? primaryPhoto.file_path : this.profile.user.photos[0].file_path;
  }

  getCompatibilityColor(): string {
    if (!this.profile) return '';
    const score = this.profile.compatibility_score;
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getDistanceText(): string {
    if (!this.profile?.distance_km) return '';
    if (this.profile.distance_km < 1) return 'Less than 1 km away';
    if (this.profile.distance_km < 5) return `${Math.round(this.profile.distance_km)} km away`;
    return `${Math.round(this.profile.distance_km)} km away`;
  }

  onClearSuccess(): void {
    this.successMessage = '';
  }

  onClearError(): void {
    this.error = '';
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-avatar.png';
  }
} 