import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatchService } from '../../core/services/match.service';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { MatchSuggestion, MatchFilters, MatchStats } from '../../core/models/match.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-match-suggestions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    ModalComponent,
    ToastComponent
  ],
  templateUrl: './match-suggestions.component.html',
  styleUrls: ['./match-suggestions.component.scss']
})
export class MatchSuggestionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  error = '';
  success = '';
  
  suggestions: MatchSuggestion[] = [];
  currentIndex = 0;
  currentSuggestion: MatchSuggestion | null = null;
  currentUser: any = null;
  userPreferences: any = null;
  
  // UI state
  showFilters = false;
  showMatchModal = false;
  selectedMatch: MatchSuggestion | null = null;
  
  filters: MatchFilters = {
    age_min: 18,
    age_max: 50,
    distance_max: 50,
    gender: '',
    religion: [],
    education_level: [],
    location_preference: 'same_city'
  };

  filterForm: FormGroup;
  
  stats: MatchStats = {
    totalSuggestions: 0,
    totalLikes: 0,
    totalDislikes: 0,
    totalSuperLikes: 0,
    totalMatches: 0,
    responseRate: 0,
    averageCompatibility: 0,
    // Additional properties for template compatibility
    viewedToday: 0,
    likesSent: 0,
    superLikesSent: 0
  };

  constructor(
    private fb: FormBuilder,
    private matchService: MatchService,
    private profileService: ProfileService,
    private authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      ageMin: [18],
      ageMax: [50],
      distanceMax: [50],
      gender: [''],
      religion: [[]],
      educationLevel: [[]],
      locationPreference: ['same_city']
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUserPreferences();
    this.loadSuggestions();
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
        if (user) {
          this.filters.gender = user.gender === 'male' ? 'female' : 'male';
        }
      });
  }

  private loadUserPreferences(): void {
    this.profileService.getPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (preferences: any) => {
          this.userPreferences = preferences;
          this.applyPreferencesToFilters();
        },
        error: (error: any) => {
          console.error('Failed to load preferences:', error);
          // Continue without preferences
        }
      });
  }

  private applyPreferencesToFilters(): void {
    if (this.userPreferences) {
      this.filters = {
        age_min: this.userPreferences.age_min || 18,
        age_max: this.userPreferences.age_max || 50,
        distance_max: this.userPreferences.max_distance_km || 50,
        gender: this.currentUser?.gender === 'male' ? 'female' : 'male',
        religion: this.userPreferences.religion || [],
        education_level: this.userPreferences.education_level || [],
        location_preference: this.userPreferences.location_preference || 'same_city'
      };
    }
  }

  loadSuggestions(): void {
    this.loading = true;
    this.error = '';

    this.matchService.getSuggestions(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.suggestions = response || [];
          this.stats.totalSuggestions = this.suggestions.length;
          
          if (this.suggestions.length > 0) {
            this.setCurrentSuggestion(0);
          }
          
          this.loading = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to load suggestions';
          this.loading = false;
        }
      });
  }

  setCurrentSuggestion(index: number): void {
    if (index >= 0 && index < this.suggestions.length) {
      this.currentIndex = index;
      this.currentSuggestion = this.suggestions[index] || null;
    }
  }

  onLike(): void {
    if (!this.currentSuggestion) return;

    this.matchService.likeUser(this.currentSuggestion.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.success = 'Liked!';
          this.stats.totalLikes++;
          
          if (response.data?.match_created) {
            this.success = 'It\'s a match! 💕';
            this.stats.totalMatches++;
          }
          
          setTimeout(() => {
            this.success = '';
            this.moveToNext();
          }, 2000);
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to like user';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  onDislike(): void {
    if (!this.currentSuggestion) return;

    this.matchService.dislikeUser(this.currentSuggestion.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.stats.totalDislikes++;
          this.moveToNext();
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to dislike user';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  onSuperLike(): void {
    if (!this.currentSuggestion) return;

    this.matchService.superLikeUser(this.currentSuggestion.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.success = 'Super Liked! ⭐';
          this.stats.totalSuperLikes++;
          
          if (response.data?.match_created) {
            this.success = 'It\'s a match! 💕';
            this.stats.totalMatches++;
          }
          
          setTimeout(() => {
            this.success = '';
            this.moveToNext();
          }, 2000);
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to super like user';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  onBlock(): void {
    if (!this.currentSuggestion) return;

    this.matchService.blockUser(this.currentSuggestion.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = 'User blocked';
          setTimeout(() => {
            this.success = '';
            this.moveToNext();
          }, 2000);
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to block user';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  private moveToNext(): void {
    const nextIndex = this.currentIndex + 1;
    
    if (nextIndex < this.suggestions.length) {
      this.setCurrentSuggestion(nextIndex);
    } else {
      this.currentSuggestion = null;
      this.loadSuggestions(); // Load more suggestions
    }
  }

  onUpdateFilters(newFilters: MatchFilters): void {
    this.filters = { ...newFilters };
    this.loadSuggestions();
  }

  onViewProfile(userId: number): void {
    // Navigate to user profile
    window.open(`/profile/${userId}`, '_blank');
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

  onRefreshSuggestions(): void {
    this.loadSuggestions();
  }

  onViewAllMatches(): void {
    // Navigate to all matches page
    window.open('/matches', '_blank');
  }

  onStartConversation(): void {
    if (this.selectedMatch) {
      // Navigate to chat with the matched user
      window.open(`/chat/${this.selectedMatch.user.id}`, '_blank');
      this.showMatchModal = false;
    }
  }
}
