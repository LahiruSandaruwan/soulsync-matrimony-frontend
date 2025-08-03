import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { SearchService } from '../../core/services/search.service';
import { MatchService } from '../../core/services/match.service';
import { AuthService } from '../../core/services/auth.service';
import { UserCardComponent } from '../../shared/components/user-card/user-card.component';

interface SearchFilters {
  age_min: number;
  age_max: number;
  location: string;
  religion: string;
  education: string;
  marital_status: string;
  occupation: string;
  looking_for: string;
  distance_max: number;
  height_min?: number;
  height_max?: number;
  family_type?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
}

interface SearchResult {
  id: number;
  user: any;
  compatibility_score: number;
  distance_km?: number;
  matching_factors: string[];
}

@Component({
  selector: 'app-search-users',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ReactiveFormsModule,
    UserCardComponent
  ],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-romantic text-gradient mb-2">🔍 Find Your Perfect Match</h1>
          <p class="text-gray-600">Search for people based on your preferences</p>
        </div>

        <!-- Advanced Search Form -->
        <div class="card mb-8">
          <form [formGroup]="searchForm" (ngSubmit)="performSearch()" class="space-y-6">
            <!-- Basic Filters -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="form-label">Age Range</label>
                <div class="flex space-x-2">
                  <input 
                    type="number" 
                    formControlName="ageMin"
                    placeholder="Min" 
                    class="input-field"
                    min="18" 
                    max="80"
                  >
                  <span class="self-center text-gray-500">to</span>
                  <input 
                    type="number" 
                    formControlName="ageMax"
                    placeholder="Max" 
                    class="input-field"
                    min="18" 
                    max="80"
                  >
                </div>
              </div>

              <div>
                <label class="form-label">Location</label>
                <input 
                  type="text" 
                  formControlName="location"
                  placeholder="City, Country" 
                  class="input-field"
                >
              </div>

              <div>
                <label class="form-label">Religion</label>
                <select formControlName="religion" class="input-field">
                  <option value="">Any Religion</option>
                  <option value="buddhist">Buddhist</option>
                  <option value="christian">Christian</option>
                  <option value="hindu">Hindu</option>
                  <option value="muslim">Muslim</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label class="form-label">Education</label>
                <select formControlName="education" class="input-field">
                  <option value="">Any Education</option>
                  <option value="high-school">High School</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="phd">PhD</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <!-- Advanced Filters -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="form-label">Marital Status</label>
                <select formControlName="maritalStatus" class="input-field">
                  <option value="">Any Status</option>
                  <option value="never-married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label class="form-label">Occupation</label>
                <input 
                  type="text" 
                  formControlName="occupation"
                  placeholder="e.g., Engineer, Teacher" 
                  class="input-field"
                >
              </div>

              <div>
                <label class="form-label">Looking for</label>
                <select formControlName="lookingFor" class="input-field">
                  <option value="">Any Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-between items-center">
              <button type="button" class="btn-outline" (click)="resetForm()">
                🔄 Reset Filters
              </button>
              <button type="submit" class="btn-primary" [disabled]="isSearching">
                <span *ngIf="isSearching" class="loading-spinner mr-2"></span>
                {{ isSearching ? 'Searching...' : '🔍 Search' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Search Results -->
        <div *ngIf="searchResults.length > 0" class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-romantic text-gradient">
              Found {{ totalResults }} matches
            </h2>
            <div class="flex space-x-2">
              <button 
                class="btn-outline text-sm"
                (click)="sortBy('compatibility')"
                [class.active]="currentSort === 'compatibility'"
              >
                💕 Best Match
              </button>
              <button 
                class="btn-outline text-sm"
                (click)="sortBy('age')"
                [class.active]="currentSort === 'age'"
              >
                📅 Age
              </button>
              <button 
                class="btn-outline text-sm"
                (click)="sortBy('distance')"
                [class.active]="currentSort === 'distance'"
              >
                📍 Distance
              </button>
            </div>
          </div>

          <!-- Results Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div *ngFor="let result of searchResults" class="profile-card group">
              <app-user-card 
                [user]="result.user" 
                [showActions]="true"
                [showMatchPercentage]="true"
                (like)="likeProfile(result.user.id)"
                (dislike)="dislikeProfile(result.user.id)"
                (viewProfile)="viewProfile(result.user.id)">
              </app-user-card>
              
              <!-- Compatibility Info -->
              <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-600">Match Score:</span>
                  <span class="text-sm font-medium text-primary-600">{{ result.compatibility_score }}%</span>
                </div>
                
                <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    class="bg-gradient-to-r from-primary-500 to-rose-500 h-2 rounded-full transition-all duration-300" 
                    [style.width.%]="result.compatibility_score"
                  ></div>
                </div>
                
                <div *ngIf="result.distance_km" class="text-sm text-gray-600">
                  📍 {{ result.distance_km }} km away
                </div>
                
                <div *ngIf="result.matching_factors?.length" class="mt-2">
                  <p class="text-xs text-gray-500 mb-1">Matching factors:</p>
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let factor of result.matching_factors.slice(0, 3)" 
                          class="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      {{ factor }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div class="text-center mt-8" *ngIf="hasMoreResults">
            <button 
              (click)="loadMoreResults()" 
              class="btn-primary"
              [disabled]="isLoadingMore"
            >
              <span *ngIf="isLoadingMore" class="loading-spinner mr-2"></span>
              {{ isLoadingMore ? 'Loading...' : '💕 Load More Results' }}
            </button>
          </div>
        </div>

        <!-- No Results -->
        <div *ngIf="hasSearched && searchResults.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-romantic text-gradient mb-2">No matches found</h3>
          <p class="text-gray-600 mb-4">Try adjusting your search criteria to find more matches</p>
          <button class="btn-primary" (click)="resetForm()">
            🔄 Reset Filters
          </button>
        </div>

        <!-- Initial State -->
        <div *ngIf="!hasSearched" class="text-center py-12">
          <div class="text-6xl mb-4">💕</div>
          <h3 class="text-xl font-romantic text-gradient mb-2">Ready to find your perfect match?</h3>
          <p class="text-gray-600 mb-4">Use the search filters above to discover people who match your preferences</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SearchUsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  searchForm: FormGroup;
  searchResults: SearchResult[] = [];
  isSearching = false;
  isLoadingMore = false;
  hasSearched = false;
  hasMoreResults = false;
  totalResults = 0;
  currentPage = 1;
  currentSort = 'compatibility';
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private searchService: SearchService,
    private matchService: MatchService,
    private authService: AuthService
  ) {
    this.searchForm = this.fb.group({
      ageMin: [18],
      ageMax: [35],
      location: [''],
      religion: [''],
      education: [''],
      maritalStatus: [''],
      occupation: [''],
      lookingFor: ['']
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.setupFormListeners();
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

  private setupFormListeners(): void {
    // Auto-search with debounce for better UX
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        if (this.hasSearched) {
          this.performSearch();
        }
      });
  }

  performSearch(): void {
    this.isSearching = true;
    this.hasSearched = true;
    this.currentPage = 1;
    
    const filters = this.buildSearchFilters();
    
    this.searchService.searchUsers(filters, this.currentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.searchResults = response.data || [];
          this.totalResults = response.total || 0;
          this.hasMoreResults = response.has_more || false;
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.isSearching = false;
          // Show error toast
        }
      });
  }

  private buildSearchFilters(): SearchFilters {
    const formValue = this.searchForm.value;
    return {
      age_min: formValue.ageMin,
      age_max: formValue.ageMax,
      location: formValue.location,
      religion: formValue.religion,
      education: formValue.education,
      marital_status: formValue.maritalStatus,
      occupation: formValue.occupation,
      looking_for: formValue.lookingFor,
      distance_max: 50 // Default distance
    };
  }

  resetForm(): void {
    this.searchForm.reset({
      ageMin: 18,
      ageMax: 35,
      location: '',
      religion: '',
      education: '',
      maritalStatus: '',
      occupation: '',
      lookingFor: ''
    });
    this.searchResults = [];
    this.hasSearched = false;
    this.currentPage = 1;
    this.hasMoreResults = false;
  }

  sortBy(criteria: string): void {
    this.currentSort = criteria;
    
    switch (criteria) {
      case 'compatibility':
        this.searchResults.sort((a, b) => b.compatibility_score - a.compatibility_score);
        break;
      case 'age':
        this.searchResults.sort((a, b) => a.user.age - b.user.age);
        break;
      case 'distance':
        this.searchResults.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
        break;
    }
  }

  likeProfile(userId: number): void {
    this.matchService.likeUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Show success message
          console.log('Liked profile:', userId);
        },
        error: (error) => {
          console.error('Error liking profile:', error);
        }
      });
  }

  dislikeProfile(userId: number): void {
    this.matchService.dislikeUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Disliked profile:', userId);
        },
        error: (error) => {
          console.error('Error disliking profile:', error);
        }
      });
  }

  viewProfile(userId: number): void {
    // Navigate to profile view
    console.log('Viewing profile:', userId);
  }

  loadMoreResults(): void {
    if (this.isLoadingMore || !this.hasMoreResults) return;
    
    this.isLoadingMore = true;
    this.currentPage++;
    
    const filters = this.buildSearchFilters();
    
    this.searchService.searchUsers(filters, this.currentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const newResults = response.data || [];
          this.searchResults = [...this.searchResults, ...newResults];
          this.hasMoreResults = response.has_more || false;
          this.isLoadingMore = false;
        },
        error: (error) => {
          console.error('Error loading more results:', error);
          this.isLoadingMore = false;
        }
      });
  }
} 