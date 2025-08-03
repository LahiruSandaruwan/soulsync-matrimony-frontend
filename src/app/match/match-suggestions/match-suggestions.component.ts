import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, BehaviorSubject, combineLatest } from 'rxjs';
import { MatchService } from '../../core/services/match.service';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

interface MatchSuggestion {
  id: number;
  user: any;
  compatibility_score: number;
  matching_factors: string[];
  distance_km?: number;
  mutual_interests?: string[];
}

interface MatchFilters {
  age_min: number;
  age_max: number;
  distance_max: number;
  gender: string;
  religion?: string[];
  education_level?: string[];
  location_preference: string;
}

@Component({
  selector: 'app-match-suggestions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingSpinnerComponent,
    ModalComponent,
    ToastComponent
  ],
  templateUrl: './match-suggestions.component.html',
  styleUrls: ['./match-suggestions.component.scss']
})
export class MatchSuggestionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private currentIndexSubject = new BehaviorSubject<number>(0);
  
  loading = true;
  error = '';
  currentUser: any = null;
  
  suggestions: MatchSuggestion[] = [];
  currentIndex = 0;
  currentSuggestion: MatchSuggestion | null = null;
  
  // Filters
  filters: MatchFilters = {
    age_min: 18,
    age_max: 50,
    distance_max: 50,
    gender: 'female',
    location_preference: 'same_city'
  };
  
  showFilters = false;
  showMatchModal = false;
  selectedMatch: MatchSuggestion | null = null;
  
  // Stats
  stats = {
    totalSuggestions: 0,
    viewedToday: 0,
    likesSent: 0,
    superLikesSent: 0
  };

  constructor(
    private matchService: MatchService,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadMatchSuggestions();
    this.loadUserStats();
    
    // Subscribe to current index changes
    this.currentIndexSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe(index => {
        this.currentIndex = index;
        this.currentSuggestion = this.suggestions[index] || null;
      });
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
          this.loadUserPreferences();
        }
      });
  }

  private loadUserPreferences(): void {
    this.profileService.getPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (preferences) => {
          if (preferences) {
            this.filters = {
              age_min: preferences.age_min || 18,
              age_max: preferences.age_max || 50,
              distance_max: preferences.max_distance_km || 50,
              gender: this.currentUser?.gender === 'male' ? 'female' : 'male',
              religion: preferences.religion,
              education_level: preferences.education_level,
              location_preference: preferences.location_preference || 'same_city'
            };
          }
        },
        error: (error) => {
          console.error('Error loading preferences:', error);
        }
      });
  }

  loadMatchSuggestions(): void {
    this.loading = true;
    this.error = '';

    this.matchService.getSuggestions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.suggestions = response || [];
          this.stats.totalSuggestions = this.suggestions.length;
          
          if (this.suggestions.length > 0) {
            this.currentIndexSubject.next(0);
          }
          
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Failed to load match suggestions. Please try again.';
          this.loading = false;
          console.error('Error loading suggestions:', error);
        }
      });
  }

  private loadUserStats(): void {
    // Load user matching statistics
    this.matchService.getMatchStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: any) => {
          this.stats = {
            totalSuggestions: this.suggestions.length,
            viewedToday: 0, // Not available in current API
            likesSent: 0, // Not available in current API
            superLikesSent: 0 // Not available in current API
          };
        },
        error: (error: any) => {
          console.error('Error loading user stats:', error);
        }
      });
  }

  onLike(): void {
    if (!this.currentSuggestion) return;

    this.matchService.likeUser(this.currentSuggestion.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.stats.likesSent++;
          
          // Check if it's a mutual match
          if (response.is_mutual_match) {
            this.showMatchModal = true;
            this.selectedMatch = this.currentSuggestion;
          }
          
          this.nextSuggestion();
        },
        error: (error: any) => {
          console.error('Error liking user:', error);
          // Show error toast
        }
      });
  }

  onDislike(): void {
    if (!this.currentSuggestion) return;

    this.matchService.dislikeUser(this.currentSuggestion.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.nextSuggestion();
        },
        error: (error: any) => {
          console.error('Error disliking user:', error);
        }
      });
  }

  onSuperLike(): void {
    if (!this.currentSuggestion) return;

    this.matchService.superLikeUser(this.currentSuggestion.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.stats.superLikesSent++;
          
          // Check if it's a mutual match
          if (response.is_mutual_match) {
            this.showMatchModal = true;
            this.selectedMatch = this.currentSuggestion;
          }
          
          this.nextSuggestion();
        },
        error: (error: any) => {
          console.error('Error super liking user:', error);
        }
      });
  }

  onViewProfile(userId: number): void {
    // Navigate to user profile
    console.log('View profile:', userId);
  }

  onBlock(): void {
    if (!this.currentSuggestion) return;

    this.matchService.blockUser(this.currentSuggestion.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.nextSuggestion();
        },
        error: (error: any) => {
          console.error('Error blocking user:', error);
        }
      });
  }

  private nextSuggestion(): void {
    const nextIndex = this.currentIndex + 1;
    
    if (nextIndex < this.suggestions.length) {
      this.currentIndexSubject.next(nextIndex);
    } else {
      // No more suggestions, load more or show empty state
      this.loadMoreSuggestions();
    }
  }

  private loadMoreSuggestions(): void {
    // Load more suggestions from API
    this.loadMatchSuggestions();
  }

  onRefreshSuggestions(): void {
    this.loadMatchSuggestions();
  }

  onUpdateFilters(newFilters: MatchFilters): void {
    this.filters = { ...newFilters };
    this.loadMatchSuggestions();
    this.showFilters = false;
  }

  onStartConversation(): void {
    if (this.selectedMatch) {
      // Navigate to chat with the matched user
      console.log('Start conversation with:', this.selectedMatch.user.id);
      this.showMatchModal = false;
    }
  }

  onViewAllMatches(): void {
    // Navigate to all matches page
    console.log('View all matches');
  }

  getCompatibilityColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getDistanceText(distance: number): string {
    if (distance < 1) return 'Less than 1 km away';
    if (distance < 5) return `${distance} km away`;
    return `${distance} km away`;
  }
}
