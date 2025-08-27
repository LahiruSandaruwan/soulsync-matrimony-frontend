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
    { value: 'messages', label: 'Messages' },
    { value: 'compatibility', label: 'Compatibility Score' },
    { value: 'response_rate', label: 'Response Rate' },
    { value: 'engagement', label: 'Engagement Level' }
  ];

  // Export options
  exportFormats = [
    { value: 'csv', label: 'CSV Export', icon: '📊' },
    { value: 'pdf', label: 'PDF Report', icon: '📄' },
    { value: 'excel', label: 'Excel Export', icon: '📈' }
  ];

  // Predictive analytics data
  predictiveInsights: any = {
    nextWeekPrediction: 0,
    recommendedActions: [],
    trendAnalysis: '',
    successProbability: 0
  };

  // Advanced filtering options
  filterOptions = {
    ageRange: { min: 18, max: 65 },
    location: '',
    interests: [],
    activityLevel: 'all'
  };

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
   * Load all analytics data with enhanced features
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
        this.predictiveInsights = this.generateMockPredictiveInsights();
        
        this.loading = false;
        
        // Initialize charts after data is loaded
        setTimeout(() => {
          this.initializeAllCharts();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.generateMockData();
        this.loading = false;
        
        setTimeout(() => {
          this.initializeAllCharts();
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
   * Initialize all charts with enhanced features
   */
  private initializeAllCharts(): void {
    this.createProfileViewsChart();
    this.createMatchSuccessChart();
    this.createCompatibilityChart();
    this.createOptimizationChart();
    this.createWeeklyTrendChart();
    this.createUserEngagementChart();
    this.createPredictiveAnalyticsChart();
    this.createHeatmapChart();
    this.createTrendAnalysisChart();
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
    this.predictiveInsights = this.generateMockPredictiveInsights();
  }

  /**
   * Generate mock predictive insights
   */
  private generateMockPredictiveInsights(): any {
    return {
      nextWeekPrediction: Math.floor(Math.random() * 20) + 10,
      recommendedActions: [
        'Update your profile photo',
        'Add more interests to your profile',
        'Be more active in conversations',
        'Complete your profile to 100%'
      ],
      trendAnalysis: 'Your profile views are trending upward. Based on current patterns, you can expect 15-20% more views next week.',
      successProbability: Math.floor(Math.random() * 30) + 70
    };
  }

  /**
   * Export data in various formats
   */
  exportData(format: string): void {
    switch (format) {
      case 'csv':
        this.exportToCSV();
        break;
      case 'pdf':
        this.exportToPDF();
        break;
      case 'excel':
        this.exportToExcel();
        break;
      default:
        console.warn('Unsupported export format:', format);
    }
  }

  /**
   * Export to CSV
   */
  private exportToCSV(): void {
    const csvContent = this.generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soulsync_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate CSV content
   */
  private generateCSVContent(): string {
    const headers = ['Date', 'Profile Views', 'Matches', 'Likes', 'Messages', 'Compatibility Score'];
    const rows = this.profileViews.labels.map((label: string, index: number) => [
      label,
      this.profileViews.data[index] || 0,
      this.matchAnalytics.data[index] || 0,
      this.compatibilityReports.data[index] || 0,
      this.profileOptimization.data[index] || 0,
      Math.floor(Math.random() * 30) + 70
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Export to PDF
   */
  private exportToPDF(): void {
    // This would integrate with a PDF generation library
    console.log('PDF export functionality would be implemented here');
    alert('PDF export feature coming soon!');
  }

  /**
   * Export to Excel
   */
  private exportToExcel(): void {
    // This would integrate with an Excel generation library
    console.log('Excel export functionality would be implemented here');
    alert('Excel export feature coming soon!');
  }

  /**
   * Apply advanced filters
   */
  applyFilters(): void {
    this.loading = true;
    // Simulate filter application
    setTimeout(() => {
      this.loadAnalyticsData();
    }, 1000);
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.filterOptions = {
      ageRange: { min: 18, max: 65 },
      location: '',
      interests: [],
      activityLevel: 'all'
    };
    this.applyFilters();
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
   * Create predictive analytics chart
   */
  private createPredictiveAnalyticsChart(): void {
    // This would create a chart showing predicted vs actual values
    console.log('Creating predictive analytics chart');
  }

  /**
   * Create heatmap chart
   */
  private createHeatmapChart(): void {
    // This would create a heatmap showing activity patterns
    console.log('Creating heatmap chart');
  }

  /**
   * Create trend analysis chart
   */
  private createTrendAnalysisChart(): void {
    // This would create a chart showing trend analysis
    console.log('Creating trend analysis chart');
  }



  /**
   * Get recommendations based on analytics data
   */
  getRecommendations(): any[] {
    const recommendations = [];
    
    if (this.profileViews?.total < 100) {
      recommendations.push({
        type: 'profile',
        priority: 'high',
        title: 'Increase Profile Visibility',
        description: 'Your profile views are low. Consider updating your photos and bio to attract more attention.',
        action: 'Update Profile'
      });
    }
    
    if (this.matchAnalytics?.successRate < 30) {
      recommendations.push({
        type: 'matching',
        priority: 'medium',
        title: 'Improve Response Rate',
        description: 'Your response rate is below average. Try to respond to messages within 24 hours.',
        action: 'View Messages'
      });
    }
    
    if (this.profileOptimization?.completionScore < 80) {
      recommendations.push({
        type: 'completion',
        priority: 'high',
        title: 'Complete Your Profile',
        description: 'Complete profiles get 3x more views. Add missing information to improve your chances.',
        action: 'Complete Profile'
      });
    }
    
    return recommendations;
  }
}