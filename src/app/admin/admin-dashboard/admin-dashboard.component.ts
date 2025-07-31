import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-romantic text-gradient mb-2">👑 Admin Dashboard</h1>
          <p class="text-gray-600">Manage your matrimony platform</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total Users</p>
                <p class="text-3xl font-bold text-gray-900">12,847</p>
                <p class="text-sm text-green-600">+12% from last month</p>
              </div>
              <div class="text-3xl">👥</div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Active Matches</p>
                <p class="text-3xl font-bold text-gray-900">3,421</p>
                <p class="text-sm text-green-600">+8% from last month</p>
              </div>
              <div class="text-3xl">💕</div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Premium Users</p>
                <p class="text-3xl font-bold text-gray-900">2,156</p>
                <p class="text-sm text-green-600">+15% from last month</p>
              </div>
              <div class="text-3xl">💎</div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Revenue</p>
                <p class="text-3xl font-bold text-gray-900">$45,230</p>
                <p class="text-sm text-green-600">+23% from last month</p>
              </div>
              <div class="text-3xl">💰</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div class="card">
            <h2 class="text-xl font-romantic text-gradient mb-4">⚡ Quick Actions</h2>
            <div class="grid grid-cols-2 gap-4">
              <button class="btn-primary text-sm">
                👥 Manage Users
              </button>
              <button class="btn-secondary text-sm">
                📊 View Reports
              </button>
              <button class="btn-outline text-sm">
                ⚙️ System Settings
              </button>
              <button class="btn-outline text-sm">
                📧 Send Announcement
              </button>
            </div>
          </div>

          <div class="card">
            <h2 class="text-xl font-romantic text-gradient mb-4">📈 Recent Activity</h2>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm">New user registration: Priya Sharma</span>
                <span class="text-xs text-gray-500">2 min ago</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-sm">Premium subscription: Aisha Khan</span>
                <span class="text-xs text-gray-500">15 min ago</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span class="text-sm">Profile report submitted</span>
                <span class="text-xs text-gray-500">1 hour ago</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm">New match created</span>
                <span class="text-xs text-gray-500">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts and Analytics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div class="card">
            <h2 class="text-xl font-romantic text-gradient mb-4">📊 User Growth</h2>
            <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span class="text-gray-500">Chart placeholder</span>
            </div>
          </div>

          <div class="card">
            <h2 class="text-xl font-romantic text-gradient mb-4">💕 Match Success Rate</h2>
            <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span class="text-gray-500">Chart placeholder</span>
            </div>
          </div>
        </div>

        <!-- Recent Reports -->
        <div class="card">
          <h2 class="text-xl font-romantic text-gradient mb-4">🚨 Recent Reports</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-3 px-4">User</th>
                  <th class="text-left py-3 px-4">Type</th>
                  <th class="text-left py-3 px-4">Description</th>
                  <th class="text-left py-3 px-4">Status</th>
                  <th class="text-left py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b">
                  <td class="py-3 px-4">John Doe</td>
                  <td class="py-3 px-4">Inappropriate Content</td>
                  <td class="py-3 px-4">Profile photo violates guidelines</td>
                  <td class="py-3 px-4">
                    <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      Pending
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <button class="btn-outline text-sm">Review</button>
                  </td>
                </tr>
                <tr class="border-b">
                  <td class="py-3 px-4">Jane Smith</td>
                  <td class="py-3 px-4">Fake Profile</td>
                  <td class="py-3 px-4">Suspicious activity detected</td>
                  <td class="py-3 px-4">
                    <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                      Suspended
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <button class="btn-outline text-sm">Review</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Load dashboard data from API
    console.log('Loading admin dashboard data...');
  }
} 