import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

import { InsightsComponent } from './insights.component';
import { InsightsService } from '../core/services/insights.service';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';

describe('InsightsComponent', () => {
  let component: InsightsComponent;
  let fixture: ComponentFixture<InsightsComponent>;
  let insightsService: jasmine.SpyObj<InsightsService>;

  const mockProfileViews = {
    total: 150,
    change: 25,
    dailyAverage: 5,
    peakDay: 'Monday',
    monthlyTotal: 600,
    data: []
  };

  const mockMatchAnalytics = {
    total: 45,
    change: 15,
    successRate: 78,
    mutualLikes: 12,
    conversations: 8,
    data: []
  };

  const mockCompatibilityReports = {
    avgScore: 85,
    topFactors: [
      { name: 'Interests', score: 90 },
      { name: 'Values', score: 85 },
      { name: 'Lifestyle', score: 80 }
    ],
    tip: 'Consider updating your interests for better matches',
    data: []
  };

  const mockProfileOptimization = {
    completionScore: 92,
    recommendations: [
      { title: 'Add more photos', description: 'Upload 3-5 high quality photos', completed: true },
      { title: 'Complete bio', description: 'Write a compelling bio', completed: false }
    ],
    data: []
  };

  beforeEach(async () => {
    const insightsServiceSpy = jasmine.createSpyObj('InsightsService', [
      'getProfileViews',
      'getMatchAnalytics', 
      'getCompatibilityReports',
      'getProfileOptimization'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        InsightsComponent,
        LoadingSpinnerComponent
      ],
      providers: [
        { provide: InsightsService, useValue: insightsServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InsightsComponent);
    component = fixture.componentInstance;
    insightsService = TestBed.inject(InsightsService) as jasmine.SpyObj<InsightsService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.loading).toBe(true);
    expect(component.profileViews).toBeUndefined();
    expect(component.matchAnalytics).toBeUndefined();
    expect(component.compatibilityReports).toBeUndefined();
    expect(component.profileOptimization).toBeUndefined();
  });

  describe('ngOnInit', () => {
    it('should load all insights data successfully', async () => {
      insightsService.getProfileViews.and.returnValue(of(mockProfileViews));
      insightsService.getMatchAnalytics.and.returnValue(of(mockMatchAnalytics));
      insightsService.getCompatibilityReports.and.returnValue(of(mockCompatibilityReports));
      insightsService.getProfileOptimization.and.returnValue(of(mockProfileOptimization));

      component.ngOnInit();
      
      // Wait for promises to resolve
      await fixture.whenStable();

      expect(component.profileViews).toEqual(mockProfileViews);
      expect(component.matchAnalytics).toEqual(mockMatchAnalytics);
      expect(component.compatibilityReports).toEqual(mockCompatibilityReports);
      expect(component.profileOptimization).toEqual(mockProfileOptimization);
      expect(component.loading).toBe(false);
    });

    it('should handle service errors gracefully', async () => {
      insightsService.getProfileViews.and.returnValue(throwError('Service error'));
      insightsService.getMatchAnalytics.and.returnValue(throwError('Service error'));
      insightsService.getCompatibilityReports.and.returnValue(throwError('Service error'));
      insightsService.getProfileOptimization.and.returnValue(throwError('Service error'));

      component.ngOnInit();
      
      // Wait for promises to resolve
      await fixture.whenStable();

      expect(component.loading).toBe(false);
    });

    it('should call all insight services', () => {
      insightsService.getProfileViews.and.returnValue(of(mockProfileViews));
      insightsService.getMatchAnalytics.and.returnValue(of(mockMatchAnalytics));
      insightsService.getCompatibilityReports.and.returnValue(of(mockCompatibilityReports));
      insightsService.getProfileOptimization.and.returnValue(of(mockProfileOptimization));

      component.ngOnInit();

      expect(insightsService.getProfileViews).toHaveBeenCalled();
      expect(insightsService.getMatchAnalytics).toHaveBeenCalled();
      expect(insightsService.getCompatibilityReports).toHaveBeenCalled();
      expect(insightsService.getProfileOptimization).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      insightsService.getProfileViews.and.returnValue(of(mockProfileViews));
      insightsService.getMatchAnalytics.and.returnValue(of(mockMatchAnalytics));
      insightsService.getCompatibilityReports.and.returnValue(of(mockCompatibilityReports));
      insightsService.getProfileOptimization.and.returnValue(of(mockProfileOptimization));
    });

    it('should display loading spinner when loading', () => {
      component.loading = true;
      fixture.detectChanges();

      const spinner = fixture.debugElement.nativeElement.querySelector('app-loading-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should display insights content when not loading', async () => {
      component.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();

      const insightCards = fixture.debugElement.nativeElement.querySelectorAll('.insight-card');
      expect(insightCards.length).toBeGreaterThan(0);
    });

    it('should display profile views data', async () => {
      component.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.debugElement.nativeElement.textContent;
      expect(content).toContain('150'); // total views
      expect(content).toContain('25%'); // change percentage
    });

    it('should display match analytics data', async () => {
      component.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.debugElement.nativeElement.textContent;
      expect(content).toContain('45'); // total matches
      expect(content).toContain('78%'); // success rate
    });

    it('should display compatibility factors', async () => {
      component.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.debugElement.nativeElement.textContent;
      expect(content).toContain('Interests');
      expect(content).toContain('Values');
      expect(content).toContain('Lifestyle');
    });

    it('should display profile optimization recommendations', async () => {
      component.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.debugElement.nativeElement.textContent;
      expect(content).toContain('Add more photos');
      expect(content).toContain('Complete bio');
    });

    it('should show no data message when data is empty', () => {
      component.loading = false;
      component.profileViews = null;
      fixture.detectChanges();

      const noDataMessage = fixture.debugElement.nativeElement.querySelector('[data-testid="no-data"]');
      // Since we're using ng-template, check for the text content
      const content = fixture.debugElement.nativeElement.textContent;
      expect(content).toContain('No data available yet');
    });
  });

  describe('Data Display Logic', () => {
    it('should handle null values gracefully', async () => {
      insightsService.getProfileViews.and.returnValue(of(null));
      insightsService.getMatchAnalytics.and.returnValue(of(null));
      insightsService.getCompatibilityReports.and.returnValue(of(null));
      insightsService.getProfileOptimization.and.returnValue(of(null));

      component.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();

      // Should not throw errors and display fallback values
      expect(fixture.debugElement.nativeElement.textContent).toContain('0');
    });

    it('should show positive change indicators', async () => {
      component.profileViews = { ...mockProfileViews, change: 15 };
      component.loading = false;
      fixture.detectChanges();

      const positiveChange = fixture.debugElement.nativeElement.querySelector('.positive');
      expect(positiveChange).toBeTruthy();
    });

    it('should show completion status for profile optimization', async () => {
      component.profileOptimization = mockProfileOptimization;
      component.loading = false;
      fixture.detectChanges();

      const content = fixture.debugElement.nativeElement.textContent;
      expect(content).toContain('Complete');
      expect(content).toContain('Pending');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      insightsService.getProfileViews.and.returnValue(of(mockProfileViews));
      insightsService.getMatchAnalytics.and.returnValue(of(mockMatchAnalytics));
      insightsService.getCompatibilityReports.and.returnValue(of(mockCompatibilityReports));
      insightsService.getProfileOptimization.and.returnValue(of(mockProfileOptimization));
      
      component.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('should have proper heading structure', () => {
      const h1 = fixture.debugElement.nativeElement.querySelector('h1');
      const h2s = fixture.debugElement.nativeElement.querySelectorAll('h2');
      
      expect(h1).toBeTruthy();
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have descriptive text for visual elements', () => {
      const content = fixture.debugElement.nativeElement.textContent;
      expect(content).toContain('Profile views chart would be rendered here');
      expect(content).toContain('Match success rate chart would be rendered here');
    });
  });
});
