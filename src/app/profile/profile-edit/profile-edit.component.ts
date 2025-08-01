import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ProfileService, ProfileUpdateRequest } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { User, UserProfile, UserPreference } from '../../models/user.model';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-2">✏️ Edit Profile</h1>
              <p class="text-gray-600">Update your profile information to find better matches</p>
            </div>
            <button 
              (click)="goBack()"
              class="bg-white border-2 border-pink-500 text-pink-600 px-4 py-2 rounded-lg font-semibold hover:bg-pink-50 transition-colors">
              ← Back
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center min-h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>

        <!-- Profile Edit Form -->
        <div *ngIf="!isLoading" class="space-y-8">
          <!-- Progress Indicator -->
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-800">Profile Completion</h3>
              <span class="text-pink-600 font-bold">{{ completionPercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                [style.width.%]="completionPercentage">
              </div>
            </div>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-8">
            <!-- Basic Information -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
              <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span class="text-2xl mr-3">💝</span>
                Basic Information
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                  <input 
                    type="number" 
                    formControlName="height_cm"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., 165"
                    min="100"
                    max="250"
                  >
                  <div *ngIf="isFieldInvalid('height_cm')" class="text-red-500 text-sm mt-1">
                    Please enter a valid height
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    formControlName="weight_kg"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., 60"
                    min="30"
                    max="200"
                  >
                  <div *ngIf="isFieldInvalid('weight_kg')" class="text-red-500 text-sm mt-1">
                    Please enter a valid weight
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Body Type</label>
                  <select formControlName="body_type" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                    <option value="">Select body type</option>
                    <option value="slim">Slim</option>
                    <option value="average">Average</option>
                    <option value="athletic">Athletic</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Complexion</label>
                  <select formControlName="complexion" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                    <option value="">Select complexion</option>
                    <option value="very_fair">Very Fair</option>
                    <option value="fair">Fair</option>
                    <option value="wheatish">Wheatish</option>
                    <option value="brown">Brown</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                  <select formControlName="blood_group" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Marital Status</label>
                  <select formControlName="marital_status" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                    <option value="">Select marital status</option>
                    <option value="never_married">Never Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Location Information -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
              <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span class="text-2xl mr-3">📍</span>
                Location Information
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Current City</label>
                  <input 
                    type="text" 
                    formControlName="current_city"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Colombo"
                  >
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Current State</label>
                  <input 
                    type="text" 
                    formControlName="current_state"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Western Province"
                  >
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Current Country</label>
                  <input 
                    type="text" 
                    formControlName="current_country"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Sri Lanka"
                  >
                </div>
              </div>
            </div>

            <!-- Education & Career -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
              <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span class="text-2xl mr-3">🎓</span>
                Education & Career
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Education Level</label>
                  <select formControlName="education_level" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                    <option value="">Select education level</option>
                    <option value="high_school">High School</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Occupation</label>
                  <input 
                    type="text" 
                    formControlName="occupation"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Software Engineer"
                  >
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                  <input 
                    type="text" 
                    formControlName="company"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Tech Company"
                  >
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
                  <input 
                    type="text" 
                    formControlName="job_title"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Senior Developer"
                  >
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Annual Income (USD)</label>
                  <input 
                    type="number" 
                    formControlName="annual_income_usd"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., 50000"
                    min="0"
                  >
                </div>
              </div>
            </div>

            <!-- Personal Information -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
              <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span class="text-2xl mr-3">👤</span>
                Personal Information
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Religion</label>
                  <input 
                    type="text" 
                    formControlName="religion"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Buddhist"
                  >
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Caste</label>
                  <input 
                    type="text" 
                    formControlName="caste"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Sinhalese"
                  >
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Mother Tongue</label>
                  <input 
                    type="text" 
                    formControlName="mother_tongue"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Sinhala"
                  >
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Languages Known</label>
                  <input 
                    type="text" 
                    formControlName="languages_known"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Sinhala, English, Tamil"
                  >
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Diet</label>
                  <select formControlName="diet" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                    <option value="">Select diet preference</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non_vegetarian">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="jain">Jain</option>
                    <option value="occasionally_non_veg">Occasionally Non-Veg</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Smoking</label>
                  <select formControlName="smoking" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                    <option value="">Select smoking preference</option>
                    <option value="never">Never</option>
                    <option value="occasionally">Occasionally</option>
                    <option value="regularly">Regularly</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Drinking</label>
                  <select formControlName="drinking" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                    <option value="">Select drinking preference</option>
                    <option value="never">Never</option>
                    <option value="occasionally">Occasionally</option>
                    <option value="socially">Socially</option>
                    <option value="regularly">Regularly</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Hobbies</label>
                  <input 
                    type="text" 
                    formControlName="hobbies"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Reading, Traveling, Cooking"
                  >
                </div>
              </div>
            </div>

            <!-- About Me -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
              <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span class="text-2xl mr-3">💭</span>
                About Me
              </h2>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Tell us about yourself</label>
                <textarea 
                  formControlName="about_me"
                  rows="6"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  placeholder="Share your interests, hobbies, values, and what you're looking for in a partner..."
                ></textarea>
                <div *ngIf="isFieldInvalid('about_me')" class="text-red-500 text-sm mt-1">
                  About section is required (minimum 50 characters)
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  {{ profileForm.get('about_me')?.value?.length || 0 }}/500 characters
                </div>
              </div>
            </div>

            <!-- Looking For -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
              <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span class="text-2xl mr-3">💕</span>
                What I'm Looking For
              </h2>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Describe your ideal partner</label>
                <textarea 
                  formControlName="looking_for"
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  placeholder="Describe the qualities you're looking for in a partner..."
                ></textarea>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row justify-end gap-4">
              <button 
                type="button" 
                (click)="saveDraft()"
                [disabled]="isSubmitting"
                class="bg-white border-2 border-pink-500 text-pink-600 px-8 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-all duration-200">
                💾 Save Draft
              </button>
              <button 
                type="submit" 
                [disabled]="profileForm.invalid || isSubmitting"
                class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="isSubmitting" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                {{ isSubmitting ? 'Saving...' : '💝 Save Profile' }}
              </button>
            </div>
          </form>
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
export class ProfileEditComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  isSubmitting = false;
  isLoading = true;
  completionPercentage = 0;
  currentProfile: UserProfile | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      // Basic Information
      height_cm: ['', [Validators.min(100), Validators.max(250)]],
      weight_kg: ['', [Validators.min(30), Validators.max(200)]],
      body_type: [''],
      complexion: [''],
      blood_group: [''],
      marital_status: [''],
      
      // Location
      current_city: [''],
      current_state: [''],
      current_country: [''],
      
      // Education & Career
      education_level: [''],
      occupation: [''],
      company: [''],
      job_title: [''],
      annual_income_usd: ['', [Validators.min(0)]],
      
      // Personal Information
      religion: [''],
      caste: [''],
      mother_tongue: [''],
      languages_known: [''],
      diet: [''],
      smoking: [''],
      drinking: [''],
      hobbies: [''],
      
      // About
      about_me: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(500)]],
      looking_for: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadProfileData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfileData(): void {
    this.isLoading = true;

    combineLatest([
      this.profileService.getProfile(),
      this.profileService.getProfileCompletion()
    ]).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([profile, completion]) => {
        this.currentProfile = profile;
        this.completionPercentage = completion.completion_percentage;
        this.populateForm(profile);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile data:', error);
        this.isLoading = false;
      }
    });
  }

  private populateForm(profile: UserProfile): void {
    this.profileForm.patchValue({
      height_cm: profile.height_cm || '',
      weight_kg: profile.weight_kg || '',
      body_type: profile.body_type || '',
      complexion: profile.complexion || '',
      blood_group: profile.blood_group || '',
      marital_status: profile.marital_status || '',
      current_city: profile.current_city || '',
      current_state: profile.current_state || '',
      current_country: profile.current_country || '',
      education_level: profile.education_level || '',
      occupation: profile.occupation || '',
      company: profile.company || '',
      job_title: profile.job_title || '',
      annual_income_usd: profile.annual_income_usd || '',
      religion: profile.religion || '',
      caste: profile.caste || '',
      mother_tongue: profile.mother_tongue || '',
      languages_known: profile.languages_known?.join(', ') || '',
      diet: profile.diet || '',
      smoking: profile.smoking || '',
      drinking: profile.drinking || '',
      hobbies: profile.hobbies?.join(', ') || '',
      about_me: profile.about_me || '',
      looking_for: profile.looking_for || ''
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSubmitting = true;
      
      const formValue = this.profileForm.value;
      const updateRequest: ProfileUpdateRequest = {
        ...formValue,
        languages_known: formValue.languages_known ? formValue.languages_known.split(',').map((lang: string) => lang.trim()) : [],
        hobbies: formValue.hobbies ? formValue.hobbies.split(',').map((hobby: string) => hobby.trim()) : []
      };

      this.profileService.updateProfile(updateRequest).pipe(takeUntil(this.destroy$)).subscribe({
        next: (updatedProfile) => {
          this.currentProfile = updatedProfile;
          this.isSubmitting = false;
          this.showSuccessMessage();
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.isSubmitting = false;
          this.showErrorMessage('Failed to update profile. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  saveDraft(): void {
    // Save current form state to localStorage
    const formData = this.profileForm.value;
    localStorage.setItem('profile_draft', JSON.stringify(formData));
    this.showSuccessMessage('Draft saved successfully!');
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccessMessage(message: string = 'Profile updated successfully!'): void {
    // You can implement a toast notification service here
    console.log('Success:', message);
  }

  private showErrorMessage(message: string): void {
    // You can implement a toast notification service here
    console.error('Error:', message);
  }
} 