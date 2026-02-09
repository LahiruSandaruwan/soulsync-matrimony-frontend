import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  saving = false;
  error = '';
  success = '';
  
  profileForm!: FormGroup;
  currentUser: any = null;
  profileData: any = null;
  
  // Form options
  educationLevels = [
    'high_school', 'diploma', 'bachelors', 'masters', 'phd', 'other'
  ];
  
  bodyTypes = ['slim', 'average', 'athletic', 'heavy'];
  complexions = ['very_fair', 'fair', 'wheatish', 'brown', 'dark', 'very_dark'];
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  familyTypes = ['nuclear', 'joint'];
  familyStatuses = ['middle_class', 'upper_middle_class', 'rich', 'affluent'];
  diets = ['vegetarian', 'non_vegetarian', 'vegan', 'jain', 'occasionally_non_veg'];
  smokingHabits = ['never', 'occasionally', 'regularly'];
  drinkingHabits = ['never', 'occasionally', 'socially', 'regularly'];
  maritalStatuses = ['never_married', 'divorced', 'widowed', 'separated'];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadProfileData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      // Basic Information
      height_cm: ['', [Validators.min(100), Validators.max(250)]],
      weight_kg: ['', [Validators.min(30), Validators.max(200)]],
      body_type: [''],
      complexion: [''],
      blood_group: [''],
      
      // Location
      current_city: ['', Validators.required],
      current_state: ['', Validators.required],
      current_country: ['', Validators.required],
      
      // Education & Career
      education_level: [''],
      occupation: [''],
      company: [''],
      job_title: [''],
      annual_income_usd: ['', [Validators.min(0)]],
      
      // Personal Details
      religion: [''],
      caste: [''],
      mother_tongue: [''],
      languages_known: [[]],
      family_type: [''],
      family_status: [''],
      diet: [''],
      smoking: [''],
      drinking: [''],
      hobbies: [[]],
      about_me: ['', [Validators.maxLength(1000)]],
      looking_for: ['', [Validators.maxLength(500)]],
      
      // Marital Status
      marital_status: [''],
      have_children: [false],
      children_count: ['', [Validators.min(0), Validators.max(10)]],
      
      // Preferences
      willing_to_relocate: [false],
      preferred_locations: [[]]
    });
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  loadProfileData(): void {
    this.loading = true;
    this.error = '';

    this.profileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profileData = profile;
          this.populateForm(profile);
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load profile data. Please try again.';
          this.loading = false;
          console.error('Error loading profile:', error);
        }
      });
  }

  private populateForm(profile: any): void {
    if (profile) {
      this.profileForm.patchValue({
        height_cm: profile.height_cm || '',
        weight_kg: profile.weight_kg || '',
        body_type: profile.body_type || '',
        complexion: profile.complexion || '',
        blood_group: profile.blood_group || '',
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
        languages_known: profile.languages_known || [],
        family_type: profile.family_type || '',
        family_status: profile.family_status || '',
        diet: profile.diet || '',
        smoking: profile.smoking || '',
        drinking: profile.drinking || '',
        hobbies: profile.hobbies || [],
        about_me: profile.about_me || '',
        looking_for: profile.looking_for || '',
        marital_status: profile.marital_status || '',
        have_children: profile.have_children || false,
        children_count: profile.children_count || '',
        willing_to_relocate: profile.willing_to_relocate || false,
        preferred_locations: profile.preferred_locations || []
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    const formData = this.profileForm.value;

    this.profileService.updateProfile(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.success = 'Profile updated successfully!';
          this.saving = false;
          
          // Update current user data
          if (this.currentUser) {
            this.currentUser.profile = { ...this.currentUser.profile, ...formData };
            this.authService.currentUserSubject.next(this.currentUser);
          }
          
          // Navigate back to profile view after a short delay
          setTimeout(() => {
            this.router.navigate(['/app/profile']);
          }, 2000);
        },
        error: (error) => {
          this.error = error.message || 'Failed to update profile. Please try again.';
          this.saving = false;
          console.error('Error updating profile:', error);
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/app/profile']);
  }

  onAddLanguage(): void {
    const languages = this.profileForm.get('languages_known')?.value || [];
    const newLanguage = prompt('Enter a language:');
    if (newLanguage && !languages.includes(newLanguage)) {
      this.profileForm.patchValue({
        languages_known: [...languages, newLanguage]
      });
    }
  }

  onRemoveLanguage(language: string): void {
    const languages = this.profileForm.get('languages_known')?.value || [];
    this.profileForm.patchValue({
      languages_known: languages.filter((l: string) => l !== language)
    });
  }

  onAddHobby(): void {
    const hobbies = this.profileForm.get('hobbies')?.value || [];
    const newHobby = prompt('Enter a hobby:');
    if (newHobby && !hobbies.includes(newHobby)) {
      this.profileForm.patchValue({
        hobbies: [...hobbies, newHobby]
      });
    }
  }

  onRemoveHobby(hobby: string): void {
    const hobbies = this.profileForm.get('hobbies')?.value || [];
    this.profileForm.patchValue({
      hobbies: hobbies.filter((h: string) => h !== hobby)
    });
  }

  onAddPreferredLocation(): void {
    const locations = this.profileForm.get('preferred_locations')?.value || [];
    const newLocation = prompt('Enter a preferred location:');
    if (newLocation && !locations.includes(newLocation)) {
      this.profileForm.patchValue({
        preferred_locations: [...locations, newLocation]
      });
    }
  }

  onRemovePreferredLocation(location: string): void {
    const locations = this.profileForm.get('preferred_locations')?.value || [];
    this.profileForm.patchValue({
      preferred_locations: locations.filter((l: string) => l !== location)
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'This field is required.';
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}.`;
      if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}.`;
      if (field.errors['maxlength']) return `Maximum length is ${field.errors['maxlength'].requiredLength} characters.`;
    }
    return '';
  }

  getCompletionPercentage(): number {
    const totalFields = Object.keys(this.profileForm.controls).length;
    const filledFields = Object.keys(this.profileForm.controls).filter(key => {
      const control = this.profileForm.get(key);
      const value = control?.value;
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== '');
    }).length;
    
    return Math.round((filledFields / totalFields) * 100);
  }
}
