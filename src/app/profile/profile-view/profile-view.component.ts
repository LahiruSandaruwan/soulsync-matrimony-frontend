import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <!-- Profile Header -->
        <div class="card-romantic mb-8">
          <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div class="relative">
              <img 
                src="assets/images/default-avatar.jpg" 
                alt="Profile Photo" 
                class="avatar-xl border-4 border-primary-200"
              >
              <div class="absolute -bottom-2 -right-2 bg-green-500 rounded-full w-6 h-6 border-2 border-white"></div>
            </div>
            <div class="flex-1 text-center md:text-left">
              <h1 class="text-3xl font-romantic text-gradient mb-2">👤 {{ user?.name || 'Your Name' }}</h1>
              <p class="text-gray-600 mb-2">{{ user?.age || '25' }} years • {{ user?.location || 'Colombo, Sri Lanka' }}</p>
              <p class="text-primary-600 font-medium">{{ user?.occupation || 'Software Engineer' }}</p>
              <div class="flex justify-center md:justify-start space-x-2 mt-4">
                <button class="btn-primary">
                  ✏️ Edit Profile
                </button>
                <button class="btn-outline">
                  📸 Add Photos
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Profile Info -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Basic Information -->
            <div class="card">
              <h2 class="text-2xl font-romantic text-gradient mb-4">💝 Basic Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Age</label>
                  <p class="text-gray-800">{{ user?.age || '25' }} years</p>
                </div>
                <div>
                  <label class="form-label">Location</label>
                  <p class="text-gray-800">{{ user?.location || 'Colombo, Sri Lanka' }}</p>
                </div>
                <div>
                  <label class="form-label">Occupation</label>
                  <p class="text-gray-800">{{ user?.occupation || 'Software Engineer' }}</p>
                </div>
                <div>
                  <label class="form-label">Education</label>
                  <p class="text-gray-800">{{ user?.education || 'Bachelor\'s Degree' }}</p>
                </div>
              </div>
            </div>

            <!-- About Me -->
            <div class="card">
              <h2 class="text-2xl font-romantic text-gradient mb-4">💭 About Me</h2>
              <p class="text-gray-700 leading-relaxed">
                {{ user?.about || 'I am a passionate individual looking for a meaningful relationship. I enjoy reading, traveling, and spending time with family and friends. I believe in mutual respect, understanding, and building a strong foundation for a lasting relationship.' }}
              </p>
            </div>

            <!-- Photos -->
            <div class="card">
              <h2 class="text-2xl font-romantic text-gradient mb-4">📸 Photos</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Profile Completion -->
            <div class="card">
              <h3 class="text-lg font-romantic text-gradient mb-3">📊 Profile Completion</h3>
              <div class="mb-3">
                <div class="flex justify-between text-sm mb-1">
                  <span>Profile Progress</span>
                  <span>75%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-primary-600 h-2 rounded-full" style="width: 75%"></div>
                </div>
              </div>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>✅ Basic Information</li>
                <li>✅ Profile Photo</li>
                <li>❌ Additional Photos</li>
                <li>❌ Family Information</li>
              </ul>
            </div>

            <!-- Quick Actions -->
            <div class="card">
              <h3 class="text-lg font-romantic text-gradient mb-3">⚡ Quick Actions</h3>
              <div class="space-y-2">
                <button class="w-full btn-secondary text-sm">
                  🔍 View My Matches
                </button>
                <button class="w-full btn-outline text-sm">
                  💬 Check Messages
                </button>
                <button class="w-full btn-outline text-sm">
                  ⭐ Upgrade Plan
                </button>
              </div>
            </div>

            <!-- Profile Views -->
            <div class="card">
              <h3 class="text-lg font-romantic text-gradient mb-3">👀 Profile Views</h3>
              <div class="text-center">
                <div class="text-3xl font-bold text-primary-600 mb-1">24</div>
                <p class="text-sm text-gray-600">This week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileViewComponent implements OnInit {
  user: any = {
    name: 'Sarah Johnson',
    age: 28,
    location: 'Colombo, Sri Lanka',
    occupation: 'Software Engineer',
    education: 'Bachelor\'s Degree in Computer Science',
    about: 'I am a passionate individual looking for a meaningful relationship. I enjoy reading, traveling, and spending time with family and friends. I believe in mutual respect, understanding, and building a strong foundation for a lasting relationship.'
  };

  constructor() { }

  ngOnInit(): void {
    // Load user profile data
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    // TODO: Implement API call to load user profile
    console.log('Loading user profile...');
  }
} 