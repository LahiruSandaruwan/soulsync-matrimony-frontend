import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface UserSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  profile_visibility: 'public' | 'private' | 'friends_only';
  show_online_status: boolean;
  allow_messages_from: 'all' | 'matches_only' | 'none';
  data_sharing: boolean;
  marketing_emails: boolean;
}

interface SecuritySettings {
  two_factor_enabled: boolean;
  login_notifications: boolean;
  session_timeout: number;
  password_changed_at: string;
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    LoadingSpinnerComponent
  ],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: any = null;
  loading = true;
  saving = false;
  error = '';
  success = '';
  
  // Forms
  profileForm: FormGroup;
  passwordForm: FormGroup;
  notificationForm: FormGroup;
  privacyForm: FormGroup;
  
  // Settings
  userSettings: UserSettings = {
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    profile_visibility: 'public',
    show_online_status: true,
    allow_messages_from: 'matches_only',
    data_sharing: false,
    marketing_emails: false
  };
  
  securitySettings: SecuritySettings = {
    two_factor_enabled: false,
    login_notifications: true,
    session_timeout: 30,
    password_changed_at: ''
  };
  
  // UI State
  activeTab = 'profile';
  showPasswordModal = false;
  showDeleteAccountModal = false;
  showTwoFactorModal = false;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      date_of_birth: ['', Validators.required],
      gender: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.notificationForm = this.fb.group({
      email_notifications: [true],
      sms_notifications: [false],
      push_notifications: [true],
      marketing_emails: [false],
      login_notifications: [true]
    });

    this.privacyForm = this.fb.group({
      profile_visibility: ['public'],
      show_online_status: [true],
      allow_messages_from: ['matches_only'],
      data_sharing: [false]
    });
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
    const newPassword = form.get('new_password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.populateProfileForm();
        }
      });
  }

  private loadSettings(): void {
    this.loading = true;
    this.error = '';

    // Load user settings
    this.profileService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.userSettings = { ...this.userSettings, ...response.data.user_settings };
          this.securitySettings = { ...this.securitySettings, ...response.data.security_settings };
          this.populateForms();
          this.loading = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to load settings';
          this.loading = false;
        }
      });
  }

  private populateProfileForm(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        first_name: this.currentUser.first_name,
        last_name: this.currentUser.last_name,
        email: this.currentUser.email,
        phone: this.currentUser.phone || '',
        date_of_birth: this.currentUser.date_of_birth,
        gender: this.currentUser.gender
      });
    }
  }

  private populateForms(): void {
    this.notificationForm.patchValue({
      email_notifications: this.userSettings.email_notifications,
      sms_notifications: this.userSettings.sms_notifications,
      push_notifications: this.userSettings.push_notifications,
      marketing_emails: this.userSettings.marketing_emails,
      login_notifications: this.securitySettings.login_notifications
    });

    this.privacyForm.patchValue({
      profile_visibility: this.userSettings.profile_visibility,
      show_online_status: this.userSettings.show_online_status,
      allow_messages_from: this.userSettings.allow_messages_from,
      data_sharing: this.userSettings.data_sharing
    });
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    const profileData = this.profileForm.value;

    this.profileService.updateProfile(profileData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.success = 'Profile updated successfully!';
          this.saving = false;
          // Update current user in auth service
          this.authService.currentUserSubject.next(response.data.user);
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to update profile';
          this.saving = false;
        }
      });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    const passwordData = this.passwordForm.value;

    this.authService.changePassword(passwordData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = 'Password changed successfully!';
          this.saving = false;
          this.passwordForm.reset();
          this.showPasswordModal = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to change password';
          this.saving = false;
        }
      });
  }

  onSaveNotifications(): void {
    this.saving = true;
    this.error = '';
    this.success = '';

    const notificationData = this.notificationForm.value;

    this.profileService.updateNotificationSettings(notificationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = 'Notification settings updated successfully!';
          this.saving = false;
          this.userSettings = { ...this.userSettings, ...notificationData };
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to update notification settings';
          this.saving = false;
        }
      });
  }

  onSavePrivacy(): void {
    this.saving = true;
    this.error = '';
    this.success = '';

    const privacyData = this.privacyForm.value;

    this.profileService.updatePrivacySettings(privacyData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = 'Privacy settings updated successfully!';
          this.saving = false;
          this.userSettings = { ...this.userSettings, ...privacyData };
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to update privacy settings';
          this.saving = false;
        }
      });
  }

  onToggleTwoFactor(): void {
    this.showTwoFactorModal = true;
  }

  onEnableTwoFactor(): void {
    this.saving = true;
    this.error = '';
    this.success = '';

    this.authService.enableTwoFactor()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = 'Two-factor authentication enabled successfully!';
          this.saving = false;
          this.securitySettings.two_factor_enabled = true;
          this.showTwoFactorModal = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to enable two-factor authentication';
          this.saving = false;
        }
      });
  }

  onDeleteAccount(): void {
    this.saving = true;
    this.error = '';
    this.success = '';

    this.authService.deleteAccount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = 'Account deleted successfully!';
          this.saving = false;
          this.showDeleteAccountModal = false;
          // Redirect to logout
          setTimeout(() => {
            this.authService.logout();
          }, 2000);
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to delete account';
          this.saving = false;
        }
      });
  }

  onExportData(): void {
    this.saving = true;
    this.error = '';
    this.success = '';

    this.profileService.exportData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          // Create download link
          const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `soulsync-data-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          this.success = 'Data exported successfully!';
          this.saving = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to export data';
          this.saving = false;
        }
      });
  }

  onClearSuccess(): void {
    this.success = '';
  }

  onClearError(): void {
    this.error = '';
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (control && control.errors) {
      if (control.errors['required']) return `${field.replace('_', ' ')} is required`;
      if (control.errors['email']) return 'Please enter a valid email address';
      if (control.errors['minlength']) return `${field.replace('_', ' ')} must be at least ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['pattern']) return `Please enter a valid ${field.replace('_', ' ')}`;
    }
    return '';
  }

  getPasswordStrength(password: string): { strength: string; color: string; percentage: number } {
    if (!password) return { strength: '', color: '', percentage: 0 };
    
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    
    if (score <= 25) return { strength: 'Weak', color: '#ef4444', percentage: score };
    if (score <= 50) return { strength: 'Fair', color: '#f59e0b', percentage: score };
    if (score <= 75) return { strength: 'Good', color: '#3b82f6', percentage: score };
    return { strength: 'Strong', color: '#10b981', percentage: score };
  }
}
