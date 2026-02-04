import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TrustBadge {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-trust-badges',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-8 bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          <div *ngFor="let badge of badges"
               class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div [class]="'w-10 h-10 rounded-lg flex items-center justify-center ' + badge.color">
              <span [innerHTML]="badge.icon" class="w-5 h-5"></span>
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ badge.title }}</p>
              <p class="text-xs text-gray-500">{{ badge.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class TrustBadgesComponent {
  badges: TrustBadge[] = [
    {
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
      title: 'SSL Secured',
      description: '256-bit encryption',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
      title: '100% Verified',
      description: 'All profiles checked',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      title: 'Privacy First',
      description: 'Your data is safe',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
      title: '24/7 Support',
      description: 'Always here to help',
      color: 'bg-amber-100 text-amber-600'
    },
    {
      icon: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
      title: '50,000+ Members',
      description: 'Growing community',
      color: 'bg-rose-100 text-rose-600'
    }
  ];
}
