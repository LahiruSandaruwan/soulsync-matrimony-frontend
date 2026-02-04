import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BrowseService, RecentProfile } from '../../../core/services/browse.service';

@Component({
  selector: 'app-recently-joined',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-12 lg:py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">Recently Joined</h2>
            <p class="text-gray-600 mt-1">Welcome our newest members to the community</p>
          </div>
          <a (click)="viewAll()" class="hidden sm:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
            View All
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div *ngFor="let i of [1,2,3,4,5,6]" class="animate-pulse">
            <div class="bg-gray-200 rounded-2xl aspect-[3/4]"></div>
          </div>
        </div>

        <!-- Profiles Grid -->
        <div *ngIf="!loading && profiles.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div *ngFor="let profile of profiles"
               (click)="viewProfile(profile.id)"
               class="relative group cursor-pointer">
            <!-- Profile Card -->
            <div class="relative rounded-2xl overflow-hidden aspect-[3/4] bg-gray-100">
              <img
                [src]="profile.photo_url || 'assets/images/default-avatar.svg'"
                [alt]="profile.first_name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                (error)="onImageError($event)">

              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              <!-- New Badge -->
              <div *ngIf="profile.is_new" class="absolute top-3 left-3">
                <span class="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                  NEW
                </span>
              </div>

              <!-- Profile Info -->
              <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 class="font-semibold text-lg truncate">{{ profile.first_name }}</h3>
                <p *ngIf="profile.age" class="text-sm text-white/90">{{ profile.age }} years</p>
                <p *ngIf="profile.city" class="text-sm text-white/80 truncate flex items-center gap-1 mt-1">
                  <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  {{ profile.city }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && profiles.length === 0" class="text-center py-12">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <p class="text-gray-500">No new members yet</p>
        </div>

        <!-- Mobile View All -->
        <div class="mt-6 sm:hidden text-center">
          <a (click)="viewAll()" class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
            View All New Members
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  `
})
export class RecentlyJoinedComponent implements OnInit {
  profiles: RecentProfile[] = [];
  loading = true;

  constructor(
    private browseService: BrowseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.browseService.getRecentProfiles(6).subscribe({
      next: (profiles) => {
        this.profiles = profiles;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  viewProfile(id: number): void {
    this.router.navigate(['/app/profile', id]);
  }

  viewAll(): void {
    this.router.navigate(['/app/browse'], { queryParams: { sort: 'newest' } });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/default-avatar.svg';
    }
  }
}
