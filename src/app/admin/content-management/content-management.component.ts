import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-romantic text-gradient mb-2">📝 Content Management</h1>
          <p class="text-gray-600">Manage platform content and announcements</p>
        </div>

        <div class="card">
          <h2 class="text-xl font-romantic text-gradient mb-4">System Announcements</h2>
          <button class="btn-primary mb-4">📢 Create Announcement</button>
          
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <h3 class="font-medium">Platform Maintenance</h3>
              <p class="text-sm text-gray-600">Scheduled maintenance on Sunday at 2 AM</p>
              <div class="flex space-x-2 mt-2">
                <button class="btn-outline text-xs">Edit</button>
                <button class="btn-outline text-xs text-red-600">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ContentManagementComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
} 