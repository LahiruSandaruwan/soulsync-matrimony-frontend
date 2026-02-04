import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { MatchService } from '../../core/services/match.service';
import { HoroscopeService } from '../../core/services/horoscope.service';
import { User, UserProfile, UserPhoto } from '../../core/models/user.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  user: User | null = null;
  userProfile: UserProfile | null = null;
  currentUser: any = null;
  
  // Loading states
  loading = true;
  loadingPhotos = false;
  liking = false;
  disliking = false;
  superLiking = false;
  startingConversation = false;
  blocking = false;
  
  // Error handling
  error = '';
  success = '';
  
  // User photos
  userPhotos: UserPhoto[] = [];
  currentPhotoIndex = 0;
  showPhotoModal = false;
  
  // Match status
  isMatched = false;
  isLiked = false;
  isBlocked = false;
  
  // Profile completion
  completionPercentage = 0;
  
  // Compatibility
  compatibilityScore = 0;
  matchingFactors: string[] = [];
  
  // Distance
  distanceKm = 0;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private authService: AuthService,
    private matchService: MatchService,
    private horoscopeService: HoroscopeService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUserProfile();
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

  loadUserProfile(): void {
    this.loading = true;
    this.error = '';

    const userId = this.route.snapshot.params['id'];

    // If no userId provided, load current user's own profile
    if (!userId) {
      this.loadOwnProfile();
      return;
    }

    this.profileService.getProfileById(parseInt(userId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: UserProfile) => {
          this.userProfile = profile;
          this.user = (profile as any).user || {
            id: profile.user_id,
            first_name: (profile as any).first_name || 'User',
            last_name: (profile as any).last_name || '',
            date_of_birth: (profile as any).date_of_birth || '1990-01-01',
            profile
          };
          this.loading = false;
          this.loadUserPhotos(parseInt(userId));
          this.loadCompatibility();
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to load profile';
          this.loading = false;
        }
      });
  }

  private loadOwnProfile(): void {
    this.profileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: UserProfile) => {
          this.userProfile = profile;
          // For own profile, merge with current user data
          if (this.currentUser) {
            this.user = {
              id: this.currentUser.id,
              first_name: this.currentUser.first_name || 'User',
              last_name: this.currentUser.last_name || '',
              date_of_birth: this.currentUser.date_of_birth || '1990-01-01',
              profile
            } as any;
          } else {
            this.user = {
              id: profile.user_id,
              first_name: (profile as any).first_name || 'User',
              last_name: (profile as any).last_name || '',
              date_of_birth: (profile as any).date_of_birth || '1990-01-01',
              profile
            } as any;
          }
          this.loading = false;
          this.loadOwnPhotos();
          // Calculate profile completion
          this.completionPercentage = profile.completion_percentage || 0;
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to load your profile';
          this.loading = false;
        }
      });
  }

  private loadOwnPhotos(): void {
    this.loadingPhotos = true;
    this.profileService.getPhotos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (photos: UserPhoto[]) => {
          this.userPhotos = photos;
          if (this.user) {
            (this.user as any).photos = photos;
          }
          this.loadingPhotos = false;
        },
        error: () => {
          this.loadingPhotos = false;
        }
      });
  }

  loadUserPhotos(userId: number): void {
    this.loadingPhotos = true;
    (this.profileService as any).apiService.get(`/users/${userId}/photos`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const photos = res?.data || res || [];
          this.userPhotos = photos;
          if (this.user) {
            (this.user as any).photos = photos;
          }
          this.loadingPhotos = false;
        },
        error: (error: any) => {
          this.handleError('Failed to load user photos', error);
          this.loadingPhotos = false;
        }
      });
  }

  private loadCompatibility(): void {
    if (!this.user) return;
    this.horoscopeService.checkCompatibility(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.compatibilityScore = data?.score ?? 0;
          this.matchingFactors = data?.factors || [];
        },
        error: () => {
          // fallback: keep defaults
        }
      });
  }

  onLike(): void {
    if (!this.user) return;

    this.matchService.likeUser(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLiked = true;
          this.success = 'Liked!';
          
          if (response.data?.match_created) {
            this.isMatched = true;
            this.success = 'It\'s a match! 💕';
          }
          
          setTimeout(() => this.success = '', 3000);
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to like user';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  onSuperLike(): void {
    if (!this.user) return;

    this.matchService.superLikeUser(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.success = 'Super Liked! ⭐';
          
          if (response.data?.match_created) {
            this.isMatched = true;
            this.success = 'It\'s a match! 💕';
          }
          
          setTimeout(() => this.success = '', 3000);
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to super like user';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  onBlock(): void {
    if (!this.user) return;

    this.matchService.blockUser(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isBlocked = true;
          this.success = 'User blocked';
          setTimeout(() => this.success = '', 3000);
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to block user';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  onStartConversation(): void {
    if (!this.user) return;
    
    // Navigate to chat with this user
    window.open(`/chat/${this.user.id}`, '_blank');
  }

  onNextPhoto(): void {
    if (this.currentPhotoIndex < this.userPhotos.length - 1) {
      this.currentPhotoIndex++;
    }
  }

  onPreviousPhoto(): void {
    if (this.currentPhotoIndex > 0) {
      this.currentPhotoIndex--;
    }
  }

  onPhotoClick(index: number): void {
    this.currentPhotoIndex = index;
  }

  onDislike(): void {
    if (!this.user) return;

    this.disliking = true;
    this.matchService.dislikeUser(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.disliking = false;
          this.success = 'Profile passed';
          setTimeout(() => this.success = '', 3000);
        },
        error: (error: any) => {
          this.disliking = false;
          this.error = error.message || 'Failed to pass profile';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  onReport(): void {
    if (!this.user) return;
    const payload = { reason: 'other', description: 'Inappropriate behavior', evidence: '' };
    (this.matchService as any).apiService.post(`/users/${this.user.id}/report`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = 'Report submitted';
          setTimeout(() => this.success = '', 3000);
        },
        error: (err: any) => {
          this.error = err.message || 'Failed to submit report';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  onBackToChats(): void {
    window.history.back();
  }

  getAgeFromDateOfBirth(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getCompatibilityColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getDistanceText(distance?: number): string {
    if (!distance) return 'Location not available';
    return `${distance} km away`;
  }

  getCurrentPhoto(): UserPhoto | null {
    return this.userPhotos[this.currentPhotoIndex] || null;
  }

  canViewPhotos(): boolean {
    return this.userPhotos.length > 0 && !this.isBlocked;
  }

  isOwnProfile(): boolean {
    return this.currentUser?.id === this.user?.id;
  }

  getFullName(): string {
    if (!this.user) return '';
    return `${this.user.first_name} ${this.user.last_name}`;
  }

  getAge(): number {
    if (!this.user?.date_of_birth) return 0;
    return this.getAgeFromDateOfBirth(this.user.date_of_birth);
  }

  getLocation(): string {
    const parts = [];
    if (this.userProfile?.current_city) parts.push(this.userProfile.current_city);
    if (this.userProfile?.current_state) parts.push(this.userProfile.current_state);
    if (this.userProfile?.current_country) parts.push(this.userProfile.current_country);
    
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }

  getPrimaryPhoto(): UserPhoto | null {
    return this.userPhotos.find(photo => photo.is_primary) || this.userPhotos[0] || null;
  }

  getPublicPhotos(): UserPhoto[] {
    return this.userPhotos.filter(photo => !photo.is_private);
  }

  previousPhoto(): void {
    this.onPreviousPhoto();
  }

  nextPhoto(): void {
    this.onNextPhoto();
  }

  goToPhoto(index: number): void {
    this.onPhotoClick(index);
  }

  openPhotoModal(): void {
    this.showPhotoModal = true;
  }

  closePhotoModal(): void {
    this.showPhotoModal = false;
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-avatar.svg';
  }

  /**
   * Handle component errors
   * @param message User-friendly error message
   * @param error Technical error details
   */
  private handleError(message: string, error: any): void {
    if (!environment.production) {
      console.error(`Profile View Error: ${message}`, error);
    }
    // Could show toast notification or handle error display
  }
} 