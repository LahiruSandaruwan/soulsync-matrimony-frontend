import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-romantic text-gradient mb-2">👥 User Management</h1>
          <p class="text-gray-600">Manage platform users and their accounts</p>
        </div>

        <!-- Search and Filters -->
        <div class="card mb-6">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex-1 min-w-64">
              <input 
                type="text" 
                placeholder="Search users..." 
                class="input-field"
                [(ngModel)]="searchTerm"
              >
            </div>
            <select class="input-field w-32">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <select class="input-field w-32">
              <option value="">All Plans</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
            </select>
            <button class="btn-primary">🔍 Search</button>
          </div>
        </div>

        <!-- Users Table -->
        <div class="card">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-3 px-4">User</th>
                  <th class="text-left py-3 px-4">Email</th>
                  <th class="text-left py-3 px-4">Status</th>
                  <th class="text-left py-3 px-4">Plan</th>
                  <th class="text-left py-3 px-4">Joined</th>
                  <th class="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users" class="border-b hover:bg-gray-50">
                  <td class="py-3 px-4">
                    <div class="flex items-center space-x-3">
                      <img 
                        [src]="user.profileImage || 'assets/images/default-avatar.jpg'" 
                        [alt]="user.name"
                        class="avatar-sm"
                      >
                      <div>
                        <p class="font-medium">{{ user.name }}</p>
                        <p class="text-sm text-gray-600">{{ user.age }} years</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">{{ user.email }}</td>
                  <td class="py-3 px-4">
                    <span 
                      class="px-2 py-1 rounded-full text-xs"
                      [class.bg-green-100]="user.status === 'active'"
                      [class.text-green-800]="user.status === 'active'"
                      [class.bg-red-100]="user.status === 'suspended'"
                      [class.text-red-800]="user.status === 'suspended'"
                      [class.bg-yellow-100]="user.status === 'pending'"
                      [class.text-yellow-800]="user.status === 'pending'"
                    >
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span 
                      class="px-2 py-1 rounded-full text-xs"
                      [class.bg-blue-100]="user.plan === 'premium'"
                      [class.text-blue-800]="user.plan === 'premium'"
                      [class.bg-purple-100]="user.plan === 'vip'"
                      [class.text-purple-800]="user.plan === 'vip'"
                      [class.bg-gray-100]="user.plan === 'basic'"
                      [class.text-gray-800]="user.plan === 'basic'"
                    >
                      {{ user.plan }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-600">{{ user.joinedDate }}</td>
                  <td class="py-3 px-4">
                    <div class="flex space-x-2">
                      <button class="btn-outline text-xs">👤 View</button>
                      <button class="btn-outline text-xs">✏️ Edit</button>
                      <button 
                        class="btn-outline text-xs"
                        [class.text-red-600]="user.status === 'active'"
                        [class.border-red-600]="user.status === 'active'"
                        (click)="toggleUserStatus(user)"
                      >
                        {{ user.status === 'active' ? '🚫 Suspend' : '✅ Activate' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center mt-6">
            <p class="text-sm text-gray-600">Showing 1-10 of 1,284 users</p>
            <div class="flex space-x-2">
              <button class="btn-outline text-sm">← Previous</button>
              <button class="btn-outline text-sm">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UserManagementComponent implements OnInit {
  searchTerm = '';
  users: any[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // TODO: Load users from API
    this.users = [
      {
        id: 1,
        name: 'Priya Sharma',
        email: 'priya@example.com',
        age: 26,
        status: 'active',
        plan: 'premium',
        joinedDate: '2024-01-15',
        profileImage: null
      },
      {
        id: 2,
        name: 'Aisha Khan',
        email: 'aisha@example.com',
        age: 24,
        status: 'active',
        plan: 'basic',
        joinedDate: '2024-01-20',
        profileImage: null
      },
      {
        id: 3,
        name: 'John Doe',
        email: 'john@example.com',
        age: 28,
        status: 'suspended',
        plan: 'vip',
        joinedDate: '2024-01-10',
        profileImage: null
      }
    ];
  }

  toggleUserStatus(user: any): void {
    // TODO: Implement API call to toggle user status
    user.status = user.status === 'active' ? 'suspended' : 'active';
    console.log('Toggled user status:', user.id, user.status);
  }
} 