import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { InsightsService } from '../core/services/insights.service';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';

// Register Chart.js components
Chart.register(...registerables);

interface AnalyticsData {
  profileViews: any;
  matchAnalytics: any;
  compatibilityReports: any;
  profileOptimization: any;
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss']
})
export class InsightsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('profileViewsChart', { static: false }) profileViewsChart!: ElementRef;
  @ViewChild('matchSuccessChart', { static: false }) matchSuccessChart!: ElementRef;
  @ViewChild('compatibilityChart', { static: false }) compatibilityChart!: ElementRef;
  @ViewChild('optimizationChart', { static: false }) optimizationChart!: ElementRef;
  @ViewChild('weeklyTrendChart', { static: false }) weeklyTrendChart!: ElementRef;
  @ViewChild('userEngagementChart', { static: false }) userEngagementChart!: ElementRef;

  private destroy$ = new Subject<void>();
  private charts: Chart[] = [];

  loading = true;
  selectedTimeRange = '30'; // days
  selectedMetric = 'views';

  // Data properties
  profileViews: any = {};
  matchAnalytics: any = {};
  compatibilityReports: any = {};
  profileOptimization: any = {};

  // Time range options
  timeRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ];

  // Metric options
  metricOptions = [
    { value: 'views', label: 'Profile Views' },
    { value: 'matches', label: 'Matches' },
    { value: 'likes', label: 'Likes Received' },
    { value: 'messages', label: 'Messages' }
  ];

  constructor(private insights: InsightsService) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  /**
   * Load all analytics data
   */
  loadAnalyticsData(): void {
    this.loading = true;
    
    forkJoin({
      profileViews: this.insights.getProfileViews(),
      matchAnalytics: this.insights.getMatchAnalytics(),
      compatibilityReports: this.insights.getCompatibilityReports(),
      profileOptimization: this.insights.getProfileOptimization()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: AnalyticsData) => {
        this.profileViews = data.profileViews || this.generateMockProfileViews();
        this.matchAnalytics = data.matchAnalytics || this.generateMockMatchAnalytics();
        this.compatibilityReports = data.compatibilityReports || this.generateMockCompatibility();
        this.profileOptimization = data.profileOptimization || this.generateMockOptimization();
        
        this.loading = false;
        
        // Initialize charts after data is loaded
        setTimeout(() => {
          this.initializeCharts();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.generateMockData();
        this.loading = false;
        
        setTimeout(() => {
          this.initializeCharts();
        }, 100);
      }
    });
  }

  /**
   * Handle time range change
   */
  onTimeRangeChange(): void {
    this.loadAnalyticsData();
  }

  /**
   * Handle metric change
   */
  onMetricChange(): void {
    this.updateChartsWithNewMetric();
  }

  /**
   * Initialize all charts
   */
  private initializeCharts(): void {
    this.createProfileViewsChart();
    this.createMatchSuccessChart();
    this.createCompatibilityChart();
    this.createOptimizationChart();
    this.createWeeklyTrendChart();
    this.createUserEngagementChart();
  }

  /**
   * Create profile views chart
   */
  private createProfileViewsChart(): void {
    if (!this.profileViewsChart?.nativeElement) return;

    const ctx = this.profileViewsChart.nativeElement.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.profileViews.labels || this.generateDateLabels(),
        datasets: [{
          label: 'Profile Views',
          data: this.profileViews.data || this.generateRandomData(7, 50),
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    });
    
    this.charts.push(chart);
  }

  /**
   * Create match success chart
   */
  private createMatchSuccessChart(): void {
    if (!this.matchSuccessChart?.nativeElement) return;

    const ctx = this.matchSuccessChart.nativeElement.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Mutual Matches', 'One-sided Likes', 'No Response'],
        datasets: [{
          data: [
            this.matchAnalytics.mutualMatches || 25,
            this.matchAnalytics.oneSidedLikes || 45,
            this.matchAnalytics.noResponse || 30
          ],
          backgroundColor: [
            '#10b981', // Green for mutual matches
            '#f59e0b', // Yellow for one-sided
            '#ef4444'  // Red for no response
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          }
        }
      }
    });
    
    this.charts.push(chart);
  }

  /**
   * Create compatibility chart
   */
  private createCompatibilityChart(): void {
    if (!this.compatibilityChart?.nativeElement) return;

    const ctx = this.compatibilityChart.nativeElement.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
        datasets: [{
          label: 'Number of Matches',
          data: this.compatibilityReports.distribution || [5, 12, 25, 35, 23],
          backgroundColor: [
            '#ef4444', // Red for low compatibility
            '#f59e0b', // Orange
            '#eab308', // Yellow
            '#22c55e', // Light green
            '#059669'  // Dark green for high compatibility
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
    
    this.charts.push(chart);
  }

  /**
   * Create profile optimization chart
   */
  private createOptimizationChart(): void {
    if (!this.optimizationChart?.nativeElement) return;

    const ctx = this.optimizationChart.nativeElement.getContext('2d');
    const completionScore = this.profileOptimization.completionScore || 75;
    
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [completionScore, 100 - completionScore],
          backgroundColor: [
            completionScore >= 80 ? '#10b981' : completionScore >= 60 ? '#f59e0b' : '#ef4444',
            '#f3f4f6'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            display: false
          }
        }
      },
      plugins: [{
        id: 'centerText',
        beforeDraw: (chart) => {
          const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;
          ctx.save();
          
          const fontSize = (height / 8).toFixed(0);
          ctx.font = `bold ${fontSize}px Inter`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#1f2937';
          
          const centerX = left + width / 2;
          const centerY = top + height / 2;
          
          ctx.fillText(`${completionScore}%`, centerX, centerY);
          ctx.restore();
        }
      }]
    });
    
    this.charts.push(chart);
  }

  /**
   * Create weekly trend chart
   */
  private createWeeklyTrendChart(): void {
    if (!this.weeklyTrendChart?.nativeElement) return;

    const ctx = this.weeklyTrendChart.nativeElement.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Views',
            data: this.generateRandomData(7, 30),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          },
          {
            label: 'Likes',
            data: this.generateRandomData(7, 15),
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    });
    
    this.charts.push(chart);
  }

  /**
   * Create user engagement chart
   */
  private createUserEngagementChart(): void {
    if (!this.userEngagementChart?.nativeElement) return;

    const ctx = this.userEngagementChart.nativeElement.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Profile Views', 'Photo Quality', 'Bio Completeness', 'Response Rate', 'Activity Level', 'Match Success'],
        datasets: [{
          label: 'Your Performance',
          data: [
            this.profileOptimization.scores?.profileViews || 75,
            this.profileOptimization.scores?.photoQuality || 85,
            this.profileOptimization.scores?.bioCompleteness || 90,
            this.profileOptimization.scores?.responseRate || 70,
            this.profileOptimization.scores?.activityLevel || 80,
            this.profileOptimization.scores?.matchSuccess || 65
          ],
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.2)',
          pointBackgroundColor: '#ec4899',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            pointLabels: {
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
    
    this.charts.push(chart);
  }

  /**
   * Update charts when metric changes
   */
  private updateChartsWithNewMetric(): void {
    // This would update charts based on selected metric
    // For now, just reload data
    this.loadAnalyticsData();
  }

  /**
   * Destroy all charts
   */
  private destroyCharts(): void {
    this.charts.forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    this.charts = [];
  }

  /**
   * Generate mock data for testing
   */
  private generateMockData(): void {
    this.profileViews = this.generateMockProfileViews();
    this.matchAnalytics = this.generateMockMatchAnalytics();
    this.compatibilityReports = this.generateMockCompatibility();
    this.profileOptimization = this.generateMockOptimization();
  }

  private generateMockProfileViews(): any {
    return {
      total: 247,
      change: 15,
      data: this.generateRandomData(7, 50),
      labels: this.generateDateLabels(),
      dailyAverage: 35,
      peakDay: 'Saturday',
      monthlyTotal: 1450
    };
  }

  private generateMockMatchAnalytics(): any {
    return {
      total: 89,
      change: 8,
      mutualMatches: 25,
      oneSidedLikes: 45,
      noResponse: 30,
      successRate: 28
    };
  }

  private generateMockCompatibility(): any {
    return {
      avgScore: 72,
      distribution: [5, 12, 25, 35, 23],
      topCompatibility: 95,
      lowestCompatibility: 15
    };
  }

  private generateMockOptimization(): any {
    return {
      completionScore: 85,
      suggestions: [
        { type: 'photo', priority: 'high', title: 'Add more photos', description: 'Users with 5+ photos get 3x more views' },
        { type: 'bio', priority: 'medium', title: 'Expand your bio', description: 'Share more about your interests and goals' }
      ],
      scores: {
        profileViews: 75,
        photoQuality: 85,
        bioCompleteness: 90,
        responseRate: 70,
        activityLevel: 80,
        matchSuccess: 65
      }
    };
  }

  private generateRandomData(count: number, max: number): number[] {
    return Array.from({ length: count }, () => Math.floor(Math.random() * max));
  }

  private generateDateLabels(): string[] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days;
  }

  /**
   * Export analytics data
   */
  exportData(format: 'csv' | 'pdf'): void {
    if (format === 'csv') {
      this.exportAsCSV();
    } else {
      this.exportAsPDF();
    }
  }

  private exportAsCSV(): void {
    const data = [
      ['Metric', 'Value'],
      ['Total Profile Views', this.profileViews.total || 0],
      ['Total Matches', this.matchAnalytics.total || 0],
      ['Average Compatibility', this.compatibilityReports.avgScore || 0],
      ['Profile Completion', this.profileOptimization.completionScore || 0]
    ];
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soulsync-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private exportAsPDF(): void {
    // This would require a PDF library like jsPDF
    console.log('PDF export functionality would be implemented here');
  }

  /**
   * Get recommendations based on analytics
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.profileOptimization.completionScore < 80) {
      recommendations.push('Complete your profile to increase visibility');
    }
    
    if (this.matchAnalytics.successRate < 30) {
      recommendations.push('Improve your conversation starters to increase match success');
    }
    
    if (this.profileViews.change < 0) {
      recommendations.push('Update your photos regularly to maintain engagement');
    }
    
    return recommendations;
  }
}