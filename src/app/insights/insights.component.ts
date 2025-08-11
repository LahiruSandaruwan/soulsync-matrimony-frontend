import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsightsService } from '../core/services/insights.service';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
  <div class="p-6">
    <h1 class="text-3xl font-bold text-rose-600 mb-2">Premium Insights 💡</h1>
    <p class="text-gray-600 mb-6">Understand your profile performance and improve your matching.</p>
    <app-loading-spinner *ngIf="loading"></app-loading-spinner>
    <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 rounded-xl bg-white border border-pink-100 shadow">
        <h2 class="font-semibold mb-2">Profile Views 👀</h2>
        <pre class="text-sm text-gray-600 whitespace-pre-wrap">{{profileViews | json}}</pre>
      </div>
      <div class="p-4 rounded-xl bg-white border border-pink-100 shadow">
        <h2 class="font-semibold mb-2">Match Analytics 💞</h2>
        <pre class="text-sm text-gray-600 whitespace-pre-wrap">{{matchAnalytics | json}}</pre>
      </div>
      <div class="p-4 rounded-xl bg-white border border-pink-100 shadow">
        <h2 class="font-semibold mb-2">Compatibility Reports 🔭</h2>
        <pre class="text-sm text-gray-600 whitespace-pre-wrap">{{compatibilityReports | json}}</pre>
      </div>
      <div class="p-4 rounded-xl bg-white border border-pink-100 shadow">
        <h2 class="font-semibold mb-2">Profile Optimization 🛠️</h2>
        <pre class="text-sm text-gray-600 whitespace-pre-wrap">{{profileOptimization | json}}</pre>
      </div>
    </div>
  </div>
  `
})
export class InsightsComponent implements OnInit {
  loading = true;
  profileViews: any;
  matchAnalytics: any;
  compatibilityReports: any;
  profileOptimization: any;

  constructor(private insights: InsightsService) {}
  ngOnInit(): void {
    Promise.all([
      this.insights.getProfileViews().toPromise(),
      this.insights.getMatchAnalytics().toPromise(),
      this.insights.getCompatibilityReports().toPromise(),
      this.insights.getProfileOptimization().toPromise()
    ]).then(([v,a,c,o]) => {
      this.profileViews = v; this.matchAnalytics = a; this.compatibilityReports = c; this.profileOptimization = o; this.loading=false;
    }).catch(() => this.loading=false);
  }
}


