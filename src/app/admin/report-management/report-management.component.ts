import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-romantic text-gradient mb-2">🚨 Report Management</h1>
          <p class="text-gray-600">Handle user reports and content moderation</p>
        </div>

        <div class="card">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-3 px-4">Reported User</th>
                  <th class="text-left py-3 px-4">Type</th>
                  <th class="text-left py-3 px-4">Description</th>
                  <th class="text-left py-3 px-4">Status</th>
                  <th class="text-left py-3 px-4">Actions</th>
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
                    <div class="flex space-x-2">
                      <button class="btn-outline text-xs">Review</button>
                      <button class="btn-outline text-xs text-red-600">Suspend</button>
                    </div>
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
export class ReportManagementComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
} 