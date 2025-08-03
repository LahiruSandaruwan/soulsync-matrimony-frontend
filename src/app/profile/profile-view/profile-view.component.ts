import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from '../../core/services/profile.service';
import { MatchService } from '../../core/services/match.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

interface UserProfile {
  id: number;
  user_id: number;
  height_cm?: number;
  weight_kg?: number;
  body_type?: string;
  complexion?: string;
  blood_group?: string;
  current_city?: string;
  current_state?: string;
  current_country?: string;
  education_level?: string;
  occupation?: string;
  company?: string;
  job_title?: string;
  annual_income_usd?: number;
  religion?: string;
  caste?: string;
  mother_tongue?: string;
  languages_known?: string[];
  family_type?: string;
  family_status?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  hobbies?: string[];
  about_me?: string;
  looking_for?: string;
  marital_status?: string;
  have_children?: boolean;
  children_count?: number;
  willing_to_relocate?: boolean;
  preferred_locations?: string[];
  completion_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

interface UserPhoto {
  id: number;
  user_id: number;
  file_path: string;
  is_primary: boolean;
  is_private: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  country_code: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
  photos?: UserPhoto[];
}

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  @Input() userId?: number;
  
  private destroy$ = new Subject<void>();
  
  user: User | null = null;
  currentUser: any = null;
  // Loading states
  loading = false;
  liking = false;
  disliking = false;
  superLiking = false;
  startingConversation = false;
  blocking = false;

  // Photo modal
  showPhotoModal = false;
  currentPhotoIndex = 0;

  // Messages
  successMessage = '';
  errorMessage = '';
  error = '';

  // Interaction states
  isLiked = false;
  isSuperLiked = false;
  isBlocked = false;
  isMatched = false;
  compatibilityScore = 0;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService,
    private authService: AuthService,
    private matchService: MatchService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.setupRouteParams();
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

  private setupRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const userId = this.userId || +params['id'];
        if (userId) {
          this.loadUserProfile(userId);
          this.checkInteractionStatus(userId);
        }
      });
  }

  // Public method for template access
  loadUserProfile(userId: number): void {
    this.loading = true;
    this.error = '';

    this.profileService.getUserProfile(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.user = response.data;
          this.loadUserPhotos(userId);
          this.calculateCompatibility();
          this.loading = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to load profile';
          this.loading = false;
        }
      });
  }

  private loadUserPhotos(userId: number): void {
    this.profileService.getUserPhotos(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (this.user) {
            this.user.photos = response.data;
          }
        },
        error: (error: any) => {
          console.error('Failed to load photos:', error);
        }
      });
  }

  private checkInteractionStatus(userId: number): void {
    // Check if user is liked, super-liked, blocked, or matched
    this.matchService.getInteractionStatus(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLiked = response.data.is_liked || false;
          this.isSuperLiked = response.data.is_super_liked || false;
          this.isBlocked = response.data.is_blocked || false;
          this.isMatched = response.data.is_matched || false;
        },
        error: (error: any) => {
          console.error('Failed to check interaction status:', error);
        }
      });
  }

  private calculateCompatibility(): void {
    if (!this.user || !this.currentUser) return;

    this.matchService.getCompatibilityScore(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.compatibilityScore = response.data.compatibility_score || 0;
        },
        error: (error: any) => {
          console.error('Failed to calculate compatibility:', error);
        }
      });
  }

  // Photo navigation methods
  previousPhoto(): void {
    if (this.currentPhotoIndex > 0) {
      this.currentPhotoIndex--;
    }
  }

  nextPhoto(): void {
    if (this.currentPhotoIndex < this.getPublicPhotos().length - 1) {
      this.currentPhotoIndex++;
    }
  }

  goToPhoto(index: number): void {
    this.currentPhotoIndex = index;
  }

  openPhotoModal(): void {
    this.showPhotoModal = true;
  }

  closePhotoModal(): void {
    this.showPhotoModal = false;
  }

  // Interaction methods
  onDislike(): void {
    if (!this.user || this.disliking) return;

    this.disliking = true;
    this.matchService.dislikeUser(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.disliking = false;
          this.successMessage = 'Profile passed';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.disliking = false;
          this.errorMessage = error.message || 'Failed to pass profile';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
  }

  onLike(): void {
    if (!this.user || this.liking) return;

    this.liking = true;
    this.matchService.likeUser(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.liking = false;
          this.isLiked = true;
          this.successMessage = 'Profile liked!';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.liking = false;
          this.errorMessage = error.message || 'Failed to like profile';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
  }

  onSuperLike(): void {
    if (!this.user || this.superLiking) return;

    this.superLiking = true;
    this.matchService.superLikeUser(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.superLiking = false;
          this.isSuperLiked = true;
          this.successMessage = 'Super like sent!';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.superLiking = false;
          this.errorMessage = error.message || 'Failed to super like profile';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
  }

  onBlock(): void {
    if (!this.user || this.blocking) return;

    this.blocking = true;
    this.matchService.blockUser(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.blocking = false;
          this.isBlocked = true;
          this.successMessage = 'User blocked';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.blocking = false;
          this.errorMessage = error.message || 'Failed to block user';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
  }

  onReport(): void {
    // TODO: Implement report functionality
    this.successMessage = 'Report submitted';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  onStartConversation(): void {
    if (!this.user || this.startingConversation) return;

    this.startingConversation = true;
    this.chatService.startConversation(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.startingConversation = false;
          this.router.navigate(['/chat', response.data.conversation_id]);
        },
        error: (error: any) => {
          this.startingConversation = false;
          this.errorMessage = error.message || 'Failed to start conversation';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
  }

  onBackToChats(): void {
    this.router.navigate(['/chat']);
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-avatar.png';
  }

  // Utility methods
  getAge(): number {
    if (!this.user?.date_of_birth) return 0;
    const birthDate = new Date(this.user.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getFullName(): string {
    if (!this.user) return '';
    return `${this.user.first_name} ${this.user.last_name}`;
  }

  getLocation(): string {
    const parts = [];
    if (this.user?.profile?.current_city) parts.push(this.user.profile.current_city);
    if (this.user?.profile?.current_state) parts.push(this.user.profile.current_state);
    if (this.user?.profile?.current_country) parts.push(this.user.profile.current_country);
    
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }

  getCompatibilityColor(): string {
    if (this.compatibilityScore >= 80) return 'text-green-600';
    if (this.compatibilityScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getCompatibilityText(): string {
    if (this.compatibilityScore >= 80) return 'Excellent Match';
    if (this.compatibilityScore >= 60) return 'Good Match';
    return 'Fair Match';
  }

  getPrimaryPhoto(): any {
    const photos = this.user?.photos || [];
    return photos.find(photo => photo.is_primary) || photos[0] || null;
  }

  getPublicPhotos(): any[] {
    return this.user?.photos?.filter(photo => !photo.is_private) || [];
  }

  onClearSuccess(): void {
    this.successMessage = '';
  }

  onClearError(): void {
    this.errorMessage = '';
  }
} 