import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { MatchService } from '../../core/services/match.service';
import { ChatService } from '../../core/services/chat.service';
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
    RouterModule,
    FormsModule,
    LoadingSpinnerComponent,
    ModalComponent,
  ],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  @Input() userId?: number;
  
  private destroy$ = new Subject<void>();
  
  user: User | null = null;
  currentUser: any = null;
  loading = true;
  error = '';
  
  // Photo gallery
  currentPhotoIndex = 0;
  showPhotoModal = false;
  
  // Interaction states
  isLiked = false;
  isSuperLiked = false;
  isBlocked = false;
  isMatched = false;
  compatibilityScore = 0;
  
  // Action states
  sendingLike = false;
  sendingSuperLike = false;
  startingConversation = false;
  blocking = false;
  
  // Success/Error messages
  successMessage = '';
  errorMessage = '';

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

  private loadUserProfile(userId: number): void {
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

  // Photo Gallery Methods
  onPhotoClick(index: number): void {
    this.currentPhotoIndex = index;
    this.showPhotoModal = true;
  }

  onClosePhotoModal(): void {
    this.showPhotoModal = false;
  }

  onPreviousPhoto(): void {
    if (this.user?.photos && this.user.photos.length > 0) {
      this.currentPhotoIndex = this.currentPhotoIndex > 0 
        ? this.currentPhotoIndex - 1 
        : this.user.photos.length - 1;
    }
  }

  onNextPhoto(): void {
    if (this.user?.photos && this.user.photos.length > 0) {
      this.currentPhotoIndex = this.currentPhotoIndex < this.user.photos.length - 1 
        ? this.currentPhotoIndex + 1 
        : 0;
    }
  }

  // Interaction Methods
  onLike(): void {
    if (!this.user || this.sendingLike) return;

    this.sendingLike = true;
    this.matchService.likeUser(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLiked = true;
          this.sendingLike = false;
          this.successMessage = 'Profile liked!';
          
          // Check if it's a match
          if (response.data.is_match) {
            this.isMatched = true;
            this.successMessage = 'It\'s a match! 🎉';
          }
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.sendingLike = false;
          this.errorMessage = error.message || 'Failed to like profile';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
  }

  onSuperLike(): void {
    if (!this.user || this.sendingSuperLike) return;

    this.sendingSuperLike = true;
    this.matchService.superLikeUser(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isSuperLiked = true;
          this.sendingSuperLike = false;
          this.successMessage = 'Super like sent! ⭐';
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.sendingSuperLike = false;
          this.errorMessage = error.message || 'Failed to send super like';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
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

  onBlock(): void {
    if (!this.user || this.blocking) return;

    this.blocking = true;
    this.matchService.blockUser(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isBlocked = true;
          this.blocking = false;
          this.successMessage = 'User blocked successfully';
          
          setTimeout(() => {
            this.router.navigate(['/matches']);
          }, 2000);
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
    // Navigate to report page
    this.router.navigate(['/report', this.user?.id]);
  }

  onBackToChats(): void {
    this.router.navigate(['/chat']);
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-avatar.png';
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
    if (!this.user) return '';
    return `${this.user.first_name} ${this.user.last_name}`;
  }

  getLocation(): string {
    if (!this.user?.profile) return '';
    const { current_city, current_state, current_country } = this.user.profile;
    return [current_city, current_state, current_country].filter(Boolean).join(', ');
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

  getPrimaryPhoto(): string {
    if (!this.user?.photos || this.user.photos.length === 0) {
      return '/assets/images/default-avatar.png';
    }
    
    const primaryPhoto = this.user.photos.find(photo => photo.is_primary);
    return primaryPhoto ? primaryPhoto.file_path : this.user.photos[0].file_path;
  }

  getPublicPhotos(): UserPhoto[] {
    if (!this.user?.photos) return [];
    return this.user.photos.filter(photo => !photo.is_private && photo.status === 'approved');
  }

  onClearSuccess(): void {
    this.successMessage = '';
  }

  onClearError(): void {
    this.errorMessage = '';
  }
} 