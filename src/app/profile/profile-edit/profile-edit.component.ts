import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-romantic text-gradient mb-2">✏️ Edit Profile</h1>
          <p class="text-gray-600">Update your profile information to find better matches</p>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-8">
          <!-- Basic Information -->
          <div class="card">
            <h2 class="text-2xl font-romantic text-gradient mb-6">💝 Basic Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="form-label">Full Name *</label>
                <input 
                  type="text" 
                  formControlName="name"
                  class="input-field"
                  placeholder="Enter your full name"
                >
                <div *ngIf="profileForm.get('name')?.invalid && profileForm.get('name')?.touched" class="text-red-500 text-sm mt-1">
                  Name is required
                </div>
              </div>

              <div>
                <label class="form-label">Date of Birth *</label>
                <input 
                  type="date" 
                  formControlName="dateOfBirth"
                  class="input-field"
                >
                <div *ngIf="profileForm.get('dateOfBirth')?.invalid && profileForm.get('dateOfBirth')?.touched" class="text-red-500 text-sm mt-1">
                  Date of birth is required
                </div>
              </div>

              <div>
                <label class="form-label">Location *</label>
                <input 
                  type="text" 
                  formControlName="location"
                  class="input-field"
                  placeholder="City, Country"
                >
                <div *ngIf="profileForm.get('location')?.invalid && profileForm.get('location')?.touched" class="text-red-500 text-sm mt-1">
                  Location is required
                </div>
              </div>

              <div>
                <label class="form-label">Occupation *</label>
                <input 
                  type="text" 
                  formControlName="occupation"
                  class="input-field"
                  placeholder="Your profession"
                >
                <div *ngIf="profileForm.get('occupation')?.invalid && profileForm.get('occupation')?.touched" class="text-red-500 text-sm mt-1">
                  Occupation is required
                </div>
              </div>

              <div>
                <label class="form-label">Education</label>
                <select formControlName="education" class="input-field">
                  <option value="">Select education level</option>
                  <option value="high-school">High School</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="phd">PhD</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label class="form-label">Religion</label>
                <select formControlName="religion" class="input-field">
                  <option value="">Select religion</option>
                  <option value="buddhist">Buddhist</option>
                  <option value="christian">Christian</option>
                  <option value="hindu">Hindu</option>
                  <option value="muslim">Muslim</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <!-- About Me -->
          <div class="card">
            <h2 class="text-2xl font-romantic text-gradient mb-6">💭 About Me</h2>
            <div>
              <label class="form-label">Tell us about yourself *</label>
              <textarea 
                formControlName="about"
                rows="6"
                class="input-field resize-none"
                placeholder="Share your interests, hobbies, values, and what you're looking for in a partner..."
              ></textarea>
              <div *ngIf="profileForm.get('about')?.invalid && profileForm.get('about')?.touched" class="text-red-500 text-sm mt-1">
                About section is required (minimum 50 characters)
              </div>
            </div>
          </div>

          <!-- Preferences -->
          <div class="card">
            <h2 class="text-2xl font-romantic text-gradient mb-6">💕 Partner Preferences</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="form-label">Preferred Age Range</label>
                <div class="flex space-x-2">
                  <input 
                    type="number" 
                    formControlName="preferredAgeMin"
                    class="input-field"
                    placeholder="Min"
                    min="18"
                    max="80"
                  >
                  <span class="self-center text-gray-500">to</span>
                  <input 
                    type="number" 
                    formControlName="preferredAgeMax"
                    class="input-field"
                    placeholder="Max"
                    min="18"
                    max="80"
                  >
                </div>
              </div>

              <div>
                <label class="form-label">Preferred Location</label>
                <input 
                  type="text" 
                  formControlName="preferredLocation"
                  class="input-field"
                  placeholder="Preferred partner location"
                >
              </div>

              <div>
                <label class="form-label">Marital Status</label>
                <select formControlName="maritalStatus" class="input-field">
                  <option value="">Select marital status</option>
                  <option value="never-married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label class="form-label">Looking for</label>
                <select formControlName="lookingFor" class="input-field">
                  <option value="">Select gender preference</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Photos -->
          <div class="card">
            <h2 class="text-2xl font-romantic text-gradient mb-6">📸 Photos</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="aspect-square bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors cursor-pointer">
                <div class="text-center">
                  <span class="text-4xl mb-2 block">📷</span>
                  <span class="text-sm text-gray-500">Add Photo</span>
                </div>
              </div>
              <div class="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span class="text-gray-500">📷</span>
              </div>
              <div class="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span class="text-gray-500">📷</span>
              </div>
              <div class="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span class="text-gray-500">📷</span>
              </div>
            </div>
            <p class="text-sm text-gray-600 mt-4">Add up to 6 photos to showcase your personality</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-4">
            <button type="button" class="btn-outline">
              💾 Save Draft
            </button>
            <button type="submit" [disabled]="profileForm.invalid || isSubmitting" class="btn-primary">
              <span *ngIf="isSubmitting" class="loading-spinner mr-2"></span>
              {{ isSubmitting ? 'Saving...' : '💝 Save Profile' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', Validators.required],
      location: ['', Validators.required],
      occupation: ['', Validators.required],
      education: [''],
      religion: [''],
      about: ['', [Validators.required, Validators.minLength(50)]],
      preferredAgeMin: [18, [Validators.min(18), Validators.max(80)]],
      preferredAgeMax: [35, [Validators.min(18), Validators.max(80)]],
      preferredLocation: [''],
      maritalStatus: [''],
      lookingFor: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    // TODO: Load existing profile data from API
    const mockData = {
      name: 'Sarah Johnson',
      dateOfBirth: '1995-06-15',
      location: 'Colombo, Sri Lanka',
      occupation: 'Software Engineer',
      education: 'bachelors',
      religion: 'buddhist',
      about: 'I am a passionate individual looking for a meaningful relationship. I enjoy reading, traveling, and spending time with family and friends.',
      preferredAgeMin: 25,
      preferredAgeMax: 35,
      preferredLocation: 'Colombo, Sri Lanka',
      maritalStatus: 'never-married',
      lookingFor: 'male'
    };

    this.profileForm.patchValue(mockData);
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSubmitting = true;
      
      // TODO: Implement API call to save profile
      console.log('Saving profile:', this.profileForm.value);
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        // TODO: Show success message and navigate
        console.log('Profile saved successfully!');
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }
} 