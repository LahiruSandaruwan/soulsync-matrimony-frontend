import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Category {
  label: string;
  value: string;
  icon?: string;
  count?: string;
}

interface CategoryGroup {
  title: string;
  filterKey: string;
  categories: Category[];
  bgColor: string;
}

@Component({
  selector: 'app-search-by-category',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="py-12 lg:py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Browse by Category</h2>
          <p class="text-gray-600">Find your perfect match by exploring profiles based on your preferences</p>
        </div>

        <div class="grid md:grid-cols-3 gap-6 lg:gap-8">
          <!-- Religion Category -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">By Religion</h3>
            </div>
            <div class="space-y-2">
              <a *ngFor="let cat of religions"
                 [routerLink]="['/app/browse']"
                 [queryParams]="{religion: cat.value}"
                 class="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 transition-colors group">
                <span class="text-gray-700 group-hover:text-purple-700">{{ cat.label }}</span>
                <svg class="w-4 h-4 text-gray-400 group-hover:text-purple-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Location Category -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">By Location</h3>
            </div>
            <div class="space-y-2">
              <a *ngFor="let cat of locations"
                 [routerLink]="['/app/browse']"
                 [queryParams]="{city: cat.value}"
                 class="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                <span class="text-gray-700 group-hover:text-blue-700">{{ cat.label }}</span>
                <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Profession Category -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">By Profession</h3>
            </div>
            <div class="space-y-2">
              <a *ngFor="let cat of professions"
                 [routerLink]="['/app/browse']"
                 [queryParams]="{occupation: cat.value}"
                 class="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors group">
                <span class="text-gray-700 group-hover:text-green-700">{{ cat.label }}</span>
                <svg class="w-4 h-4 text-gray-400 group-hover:text-green-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class SearchByCategoryComponent {
  religions: Category[] = [
    { label: 'Buddhist', value: 'Buddhist' },
    { label: 'Hindu', value: 'Hindu' },
    { label: 'Christian', value: 'Christian' },
    { label: 'Muslim', value: 'Muslim' },
    { label: 'Other', value: 'Other' }
  ];

  locations: Category[] = [
    { label: 'Colombo', value: 'Colombo' },
    { label: 'Kandy', value: 'Kandy' },
    { label: 'Galle', value: 'Galle' },
    { label: 'Jaffna', value: 'Jaffna' },
    { label: 'Negombo', value: 'Negombo' }
  ];

  professions: Category[] = [
    { label: 'Doctor / Medical', value: 'Doctor' },
    { label: 'Engineer / IT', value: 'Engineer' },
    { label: 'Teacher / Academic', value: 'Teacher' },
    { label: 'Business Owner', value: 'Business' },
    { label: 'Government', value: 'Government' }
  ];
}
