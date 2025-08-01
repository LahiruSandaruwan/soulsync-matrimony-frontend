import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { User, UserProfile, UserPhoto } from '../../models/user.model';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div class="container mx-auto px-4 py-8">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center min-h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>

        <!-- Profile Content -->
        <div *ngIf="!isLoading" class="space-y-8">
          <!-- Profile Header -->
          <div class="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
            <div class="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <!-- Profile Photo -->
              <div class="relative">
                <div class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-pink-200 shadow-lg">
                  <img 
                    [src]="primaryPhoto?.file_path || 'assets/images/default-avatar.jpg'" 
                    [alt]="currentUser?.first_name + ' ' + currentUser?.last_name"
                    class="w-full h-full object-cover"
                    (error)="onImageError($event)"
                  >
                </div>
                <div class="absolute -bottom-2 -right-2 bg-green-500 rounded-full w-8 h-8 border-4 border-white flex items-center justify-center">
                  <span class="text-white text-xs">✓</span>
                </div>
                <div *ngIf="profile?.completion_percentage && profile.completion_percentage < 70" 
                     class="absolute -top-2 -right-2 bg-orange-500 rounded-full w-8 h-8 border-4 border-white flex items-center justify-center">
                  <span class="text-white text-xs">!</span>
                </div>
              </div>

              <!-- Profile Info -->
              <div class="flex-1 text-center md:text-left">
                <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  {{ currentUser?.first_name }} {{ currentUser?.last_name }}
                </h1>
                                 <p class="text-lg text-gray-600 mb-2">
                   {{ calculateAge(currentUser?.date_of_birth) }} years • 
                   {{ profile?.current_city }}{{ profile?.current_city && profile?.current_country ? ', ' : '' }}{{ profile?.current_country || 'Location not set' }}
                 </p>
                                 <p class="text-pink-600 font-semibold text-lg mb-4">
                   {{ profile?.occupation || 'Occupation not set' }}{{ profile?.company ? ' at ' + profile?.company : '' }}
                 </p>
                
                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <button 
                    (click)="editProfile()"
                    class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                    ✏️ Edit Profile
                  </button>
                  <button 
                    (click)="addPhotos()"
                    class="bg-white border-2 border-pink-500 text-pink-600 px-6 py-3 rounded-full font-semibold hover:bg-pink-50 transition-all duration-200">
                    📸 Add Photos
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Completion Alert -->
          <div *ngIf="profile?.completion_percentage && profile.completion_percentage < 70" 
               class="bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-xl p-6">
            <div class="flex items-center space-x-3">
              <div class="text-orange-600 text-2xl">⚠️</div>
              <div class="flex-1">
                <h3 class="font-semibold text-orange-800">Complete Your Profile</h3>
                <p class="text-orange-700 text-sm">Your profile is {{ profile.completion_percentage }}% complete. Complete it to get more matches!</p>
              </div>
              <button 
                (click)="completeProfile()"
                class="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
                Complete Now
              </button>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Profile Info -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Basic Information -->
              <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span class="text-2xl mr-3">💝</span>
                  Basic Information
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Age</label>
                    <p class="text-gray-800 text-lg">{{ calculateAge(currentUser?.date_of_birth) }} years</p>
                  </div>
                                     <div>
                     <label class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location</label>
                     <p class="text-gray-800 text-lg">
                       {{ profile?.current_city || 'Not specified' }}{{ profile?.current_city && profile?.current_state ? ', ' : '' }}{{ profile?.current_state || '' }}
                       {{ profile?.current_country ? ', ' + profile?.current_country : '' }}
                     </p>
                   </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Education</label>
                    <p class="text-gray-800 text-lg">{{ profile?.education_level || 'Not specified' }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Occupation</label>
                    <p class="text-gray-800 text-lg">{{ profile?.occupation || 'Not specified' }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Religion</label>
                    <p class="text-gray-800 text-lg">{{ profile?.religion || 'Not specified' }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Mother Tongue</label>
                    <p class="text-gray-800 text-lg">{{ profile?.mother_tongue || 'Not specified' }}</p>
                  </div>
                </div>
              </div>

              <!-- About Me -->
              <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span class="text-2xl mr-3">💭</span>
                  About Me
                </h2>
                <p class="text-gray-700 leading-relaxed text-lg">
                  {{ profile?.about_me || 'Tell us about yourself to help others get to know you better.' }}
                </p>
              </div>

              <!-- Photos Gallery -->
              <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <span class="text-2xl mr-3">📸</span>
                    Photos
                  </h2>
                  <button 
                    (click)="addPhotos()"
                    class="text-pink-600 hover:text-pink-700 font-semibold text-sm">
                    + Add More
                  </button>
                </div>
                
                <div *ngIf="photos.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div 
                    *ngFor="let photo of photos; trackBy: trackByPhotoId"
                    class="relative group aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                    <img 
                      [src]="photo.file_path" 
                      [alt]="'Photo ' + photo.id"
                      class="w-full h-full object-cover"
                      (error)="onImageError($event)"
                    >
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2">
                        <button 
                          *ngIf="!photo.is_primary"
                          (click)="setPrimaryPhoto(photo.id)"
                          class="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
                          👑
                        </button>
                        <button 
                          (click)="deletePhoto(photo.id)"
                          class="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div *ngIf="photo.is_primary" class="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Primary
                    </div>
                  </div>
                </div>
                
                <div *ngIf="photos.length === 0" class="text-center py-12">
                  <div class="text-6xl mb-4">📷</div>
                  <h3 class="text-xl font-semibold text-gray-700 mb-2">No Photos Yet</h3>
                  <p class="text-gray-500 mb-4">Add photos to your profile to get more attention</p>
                  <button 
                    (click)="addPhotos()"
                    class="bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors">
                    Upload Photos
                  </button>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
              <!-- Profile Completion -->
              <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span class="text-xl mr-2">📊</span>
                  Profile Completion
                </h3>
                <div class="mb-4">
                  <div class="flex justify-between text-sm mb-2">
                    <span class="font-semibold text-gray-700">Progress</span>
                    <span class="font-bold text-pink-600">{{ profile?.completion_percentage || 0 }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      class="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      [style.width.%]="profile?.completion_percentage || 0">
                    </div>
                  </div>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li class="flex items-center">
                    <span class="mr-2">{{ profile?.height_cm ? '✅' : '❌' }}</span>
                    Basic Information
                  </li>
                  <li class="flex items-center">
                    <span class="mr-2">{{ photos.length > 0 ? '✅' : '❌' }}</span>
                    Profile Photo
                  </li>
                  <li class="flex items-center">
                    <span class="mr-2">{{ photos.length > 1 ? '✅' : '❌' }}</span>
                    Additional Photos
                  </li>
                  <li class="flex items-center">
                    <span class="mr-2">{{ profile?.about_me ? '✅' : '❌' }}</span>
                    About Me
                  </li>
                </ul>
              </div>

              <!-- Quick Actions -->
              <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span class="text-xl mr-2">⚡</span>
                  Quick Actions
                </h3>
                <div class="space-y-3">
                  <button 
                    (click)="viewMatches()"
                    class="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                    🔍 View My Matches
                  </button>
                  <button 
                    (click)="checkMessages()"
                    class="w-full bg-white border-2 border-pink-500 text-pink-600 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-all duration-200">
                    💬 Check Messages
                  </button>
                  <button 
                    (click)="upgradePlan()"
                    class="w-full bg-white border-2 border-purple-500 text-purple-600 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200">
                    ⭐ Upgrade Plan
                  </button>
                </div>
              </div>

              <!-- Profile Stats -->
              <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span class="text-xl mr-2">📈</span>
                  Profile Stats
                </h3>
                <div class="space-y-4">
                  <div class="text-center">
                    <div class="text-3xl font-bold text-pink-600 mb-1">{{ profileViews }}</div>
                    <p class="text-sm text-gray-600">Profile Views</p>
                  </div>
                  <div class="text-center">
                    <div class="text-3xl font-bold text-purple-600 mb-1">{{ likesReceived }}</div>
                    <p class="text-sm text-gray-600">Likes Received</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-gradient-romantic {
      background: linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%);
    }
    
    .text-gradient {
      background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `]
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  profile: UserProfile | null = null;
  photos: UserPhoto[] = [];
  primaryPhoto: UserPhoto | null = null;
  isLoading = true;
  profileViews = 0;
  likesReceived = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfileData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfileData(): void {
    this.isLoading = true;

    // Load current user
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
    });

    // Load profile data
    combineLatest([
      this.profileService.getProfile(),
      this.profileService.getPhotos()
    ]).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([profile, photos]) => {
        this.profile = profile;
        this.photos = photos;
        this.primaryPhoto = this.profileService.getPrimaryPhoto();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile data:', error);
        this.isLoading = false;
      }
    });
  }

  calculateAge(dateOfBirth: string | undefined): number {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  addPhotos(): void {
    this.router.navigate(['/profile/photos']);
  }

  completeProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  viewMatches(): void {
    this.router.navigate(['/matches']);
  }

  checkMessages(): void {
    this.router.navigate(['/chat']);
  }

  upgradePlan(): void {
    this.router.navigate(['/subscription']);
  }

  setPrimaryPhoto(photoId: number): void {
    this.profileService.setPrimaryPhoto(photoId).subscribe({
      next: (updatedPhoto) => {
        this.primaryPhoto = updatedPhoto;
        // Update photos array
        this.photos = this.photos.map(photo => ({
          ...photo,
          is_primary: photo.id === photoId
        }));
      },
      error: (error) => {
        console.error('Error setting primary photo:', error);
      }
    });
  }

  deletePhoto(photoId: number): void {
    if (confirm('Are you sure you want to delete this photo?')) {
      this.profileService.deletePhoto(photoId).subscribe({
        next: () => {
          this.photos = this.photos.filter(photo => photo.id !== photoId);
          if (this.primaryPhoto?.id === photoId) {
            this.primaryPhoto = this.photos.find(photo => photo.is_primary) || null;
          }
        },
        error: (error) => {
          console.error('Error deleting photo:', error);
        }
      });
    }
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/default-avatar.jpg';
  }

  trackByPhotoId(index: number, photo: UserPhoto): number {
    return photo.id;
  }
} 