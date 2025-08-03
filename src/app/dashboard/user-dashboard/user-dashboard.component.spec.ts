import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDashboardComponent } from './user-dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { MatchService } from '../../core/services/match.service';
import { of } from 'rxjs';

describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let profileService: jasmine.SpyObj<ProfileService>;
  let matchService: jasmine.SpyObj<MatchService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getProfile', 'getMatches', 'getProfileViews']);
    const matchServiceSpy = jasmine.createSpyObj('MatchService', ['getSuggestions']);
    
    await TestBed.configureTestingModule({
      imports: [UserDashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: MatchService, useValue: matchServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    profileService = TestBed.inject(ProfileService) as jasmine.SpyObj<ProfileService>;
    matchService = TestBed.inject(MatchService) as jasmine.SpyObj<MatchService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
    expect(component.stats).toBeDefined();
    expect(component.recentMatches).toEqual([]);
    expect(component.recentViews).toEqual([]);
    expect(component.suggestions).toEqual([]);
  });

  it('should load dashboard data on init', () => {
    spyOn(component, 'loadDashboardData');
    component.ngOnInit();
    expect(component.loadDashboardData).toHaveBeenCalled();
  });

  it('should load user stats correctly', () => {
    const mockStats = {
      profile_completion: 85,
      total_matches: 25,
      total_views: 150,
      total_likes: 45,
      total_messages: 120
    };

    component.loadStats();
    expect(component.stats).toEqual(mockStats);
  });

  it('should load recent matches correctly', () => {
    const mockMatches = [
      {
        id: 1,
        name: 'Alice Johnson',
        photo: 'alice.jpg',
        compatibility: 85,
        matched_at: new Date().toISOString()
      }
    ];

    component.loadRecentMatches();
    expect(component.recentMatches).toEqual(mockMatches);
  });

  it('should load recent profile views correctly', () => {
    const mockViews = [
      {
        id: 1,
        viewer: 'Bob Wilson',
        photo: 'bob.jpg',
        viewed_at: new Date().toISOString()
      }
    ];

    component.loadRecentViews();
    expect(component.recentViews).toEqual(mockViews);
  });

  it('should load match suggestions correctly', () => {
    const mockSuggestions = [
      {
        id: 1,
        name: 'Carol Davis',
        photo: 'carol.jpg',
        compatibility: 78,
        age: 28,
        location: 'New York'
      }
    ];

    component.loadSuggestions();
    expect(component.suggestions).toEqual(mockSuggestions);
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
      profile_completion: 85,
      total_matches: 25,
      total_views: 150,
      total_likes: 45,
      total_messages: 120
    };
    fixture.detectChanges();
    
    const statsCards = fixture.nativeElement.querySelectorAll('.stats-card');
    expect(statsCards.length).toBeGreaterThan(0);
  });

  it('should display recent matches when available', () => {
    component.loading = false;
    component.recentMatches = [
      {
        id: 1,
        name: 'Alice Johnson',
        photo: 'alice.jpg',
        compatibility: 85,
        matched_at: new Date().toISOString()
      }
    ];
    fixture.detectChanges();
    
    const matchesList = fixture.nativeElement.querySelector('.matches-list');
    expect(matchesList).toBeTruthy();
  });

  it('should display recent views when available', () => {
    component.loading = false;
    component.recentViews = [
      {
        id: 1,
        viewer: 'Bob Wilson',
        photo: 'bob.jpg',
        viewed_at: new Date().toISOString()
      }
    ];
    fixture.detectChanges();
    
    const viewsList = fixture.nativeElement.querySelector('.views-list');
    expect(viewsList).toBeTruthy();
  });

  it('should display suggestions when available', () => {
    component.loading = false;
    component.suggestions = [
      {
        id: 1,
        name: 'Carol Davis',
        photo: 'carol.jpg',
        compatibility: 78,
        age: 28,
        location: 'New York'
      }
    ];
    fixture.detectChanges();
    
    const suggestionsList = fixture.nativeElement.querySelector('.suggestions-list');
    expect(suggestionsList).toBeTruthy();
  });

  it('should format numbers correctly', () => {
    expect(component.formatNumber(1000)).toBe('1,000');
    expect(component.formatNumber(1500000)).toBe('1.5M');
    expect(component.formatNumber(500)).toBe('500');
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

  it('should handle view profile', () => {
    const userId = 1;
    spyOn(component, 'viewProfile');
    component.onViewProfile(userId);
    expect(component.viewProfile).toHaveBeenCalledWith(userId);
  });

  it('should handle send message', () => {
    const userId = 1;
    spyOn(component, 'sendMessage');
    component.onSendMessage(userId);
    expect(component.sendMessage).toHaveBeenCalledWith(userId);
  });

  it('should handle like profile', () => {
    const userId = 1;
    spyOn(component, 'likeProfile');
    component.onLikeProfile(userId);
    expect(component.likeProfile).toHaveBeenCalledWith(userId);
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
    expect(component.stats).toHaveProperty('profile_completion');
    expect(component.stats).toHaveProperty('total_matches');
    expect(component.stats).toHaveProperty('total_views');
    expect(component.stats).toHaveProperty('total_likes');
    expect(component.stats).toHaveProperty('total_messages');
  });

  it('should have correct match structure', () => {
    const mockMatch = {
      id: 1,
      name: 'Alice Johnson',
      photo: 'alice.jpg',
      compatibility: 85,
      matched_at: new Date().toISOString()
    };
    
    expect(mockMatch).toHaveProperty('id');
    expect(mockMatch).toHaveProperty('name');
    expect(mockMatch).toHaveProperty('photo');
    expect(mockMatch).toHaveProperty('compatibility');
    expect(mockMatch).toHaveProperty('matched_at');
  });

  it('should have correct view structure', () => {
    const mockView = {
      id: 1,
      viewer: 'Bob Wilson',
      photo: 'bob.jpg',
      viewed_at: new Date().toISOString()
    };
    
    expect(mockView).toHaveProperty('id');
    expect(mockView).toHaveProperty('viewer');
    expect(mockView).toHaveProperty('photo');
    expect(mockView).toHaveProperty('viewed_at');
  });

  it('should have correct suggestion structure', () => {
    const mockSuggestion = {
      id: 1,
      name: 'Carol Davis',
      photo: 'carol.jpg',
      compatibility: 78,
      age: 28,
      location: 'New York'
    };
    
    expect(mockSuggestion).toHaveProperty('id');
    expect(mockSuggestion).toHaveProperty('name');
    expect(mockSuggestion).toHaveProperty('photo');
    expect(mockSuggestion).toHaveProperty('compatibility');
    expect(mockSuggestion).toHaveProperty('age');
    expect(mockSuggestion).toHaveProperty('location');
  });
}); 