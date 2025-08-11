import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BrowseService } from '../../core/services/browse.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-browse-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
  <div class="px-4 py-6">
    <h1 class="text-3xl font-bold text-rose-600 mb-4">Discover Profiles ✨</h1>
    <div class="flex gap-2 mb-4">
      <button class="btn" (click)="loadAll()">All</button>
      <button class="btn" (click)="loadPremium()">Premium 💎</button>
      <button class="btn" (click)="loadRecent()">Recently Joined 🆕</button>
      <button class="btn" (click)="loadVerified()">Verified ✅</button>
    </div>
    <app-loading-spinner *ngIf="loading"></app-loading-spinner>
    <div *ngIf="!loading && users.length === 0" class="text-gray-500">No profiles to show.</div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div *ngFor="let u of users" class="p-4 rounded-xl shadow bg-white border border-pink-100">
        <div class="flex items-center gap-3">
          <img [src]="u.profile_photo || '/assets/images/default-avatar.png'" alt="" class="w-12 h-12 rounded-full object-cover" />
          <div>
            <div class="font-semibold">{{u.first_name}} {{u.last_name}}</div>
            <div class="text-sm text-gray-500">{{u.current_city || ''}}</div>
          </div>
        </div>
        <div class="mt-3 text-sm">Compatibility: <span class="font-semibold">{{u.compatibility_score || 0}}%</span></div>
        <div class="mt-3">
          <a [routerLink]="['/profile', u.id]" class="text-rose-600 hover:underline">View Profile →</a>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .btn { @apply px-3 py-2 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 transition; }
  `]
})
export class BrowseListComponent implements OnInit, OnDestroy {
  users: any[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(private browse: BrowseService) {}

  ngOnInit(): void { this.loadAll(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadAll(): void {
    this.loading = true;
    this.browse.getAll().pipe(takeUntil(this.destroy$)).subscribe({ next: d => { this.users = d; this.loading = false; }, error: _ => this.loading = false });
  }
  loadPremium(): void {
    this.loading = true;
    this.browse.getPremium().pipe(takeUntil(this.destroy$)).subscribe({ next: d => { this.users = d; this.loading = false; }, error: _ => this.loading = false });
  }
  loadRecent(): void {
    this.loading = true;
    this.browse.getRecent().pipe(takeUntil(this.destroy$)).subscribe({ next: d => { this.users = d; this.loading = false; }, error: _ => this.loading = false });
  }
  loadVerified(): void {
    this.loading = true;
    this.browse.getVerified().pipe(takeUntil(this.destroy$)).subscribe({ next: d => { this.users = d; this.loading = false; }, error: _ => this.loading = false });
  }
}


