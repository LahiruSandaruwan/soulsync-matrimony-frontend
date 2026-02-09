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
    <div class="search-page">
      <!-- Header -->
      <div class="search-header">
        <div class="header-content">
          <h1><span class="header-icon">🔍</span> Find Your Perfect Match</h1>
          <p>Search for people based on your preferences</p>
        </div>
      </div>

      <!-- Advanced Search Form -->
      <div class="search-form-card">
        <form [formGroup]="searchForm" (ngSubmit)="performSearch()">
          <!-- Basic Filters -->
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label">Age Range</label>
              <div class="age-range-inputs">
                <input
                  type="number"
                  formControlName="ageMin"
                  placeholder="Min"
                  class="filter-input"
                  min="18"
                  max="80"
                >
                <span class="range-separator">to</span>
                <input
                  type="number"
                  formControlName="ageMax"
                  placeholder="Max"
                  class="filter-input"
                  min="18"
                  max="80"
                >
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">Location</label>
              <input
                type="text"
                formControlName="location"
                placeholder="City, Country"
                class="filter-input"
              >
            </div>

            <div class="filter-group">
              <label class="filter-label">Religion</label>
              <select formControlName="religion" class="filter-select">
                <option value="">Any Religion</option>
                <option value="buddhist">Buddhist</option>
                <option value="christian">Christian</option>
                <option value="hindu">Hindu</option>
                <option value="muslim">Muslim</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Education</label>
              <select formControlName="education" class="filter-select">
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
          <div class="filters-grid filters-grid-3">
            <div class="filter-group">
              <label class="filter-label">Marital Status</label>
              <select formControlName="maritalStatus" class="filter-select">
                <option value="">Any Status</option>
                <option value="never-married">Never Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Occupation</label>
              <input
                type="text"
                formControlName="occupation"
                placeholder="e.g., Engineer, Teacher"
                class="filter-input"
              >
            </div>

            <div class="filter-group">
              <label class="filter-label">Looking for</label>
              <select formControlName="lookingFor" class="filter-select">
                <option value="">Any Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button type="button" class="btn-reset" (click)="resetForm()">
              <span class="btn-icon">🔄</span> Reset Filters
            </button>
            <button type="submit" class="btn-search" [disabled]="isSearching">
              <span *ngIf="isSearching" class="spinner"></span>
              <span class="btn-icon" *ngIf="!isSearching">🔍</span>
              {{ isSearching ? 'Searching...' : 'Search' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Search Results -->
      <div *ngIf="searchResults.length > 0" class="results-section">
        <div class="results-header">
          <h2>Found {{ totalResults }} matches</h2>
          <div class="sort-buttons">
            <button
              class="sort-btn"
              (click)="sortBy('compatibility')"
              [class.active]="currentSort === 'compatibility'"
            >
              💕 Best Match
            </button>
            <button
              class="sort-btn"
              (click)="sortBy('age')"
              [class.active]="currentSort === 'age'"
            >
              📅 Age
            </button>
            <button
              class="sort-btn"
              (click)="sortBy('distance')"
              [class.active]="currentSort === 'distance'"
            >
              📍 Distance
            </button>
          </div>
        </div>

        <!-- Results Grid -->
        <div class="results-grid">
          <div *ngFor="let result of searchResults" class="result-card">
            <app-user-card
              [user]="result.user"
              [showActions]="true"
              [showMatchPercentage]="true"
              (like)="likeProfile(result.user.id)"
              (dislike)="dislikeProfile(result.user.id)"
              (viewProfile)="viewProfile(result.user.id)">
            </app-user-card>

            <!-- Compatibility Info -->
            <div class="compatibility-info">
              <div class="score-row">
                <span class="score-label">Match Score:</span>
                <span class="score-value">{{ result.compatibility_score }}%</span>
              </div>

              <div class="score-bar">
                <div class="score-fill" [style.width.%]="result.compatibility_score"></div>
              </div>

              <div *ngIf="result.distance_km" class="distance-info">
                📍 {{ result.distance_km }} km away
              </div>

              <div *ngIf="result.matching_factors?.length" class="matching-factors">
                <p class="factors-label">Matching factors:</p>
                <div class="factors-list">
                  <span *ngFor="let factor of result.matching_factors.slice(0, 3)" class="factor-tag">
                    {{ factor }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div class="load-more" *ngIf="hasMoreResults">
          <button (click)="loadMoreResults()" class="btn-load-more" [disabled]="isLoadingMore">
            <span *ngIf="isLoadingMore" class="spinner"></span>
            {{ isLoadingMore ? 'Loading...' : '💕 Load More Results' }}
          </button>
        </div>
      </div>

      <!-- No Results -->
      <div *ngIf="hasSearched && searchResults.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No matches found</h3>
        <p>Try adjusting your search criteria to find more matches</p>
        <button class="btn-search" (click)="resetForm()">
          <span class="btn-icon">🔄</span> Reset Filters
        </button>
      </div>

      <!-- Initial State -->
      <div *ngIf="!hasSearched" class="empty-state">
        <div class="empty-icon">💕</div>
        <h3>Ready to find your perfect match?</h3>
        <p>Use the search filters above to discover people who match your preferences</p>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

    :host {
      --cream-white: #FFFBF7;
      --warm-gray-50: #faf8f6;
      --warm-gray-100: #f5f3f0;
      --warm-gray-200: #e8e5e1;
      --warm-gray-300: #d4d0ca;
      --warm-gray-400: #a8a29e;
      --warm-gray-500: #78746e;
      --warm-gray-600: #5c5955;
      --warm-gray-700: #45433f;
      --warm-gray-800: #2d2b28;
      --rose-50: #fff1f2;
      --rose-100: #ffe4e6;
      --rose-200: #fecdd3;
      --rose-300: #fda4af;
      --rose-400: #fb7185;
      --rose-500: #f43f5e;
      --pink-400: #f472b6;
      --pink-500: #ec4899;
      --pink-600: #db2777;
      --success: #10b981;
      --font-display: 'DM Serif Display', Georgia, serif;
      --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .search-page {
      min-height: calc(100vh - 80px);
      padding: 2rem;
      font-family: var(--font-body);
      color: var(--warm-gray-700);
      background: linear-gradient(180deg, var(--cream-white) 0%, var(--warm-gray-50) 100%);
    }

    .search-header {
      margin-bottom: 2rem;
      padding: 1.5rem 2rem;
      background: #ffffff;
      border: 1px solid var(--warm-gray-200);
      border-radius: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .search-header h1 {
      font-family: var(--font-display);
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 400;
      color: var(--warm-gray-800);
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .header-icon {
      font-size: 1.5rem;
    }

    .search-header p {
      font-size: 0.95rem;
      color: var(--warm-gray-500);
      margin: 0;
    }

    .search-form-card {
      padding: 2rem;
      background: #ffffff;
      border: 1px solid var(--warm-gray-200);
      border-radius: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      margin-bottom: 2rem;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .filters-grid-3 {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--warm-gray-600);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .filter-input,
    .filter-select {
      padding: 0.75rem 1rem;
      background: var(--warm-gray-50);
      border: 1px solid var(--warm-gray-200);
      border-radius: 0.75rem;
      color: var(--warm-gray-700);
      font-family: var(--font-body);
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }

    .filter-input::placeholder {
      color: var(--warm-gray-400);
    }

    .filter-input:focus,
    .filter-select:focus {
      outline: none;
      border-color: var(--pink-400);
      box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
      background: #ffffff;
    }

    .filter-select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2378746e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 1.25rem;
      padding-right: 2.5rem;
    }

    .filter-select option {
      background: #ffffff;
      color: var(--warm-gray-700);
      padding: 0.5rem;
    }

    .age-range-inputs {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .age-range-inputs .filter-input {
      width: 80px;
      text-align: center;
    }

    .range-separator {
      color: var(--warm-gray-500);
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--warm-gray-200);
      margin-top: 1.5rem;
    }

    .btn-reset {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: #ffffff;
      border: 1px solid var(--warm-gray-200);
      border-radius: 0.75rem;
      color: var(--warm-gray-600);
      font-family: var(--font-body);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-reset:hover {
      background: var(--rose-50);
      border-color: var(--rose-200);
      color: var(--pink-600);
    }

    .btn-search {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 2rem;
      background: linear-gradient(135deg, var(--pink-500), var(--rose-500));
      border: none;
      border-radius: 0.75rem;
      color: white;
      font-family: var(--font-body);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-search:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(236, 72, 153, 0.35);
    }

    .btn-search:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-icon {
      font-size: 1rem;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .results-section {
      margin-top: 2rem;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .results-header h2 {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 400;
      color: var(--warm-gray-800);
      margin: 0;
    }

    .sort-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .sort-btn {
      padding: 0.5rem 1rem;
      background: #ffffff;
      border: 1px solid var(--warm-gray-200);
      border-radius: 0.5rem;
      color: var(--warm-gray-600);
      font-family: var(--font-body);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .sort-btn:hover,
    .sort-btn.active {
      background: var(--rose-50);
      border-color: var(--rose-200);
      color: var(--pink-600);
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .result-card {
      background: #ffffff;
      border: 1px solid var(--warm-gray-200);
      border-radius: 1rem;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .result-card:hover {
      border-color: var(--rose-300);
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
    }

    .compatibility-info {
      padding: 1rem;
      background: var(--warm-gray-50);
      border-top: 1px solid var(--warm-gray-100);
    }

    .score-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .score-label {
      font-size: 0.85rem;
      color: var(--warm-gray-500);
    }

    .score-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--pink-500);
    }

    .score-bar {
      height: 6px;
      background: var(--warm-gray-200);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .score-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--pink-500), var(--rose-400));
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .distance-info {
      font-size: 0.85rem;
      color: var(--warm-gray-500);
    }

    .matching-factors {
      margin-top: 0.75rem;
    }

    .factors-label {
      font-size: 0.75rem;
      color: var(--warm-gray-500);
      margin: 0 0 0.5rem 0;
    }

    .factors-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .factor-tag {
      padding: 0.25rem 0.5rem;
      background: var(--rose-50);
      border: 1px solid var(--rose-200);
      border-radius: 0.25rem;
      font-size: 0.7rem;
      color: var(--pink-600);
    }

    .load-more {
      text-align: center;
      margin-top: 2rem;
    }

    .btn-load-more {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 2rem;
      background: #ffffff;
      border: 1px solid var(--warm-gray-200);
      border-radius: 0.75rem;
      color: var(--warm-gray-600);
      font-family: var(--font-body);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-load-more:hover:not(:disabled) {
      background: var(--rose-50);
      border-color: var(--rose-200);
      color: var(--pink-600);
    }

    .btn-load-more:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: #ffffff;
      border: 1px solid var(--warm-gray-200);
      border-radius: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 400;
      color: var(--warm-gray-800);
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      font-size: 1rem;
      color: var(--warm-gray-500);
      margin: 0 0 1.5rem 0;
    }

    @media (max-width: 768px) {
      .search-page {
        padding: 1rem;
      }

      .search-form-card {
        padding: 1.5rem;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
        gap: 1rem;
      }

      .btn-reset,
      .btn-search {
        width: 100%;
        justify-content: center;
      }

      .results-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .sort-buttons {
        flex-wrap: wrap;
      }
    }
  `]
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