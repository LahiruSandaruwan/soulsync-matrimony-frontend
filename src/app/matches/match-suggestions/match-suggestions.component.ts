import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-match-suggestions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-romantic text-gradient mb-2">💕 Your Matches</h1>
          <p class="text-gray-600">Discover people who might be perfect for you</p>
        </div>

        <!-- Filters -->
        <div class="card mb-8">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex-1 min-w-48">
              <label class="form-label">Age Range</label>
              <div class="flex space-x-2">
                <input type="number" placeholder="Min" class="input-field" min="18" max="80">
                <span class="self-center text-gray-500">to</span>
                <input type="number" placeholder="Max" class="input-field" min="18" max="80">
              </div>
            </div>
            <div class="flex-1 min-w-48">
              <label class="form-label">Location</label>
              <input type="text" placeholder="City, Country" class="input-field">
            </div>
            <div class="flex-1 min-w-48">
              <label class="form-label">Religion</label>
              <select class="input-field">
                <option value="">Any Religion</option>
                <option value="buddhist">Buddhist</option>
                <option value="christian">Christian</option>
                <option value="hindu">Hindu</option>
                <option value="muslim">Muslim</option>
              </select>
            </div>
            <div class="flex space-x-2">
              <button class="btn-primary">🔍 Search</button>
              <button class="btn-outline">🔄 Reset</button>
            </div>
          </div>
        </div>

        <!-- Match Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div *ngFor="let match of matches" class="match-card group">
            <!-- Profile Image -->
            <div class="relative mb-4">
              <img 
                [src]="match.profileImage || 'assets/images/default-avatar.jpg'" 
                [alt]="match.name"
                class="w-full h-64 object-cover rounded-lg"
              >
              <div class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                <span class="text-2xl">💖</span>
              </div>
              <div class="absolute bottom-4 left-4 bg-white rounded-full px-3 py-1 shadow-lg">
                <span class="text-sm font-medium text-gray-700">{{ match.age }} years</span>
              </div>
            </div>

            <!-- Profile Info -->
            <div class="space-y-3">
              <div>
                <h3 class="text-xl font-romantic text-gradient">{{ match.name }}</h3>
                <p class="text-gray-600 text-sm">{{ match.location }}</p>
              </div>

              <div class="space-y-2">
                <p class="text-sm text-gray-700">
                  <span class="font-medium">💼</span> {{ match.occupation }}
                </p>
                <p class="text-sm text-gray-700">
                  <span class="font-medium">🎓</span> {{ match.education }}
                </p>
                <p class="text-sm text-gray-700">
                  <span class="font-medium">🙏</span> {{ match.religion }}
                </p>
              </div>

              <p class="text-sm text-gray-600 line-clamp-3">
                {{ match.about }}
              </p>

              <!-- Compatibility Score -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600">Compatibility:</span>
                  <div class="flex items-center space-x-1">
                    <div class="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-gradient-to-r from-primary-500 to-rose-500 h-2 rounded-full" 
                        [style.width.%]="match.compatibilityScore"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-primary-600">{{ match.compatibilityScore }}%</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-2 pt-2">
                <button 
                  (click)="likeProfile(match.id)" 
                  class="flex-1 btn-primary text-sm"
                  [disabled]="match.isLiked"
                >
                  {{ match.isLiked ? '❤️ Liked' : '💖 Like' }}
                </button>
                <button 
                  (click)="superLike(match.id)" 
                  class="flex-1 btn-secondary text-sm"
                  [disabled]="match.isSuperLiked"
                >
                  {{ match.isSuperLiked ? '⭐ Super Liked' : '⭐ Super Like' }}
                </button>
                <button 
                  (click)="viewProfile(match.id)" 
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
            (click)="loadMoreMatches()" 
            class="btn-primary"
            [disabled]="isLoading"
          >
            <span *ngIf="isLoading" class="loading-spinner mr-2"></span>
            {{ isLoading ? 'Loading...' : '💕 Load More Matches' }}
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="matches.length === 0 && !isLoading" class="text-center py-12">
          <div class="text-6xl mb-4">💔</div>
          <h3 class="text-xl font-romantic text-gradient mb-2">No matches found</h3>
          <p class="text-gray-600 mb-4">Try adjusting your search criteria or check back later</p>
          <button class="btn-primary">🔍 Update Preferences</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MatchSuggestionsComponent implements OnInit {
  matches: any[] = [];
  isLoading = false;

  constructor() { }

  ngOnInit(): void {
    this.loadMatches();
  }

  loadMatches(): void {
    this.isLoading = true;
    
    // TODO: Implement API call to load matches
    setTimeout(() => {
      this.matches = [
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
          isLiked: false,
          isSuperLiked: false
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
          isLiked: false,
          isSuperLiked: false
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
          isLiked: false,
          isSuperLiked: false
        },
        {
          id: 4,
          name: 'Maria Silva',
          age: 25,
          location: 'Negombo, Sri Lanka',
          occupation: 'Nurse',
          education: 'Diploma',
          religion: 'Christian',
          about: 'Caring and compassionate nurse who loves helping others. I enjoy beach walks, reading, and spending time with friends.',
          compatibilityScore: 76,
          profileImage: null,
          isLiked: false,
          isSuperLiked: false
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  likeProfile(matchId: number): void {
    const match = this.matches.find(m => m.id === matchId);
    if (match) {
      match.isLiked = true;
      // TODO: Implement API call to like profile
      console.log('Liked profile:', matchId);
    }
  }

  superLike(matchId: number): void {
    const match = this.matches.find(m => m.id === matchId);
    if (match) {
      match.isSuperLiked = true;
      // TODO: Implement API call to super like profile
      console.log('Super liked profile:', matchId);
    }
  }

  viewProfile(matchId: number): void {
    // TODO: Navigate to profile view
    console.log('Viewing profile:', matchId);
  }

  loadMoreMatches(): void {
    this.isLoading = true;
    // TODO: Implement pagination to load more matches
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
} 