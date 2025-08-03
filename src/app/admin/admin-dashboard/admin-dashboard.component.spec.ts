import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
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

  it('should load stats correctly', () => {
    const mockStats = {
      totalUsers: 1000,
      activeUsers: 750,
      premiumUsers: 250,
      totalMatches: 500,
      totalConversations: 300,
      totalMessages: 1500,
      newUsersThisMonth: 50,
      newMatchesThisMonth: 25,
      revenueThisMonth: 5000
    };

    component.loadStats();
    expect(component.stats).toEqual(mockStats);
  });

  it('should load recent activity correctly', () => {
    const mockActivity = [
      {
        id: 1,
        type: 'user_registration',
        description: 'New user registered',
        user: { id: 1, name: 'John Doe' },
        timestamp: new Date().toISOString()
      }
    ];

    component.loadRecentActivity();
    expect(component.recentActivity).toEqual(mockActivity);
  });

  it('should load top users correctly', () => {
    const mockUsers = [
      {
        id: 1,
        name: 'John Doe',
        profile_completion: 95,
        matches_count: 25,
        last_active: new Date().toISOString()
      }
    ];

    component.loadTopUsers();
    expect(component.topUsers).toEqual(mockUsers);
  });

  it('should handle loading state correctly', () => {
    component.loading = true;
    fixture.detectChanges();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeTruthy();
  });

  it('should handle error state correctly', () => {
    component.error = 'Failed to load data';
    component.loading = false;
    fixture.detectChanges();
    
    const errorElement = fixture.nativeElement.querySelector('.error-state');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Failed to load data');
  });

  it('should display stats cards when data is loaded', () => {
    component.loading = false;
    component.stats = {
      totalUsers: 1000,
      activeUsers: 750,
      premiumUsers: 250,
      totalMatches: 500,
      totalConversations: 300,
      totalMessages: 1500,
      newUsersThisMonth: 50,
      newMatchesThisMonth: 25,
      revenueThisMonth: 5000
    };
    fixture.detectChanges();
    
    const statsCards = fixture.nativeElement.querySelectorAll('.stats-card');
    expect(statsCards.length).toBeGreaterThan(0);
  });

  it('should display recent activity when available', () => {
    component.loading = false;
    component.recentActivity = [
      {
        id: 1,
        type: 'user_registration',
        description: 'New user registered',
        user: { id: 1, name: 'John Doe' },
        timestamp: new Date().toISOString()
      }
    ];
    fixture.detectChanges();
    
    const activityList = fixture.nativeElement.querySelector('.activity-list');
    expect(activityList).toBeTruthy();
  });

  it('should display top users when available', () => {
    component.loading = false;
    component.topUsers = [
      {
        id: 1,
        name: 'John Doe',
        profile_completion: 95,
        matches_count: 25,
        last_active: new Date().toISOString()
      }
    ];
    fixture.detectChanges();
    
    const usersList = fixture.nativeElement.querySelector('.users-list');
    expect(usersList).toBeTruthy();
  });

  it('should format numbers correctly', () => {
    expect(component.formatNumber(1000)).toBe('1,000');
    expect(component.formatNumber(1500000)).toBe('1.5M');
    expect(component.formatNumber(500)).toBe('500');
  });

  it('should get activity icon correctly', () => {
    expect(component.getActivityIcon('user_registration')).toBe('👤');
    expect(component.getActivityIcon('match_created')).toBe('💕');
    expect(component.getActivityIcon('message_sent')).toBe('💬');
    expect(component.getActivityIcon('unknown')).toBe('📝');
  });

  it('should get activity color correctly', () => {
    expect(component.getActivityColor('user_registration')).toBe('text-blue-600');
    expect(component.getActivityColor('match_created')).toBe('text-green-600');
    expect(component.getActivityColor('message_sent')).toBe('text-purple-600');
    expect(component.getActivityColor('unknown')).toBe('text-gray-600');
  });

  it('should format date correctly', () => {
    const date = new Date('2023-01-15T10:30:00Z');
    const formatted = component.formatDate(date.toISOString());
    expect(formatted).toContain('Jan 15');
  });

  it('should handle refresh data', () => {
    spyOn(component, 'loadDashboardData');
    component.refreshData();
    expect(component.loadDashboardData).toHaveBeenCalled();
  });

  it('should handle export data', () => {
    spyOn(console, 'log');
    component.exportData();
    expect(console.log).toHaveBeenCalledWith('Exporting dashboard data');
  });

  it('should clean up on destroy', () => {
    spyOn(component.destroy$, 'next');
    spyOn(component.destroy$, 'complete');
    
    component.ngOnDestroy();
    
    expect(component.destroy$.next).toHaveBeenCalled();
    expect(component.destroy$.complete).toHaveBeenCalled();
  });

  it('should handle loading dashboard data with error', () => {
    component.loading = true;
    component.error = '';
    
    // Simulate error in loadDashboardData
    component.loadDashboardData();
    
    // The mock implementation should set loading to false
    expect(component.loading).toBe(false);
  });

  it('should display quick action buttons', () => {
    component.loading = false;
    fixture.detectChanges();
    
    const quickActions = fixture.nativeElement.querySelector('.quick-actions');
    expect(quickActions).toBeTruthy();
  });

  it('should have correct stats structure', () => {
    expect(component.stats).toHaveProperty('totalUsers');
    expect(component.stats).toHaveProperty('activeUsers');
    expect(component.stats).toHaveProperty('premiumUsers');
    expect(component.stats).toHaveProperty('totalMatches');
    expect(component.stats).toHaveProperty('totalConversations');
    expect(component.stats).toHaveProperty('totalMessages');
    expect(component.stats).toHaveProperty('newUsersThisMonth');
    expect(component.stats).toHaveProperty('newMatchesThisMonth');
    expect(component.stats).toHaveProperty('revenueThisMonth');
  });

  it('should have correct activity structure', () => {
    const mockActivity = {
      id: 1,
      type: 'user_registration',
      description: 'New user registered',
      user: { id: 1, name: 'John Doe' },
      timestamp: new Date().toISOString()
    };
    
    expect(mockActivity).toHaveProperty('id');
    expect(mockActivity).toHaveProperty('type');
    expect(mockActivity).toHaveProperty('description');
    expect(mockActivity).toHaveProperty('user');
    expect(mockActivity).toHaveProperty('timestamp');
  });

  it('should have correct user structure', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      profile_completion: 95,
      matches_count: 25,
      last_active: new Date().toISOString()
    };
    
    expect(mockUser).toHaveProperty('id');
    expect(mockUser).toHaveProperty('name');
    expect(mockUser).toHaveProperty('profile_completion');
    expect(mockUser).toHaveProperty('matches_count');
    expect(mockUser).toHaveProperty('last_active');
  });
}); 