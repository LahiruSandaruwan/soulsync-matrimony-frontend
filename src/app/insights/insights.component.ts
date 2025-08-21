import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { InsightsService } from '../core/services/insights.service';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss']
})
export class InsightsComponent implements OnInit {
  loading = true;
  profileViews: any;
  matchAnalytics: any;
  compatibilityReports: any;
  profileOptimization: any;

  constructor(private insights: InsightsService) {}
  ngOnInit(): void {
    forkJoin({
      profileViews: this.insights.getProfileViews(),
      matchAnalytics: this.insights.getMatchAnalytics(),
      compatibilityReports: this.insights.getCompatibilityReports(),
      profileOptimization: this.insights.getProfileOptimization()
    }).subscribe({
      next: (data) => {
        this.profileViews = data.profileViews;
        this.matchAnalytics = data.matchAnalytics;
        this.compatibilityReports = data.compatibilityReports;
        this.profileOptimization = data.profileOptimization;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}


