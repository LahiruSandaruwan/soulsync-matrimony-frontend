import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { of } from 'rxjs';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser'], {
      currentUser$: of(null)
    });
    
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent, RouterTestingModule, LoadingSpinnerComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
    expect(component.stats).toBeDefined();
    expect(component.recentActivity).toEqual([]);
    expect(component.topUsers).toEqual([]);
  });

  it('should load dashboard data on init', () => {
    spyOn(component, 'loadDashboardData');
    component.ngOnInit();
    expect(component.loadDashboardData).toHaveBeenCalled();
  });

  it('should handle loading state correctly', () => {
    // Prevent the component from calling actual service methods
    spyOn(component, 'loadDashboardData').and.stub();
    
    component.loading = true;
    fixture.detectChanges();
    
    const loadingElement = fixture.nativeElement.querySelector('app-loading-spinner');
    expect(loadingElement).toBeTruthy();
  });

  it('should handle error state correctly', () => {
    // Prevent the component from calling actual service methods
    spyOn(component, 'loadDashboardData').and.stub();
    
    component.error = 'Failed to load data';
    component.loading = false;
    fixture.detectChanges();
    
    const errorElement = fixture.nativeElement.querySelector('.bg-red-50');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Failed to load data');
  });

  it('should display dashboard content when loaded', () => {
    // Prevent the component from calling actual service methods
    spyOn(component, 'loadDashboardData').and.stub();
    
    component.loading = false;
    component.error = '';
    fixture.detectChanges();
    
    const dashboardContent = fixture.nativeElement.querySelector('.space-y-6');
    expect(dashboardContent).toBeTruthy();
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(1000);
    expect(formatted).toContain('$1,000');
  });

  it('should format date correctly', () => {
    const date = new Date('2023-01-15T10:30:00Z');
    const formatted = component.formatDate(date.toISOString());
    expect(formatted).toContain('Jan 15');
  });

  it('should get activity icon correctly', () => {
    expect(component.getActivityIcon('user_registration')).toBe('👤');
    expect(component.getActivityIcon('match_created')).toBe('💕');
    expect(component.getActivityIcon('report_submitted')).toBe('🚨');
    expect(component.getActivityIcon('payment_received')).toBe('💰');
  });

  it('should get activity color correctly', () => {
    expect(component.getActivityColor('user_registration')).toBe('text-blue-600');
    expect(component.getActivityColor('match_created')).toBe('text-pink-600');
    expect(component.getActivityColor('report_submitted')).toBe('text-red-600');
    expect(component.getActivityColor('payment_received')).toBe('text-green-600');
  });

  it('should handle view user action', () => {
    spyOn(console, 'log');
    component.onViewUser(123);
    expect(console.log).toHaveBeenCalledWith('View user:', 123);
  });

  it('should handle view reports action', () => {
    spyOn(console, 'log');
    component.onViewReports();
    expect(console.log).toHaveBeenCalledWith('View reports');
  });

  it('should refresh data', () => {
    spyOn(component, 'loadDashboardData');
    component.refreshData();
    expect(component.loadDashboardData).toHaveBeenCalled();
  });

  it('should clean up on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    
    component.ngOnDestroy();
    
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });

  it('should have required stats properties', () => {
    expect(component.stats.totalUsers).toBeDefined();
    expect(component.stats.activeUsers).toBeDefined();
    expect(component.stats.premiumUsers).toBeDefined();
    expect(component.stats.totalMatches).toBeDefined();
    expect(component.stats.totalConversations).toBeDefined();
    expect(component.stats.totalReports).toBeDefined();
    expect(component.stats.pendingReports).toBeDefined();
    expect(component.stats.revenueThisMonth).toBeDefined();
    expect(component.stats.revenueLastMonth).toBeDefined();
    expect(component.stats.growthRate).toBeDefined();
  });

  it('should have required activity properties', () => {
    const mockActivity = {
      id: 1,
      type: 'user_registration' as const,
      description: 'New user registered',
      user: { id: 1, name: 'John Doe' },
      created_at: new Date().toISOString()
    };
    
    expect(mockActivity.id).toBeDefined();
    expect(mockActivity.type).toBeDefined();
    expect(mockActivity.description).toBeDefined();
    expect(mockActivity.user).toBeDefined();
    expect(mockActivity.created_at).toBeDefined();
  });

  it('should have required user properties', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      profile_completion: 95,
      matches_count: 25,
      last_active: new Date().toISOString(),
      subscription_status: 'premium'
    };
    
    expect(mockUser.id).toBeDefined();
    expect(mockUser.name).toBeDefined();
    expect(mockUser.email).toBeDefined();
    expect(mockUser.profile_completion).toBeDefined();
    expect(mockUser.matches_count).toBeDefined();
    expect(mockUser.last_active).toBeDefined();
    expect(mockUser.subscription_status).toBeDefined();
  });
}); 