import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-romantic text-gradient mb-2">⚙️ Account Settings</h1>
          <p class="text-gray-600">Manage your account preferences and security</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Settings Navigation -->
          <div class="lg:col-span-1">
            <div class="card">
              <nav class="space-y-2">
                <button 
                  *ngFor="let section of settingsSections" 
                  class="w-full text-left px-4 py-3 rounded-lg transition-colors"
                  [class.bg-primary-100]="activeSection === section.id"
                  [class.text-primary-700]="activeSection === section.id"
                  [class.bg-gray-50]="activeSection !== section.id"
                  [class.text-gray-700]="activeSection !== section.id"
                  (click)="setActiveSection(section.id)"
                >
                  <div class="flex items-center space-x-3">
                    <span class="text-xl">{{ section.icon }}</span>
                    <span class="font-medium">{{ section.label }}</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          <!-- Settings Content -->
          <div class="lg:col-span-2">
            <!-- Profile Settings -->
            <div *ngIf="activeSection === 'profile'" class="card">
              <h2 class="text-2xl font-romantic text-gradient mb-6">👤 Profile Settings</h2>
              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="form-label">Display Name</label>
                    <input 
                      type="text" 
                      formControlName="displayName"
                      class="input-field"
                      placeholder="Your display name"
                    >
                  </div>
                  <div>
                    <label class="form-label">Email</label>
                    <input 
                      type="email" 
                      formControlName="email"
                      class="input-field"
                      placeholder="your@email.com"
                    >
                  </div>
                  <div>
                    <label class="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      formControlName="phone"
                      class="input-field"
                      placeholder="+94 71 123 4567"
                    >
                  </div>
                  <div>
                    <label class="form-label">Date of Birth</label>
                    <input 
                      type="date" 
                      formControlName="dateOfBirth"
                      class="input-field"
                    >
                  </div>
                </div>
                <div class="flex justify-end">
                  <button type="submit" class="btn-primary" [disabled]="isSaving">
                    <span *ngIf="isSaving" class="loading-spinner mr-2"></span>
                    {{ isSaving ? 'Saving...' : '💾 Save Changes' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Security Settings -->
            <div *ngIf="activeSection === 'security'" class="card">
              <h2 class="text-2xl font-romantic text-gradient mb-6">🔒 Security Settings</h2>
              <div class="space-y-6">
                <!-- Change Password -->
                <div class="border-b pb-6">
                  <h3 class="text-lg font-medium mb-4">Change Password</h3>
                  <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4">
                    <div>
                      <label class="form-label">Current Password</label>
                      <input 
                        type="password" 
                        formControlName="currentPassword"
                        class="input-field"
                        placeholder="Enter current password"
                      >
                    </div>
                    <div>
                      <label class="form-label">New Password</label>
                      <input 
                        type="password" 
                        formControlName="newPassword"
                        class="input-field"
                        placeholder="Enter new password"
                      >
                    </div>
                    <div>
                      <label class="form-label">Confirm New Password</label>
                      <input 
                        type="password" 
                        formControlName="confirmPassword"
                        class="input-field"
                        placeholder="Confirm new password"
                      >
                    </div>
                    <button type="submit" class="btn-primary" [disabled]="isChangingPassword">
                      <span *ngIf="isChangingPassword" class="loading-spinner mr-2"></span>
                      {{ isChangingPassword ? 'Changing...' : '🔐 Change Password' }}
                    </button>
                  </form>
                </div>

                <!-- Two-Factor Authentication -->
                <div class="border-b pb-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-medium">Two-Factor Authentication</h3>
                      <p class="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <button class="btn-outline">🔐 Enable 2FA</button>
                  </div>
                </div>

                <!-- Login Sessions -->
                <div>
                  <h3 class="text-lg font-medium mb-4">Active Sessions</h3>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p class="font-medium">Chrome on Windows</p>
                        <p class="text-sm text-gray-600">Colombo, Sri Lanka • Last active: 2 hours ago</p>
                      </div>
                      <button class="text-red-600 hover:text-red-700 text-sm">Sign Out</button>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p class="font-medium">Safari on iPhone</p>
                        <p class="text-sm text-gray-600">Kandy, Sri Lanka • Last active: 1 day ago</p>
                      </div>
                      <button class="text-red-600 hover:text-red-700 text-sm">Sign Out</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Privacy Settings -->
            <div *ngIf="activeSection === 'privacy'" class="card">
              <h2 class="text-2xl font-romantic text-gradient mb-6">🔒 Privacy Settings</h2>
              <div class="space-y-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium">Profile Visibility</h3>
                      <p class="text-sm text-gray-600">Control who can see your profile</p>
                    </div>
                    <select class="input-field w-32">
                      <option value="public">Public</option>
                      <option value="members">Members Only</option>
                      <option value="matches">Matches Only</option>
                    </select>
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium">Show Online Status</h3>
                      <p class="text-sm text-gray-600">Let others know when you're online</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" class="sr-only peer" checked>
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium">Show Last Seen</h3>
                      <p class="text-sm text-gray-600">Show when you were last active</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium">Profile Views</h3>
                      <p class="text-sm text-gray-600">Show who viewed your profile</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" class="sr-only peer" checked>
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notification Settings -->
            <div *ngIf="activeSection === 'notifications'" class="card">
              <h2 class="text-2xl font-romantic text-gradient mb-6">🔔 Notification Preferences</h2>
              <div class="space-y-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium">New Matches</h3>
                      <p class="text-sm text-gray-600">Get notified when you have new matches</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" class="sr-only peer" checked>
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium">New Messages</h3>
                      <p class="text-sm text-gray-600">Get notified when you receive new messages</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" class="sr-only peer" checked>
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium">Profile Likes</h3>
                      <p class="text-sm text-gray-600">Get notified when someone likes your profile</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" class="sr-only peer" checked>
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium">Email Notifications</h3>
                      <p class="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Account Management -->
            <div *ngIf="activeSection === 'account'" class="card">
              <h2 class="text-2xl font-romantic text-gradient mb-6">🗑️ Account Management</h2>
              <div class="space-y-6">
                <div class="border-b pb-6">
                  <h3 class="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                  <p class="text-sm text-gray-600 mb-4">These actions cannot be undone</p>
                  
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <h4 class="font-medium text-red-800">Deactivate Account</h4>
                        <p class="text-sm text-red-600">Temporarily disable your account</p>
                      </div>
                      <button class="btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
                        Deactivate
                      </button>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <h4 class="font-medium text-red-800">Delete Account</h4>
                        <p class="text-sm text-red-600">Permanently delete your account and all data</p>
                      </div>
                      <button class="btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-lg font-medium mb-4">Data Export</h3>
                  <p class="text-sm text-gray-600 mb-4">Download a copy of your data</p>
                  <button class="btn-outline">📥 Export Data</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AccountSettingsComponent implements OnInit {
  activeSection = 'profile';
  isSaving = false;
  isChangingPassword = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  settingsSections = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'account', label: 'Account', icon: '🗑️' }
  ];

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dateOfBirth: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  loadUserData(): void {
    // TODO: Load user data from API
    const userData = {
      displayName: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+94 71 123 4567',
      dateOfBirth: '1995-06-15'
    };

    this.profileForm.patchValue(userData);
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;
      
      // TODO: Implement API call to save profile
      console.log('Saving profile:', this.profileForm.value);
      
      setTimeout(() => {
        this.isSaving = false;
        console.log('Profile saved successfully!');
      }, 1000);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true;
      
      // TODO: Implement API call to change password
      console.log('Changing password:', this.passwordForm.value);
      
      setTimeout(() => {
        this.isChangingPassword = false;
        this.passwordForm.reset();
        console.log('Password changed successfully!');
      }, 1000);
    }
  }
} 