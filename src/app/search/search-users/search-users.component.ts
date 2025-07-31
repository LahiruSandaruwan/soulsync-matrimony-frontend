import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
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
              Found {{ searchResults.length }} matches
            </h2>
            <div class="flex space-x-2">
              <button 
                class="btn-outline text-sm"
                (click)="sortBy('compatibility')"
              >
                💕 Best Match
              </button>
              <button 
                class="btn-outline text-sm"
                (click)="sortBy('age')"
              >
                📅 Age
              </button>
              <button 
                class="btn-outline text-sm"
                (click)="sortBy('location')"
              >
                📍 Location
              </button>
            </div>
          </div>

          <!-- Results Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div *ngFor="let user of searchResults" class="profile-card group">
              <!-- Profile Image -->
              <div class="relative mb-4">
                <img 
                  [src]="user.profileImage || 'assets/images/default-avatar.jpg'" 
                  [alt]="user.name"
                  class="w-full h-48 object-cover rounded-lg"
                >
                <div class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                  <span class="text-xl">💖</span>
                </div>
                <div class="absolute bottom-4 left-4 bg-white rounded-full px-3 py-1 shadow-lg">
                  <span class="text-sm font-medium text-gray-700">{{ user.age }} years</span>
                </div>
              </div>

              <!-- Profile Info -->
              <div class="space-y-3">
                <div>
                  <h3 class="text-lg font-romantic text-gradient">{{ user.name }}</h3>
                  <p class="text-gray-600 text-sm">{{ user.location }}</p>
                </div>

                <div class="space-y-2">
                  <p class="text-sm text-gray-700">
                    <span class="font-medium">💼</span> {{ user.occupation }}
                  </p>
                  <p class="text-sm text-gray-700">
                    <span class="font-medium">🎓</span> {{ user.education }}
                  </p>
                  <p class="text-sm text-gray-700">
                    <span class="font-medium">🙏</span> {{ user.religion }}
                  </p>
                </div>

                <p class="text-sm text-gray-600 line-clamp-2">
                  {{ user.about }}
                </p>

                <!-- Compatibility Score -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Match:</span>
                  <div class="flex items-center space-x-1">
                    <div class="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-gradient-to-r from-primary-500 to-rose-500 h-2 rounded-full" 
                        [style.width.%]="user.compatibilityScore"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-primary-600">{{ user.compatibilityScore }}%</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex space-x-2 pt-2">
                  <button 
                    (click)="likeProfile(user.id)" 
                    class="flex-1 btn-primary text-sm"
                    [disabled]="user.isLiked"
                  >
                    {{ user.isLiked ? '❤️ Liked' : '💖 Like' }}
                  </button>
                  <button 
                    (click)="viewProfile(user.id)" 
                    class="flex-1 btn-outline text-sm"
                  >
                    👤 View
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div class="text-center mt-8">
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
export class SearchUsersComponent implements OnInit {
  searchForm: FormGroup;
  searchResults: any[] = [];
  isSearching = false;
  isLoadingMore = false;
  hasSearched = false;

  constructor(private fb: FormBuilder) {
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
    // Initialize with default values
  }

  performSearch(): void {
    this.isSearching = true;
    this.hasSearched = true;
    
    // TODO: Implement API call to search users
    setTimeout(() => {
      this.searchResults = [
        {
          id: 1,
          name: 'Priya Sharma',
          age: 26,
          location: 'Colombo, Sri Lanka',
          occupation: 'Marketing Manager',
          education: 'Master\'s Degree',
          religion: 'Hindu',
          about: 'I love traveling, reading books, and spending time with family. Looking for someone who values family and has similar interests.',
          compatibilityScore: 85,
          profileImage: null,
          isLiked: false
        },
        {
          id: 2,
          name: 'Aisha Khan',
          age: 24,
          location: 'Kandy, Sri Lanka',
          occupation: 'Software Developer',
          education: 'Bachelor\'s Degree',
          religion: 'Muslim',
          about: 'Passionate about technology and innovation. I enjoy hiking, cooking, and learning new things.',
          compatibilityScore: 78,
          profileImage: null,
          isLiked: false
        },
        {
          id: 3,
          name: 'Nimali Perera',
          age: 28,
          location: 'Galle, Sri Lanka',
          occupation: 'Teacher',
          education: 'Bachelor\'s Degree',
          religion: 'Buddhist',
          about: 'Dedicated teacher who loves children and education. I enjoy gardening, cooking traditional food, and meditation.',
          compatibilityScore: 92,
          profileImage: null,
          isLiked: false
        }
      ];
      this.isSearching = false;
    }, 1000);
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
  }

  sortBy(criteria: string): void {
    // TODO: Implement sorting logic
    console.log('Sorting by:', criteria);
  }

  likeProfile(userId: number): void {
    const user = this.searchResults.find(u => u.id === userId);
    if (user) {
      user.isLiked = true;
      // TODO: Implement API call to like profile
      console.log('Liked profile:', userId);
    }
  }

  viewProfile(userId: number): void {
    // TODO: Navigate to profile view
    console.log('Viewing profile:', userId);
  }

  loadMoreResults(): void {
    this.isLoadingMore = true;
    // TODO: Implement pagination to load more results
    setTimeout(() => {
      this.isLoadingMore = false;
    }, 1000);
  }
} 