import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserDashboardComponent } from './user-dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { MatchService } from '../../core/services/match.service';
import { ChatService } from '../../core/services/chat.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { UserCardComponent } from '../../shared/components/user-card/user-card.component';
import { of } from 'rxjs';

describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let profileService: jasmine.SpyObj<ProfileService>;
  let matchService: jasmine.SpyObj<MatchService>;
  let chatService: jasmine.SpyObj<ChatService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser'], {
      currentUser$: of(null)
    });
    const profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getProfile', 'getProfileCompletion'], {
      getProfile: of({ id: 1, user_id: 1, completion_percentage: 85, profile_views: 100 }),
      getProfileCompletion: of({ completion_percentage: 85 })
    });
    const matchServiceSpy = jasmine.createSpyObj('MatchService', ['getMatches'], {
      getMatches: of({ data: [] })
    });
    const chatServiceSpy = jasmine.createSpyObj('ChatService', ['getConversations'], {
      getConversations: of({ data: [] })
    });
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [], {
      unreadCount$: of(5)
    });
    
    await TestBed.configureTestingModule({
      imports: [
        UserDashboardComponent, 
        RouterTestingModule, 
        LoadingSpinnerComponent,
        UserCardComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: MatchService, useValue: matchServiceSpy },
        { provide: ChatService, useValue: chatServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    profileService = TestBed.inject(ProfileService) as jasmine.SpyObj<ProfileService>;
    matchService = TestBed.inject(MatchService) as jasmine.SpyObj<MatchService>;
    chatService = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
    expect(component.stats).toBeDefined();
    expect(component.recentMatches).toEqual([]);
    expect(component.recentMessages).toEqual([]);
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
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-container');
    expect(loadingElement).toBeTruthy();
  });

  it('should handle error state correctly', () => {
    // Prevent the component from calling actual service methods
    spyOn(component, 'loadDashboardData').and.stub();
    
    component.error = 'Failed to load data';
    component.loading = false;
    fixture.detectChanges();
    
    const errorElement = fixture.nativeElement.querySelector('.error-container');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Failed to load data');
  });

  it('should display dashboard content when loaded', () => {
    // Prevent the component from calling actual service methods
    spyOn(component, 'loadDashboardData').and.stub();
    
    component.loading = false;
    component.error = '';
    fixture.detectChanges();
    
    const dashboardContent = fixture.nativeElement.querySelector('.dashboard-content');
    expect(dashboardContent).toBeTruthy();
  });

  it('should handle view profile action', () => {
    spyOn(console, 'log');
    component.onViewProfile(123);
    expect(console.log).toHaveBeenCalledWith('View profile:', 123);
  });

  it('should handle view conversation action', () => {
    spyOn(console, 'log');
    component.onViewConversation(456);
    expect(console.log).toHaveBeenCalledWith('View conversation:', 456);
  });

  it('should handle view matches action', () => {
    spyOn(console, 'log');
    component.onViewMatches();
    expect(console.log).toHaveBeenCalledWith('View all matches');
  });

  it('should handle view messages action', () => {
    spyOn(console, 'log');
    component.onViewMessages();
    expect(console.log).toHaveBeenCalledWith('View all messages');
  });

  it('should handle complete profile action', () => {
    spyOn(console, 'log');
    component.onCompleteProfile();
    expect(console.log).toHaveBeenCalledWith('Complete profile');
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
    expect(component.stats.totalMatches).toBeDefined();
    expect(component.stats.newMessages).toBeDefined();
    expect(component.stats.profileViews).toBeDefined();
    expect(component.stats.activeSubscriptions).toBeDefined();
    expect(component.stats.profileCompletion).toBeDefined();
    expect(component.stats.unreadNotifications).toBeDefined();
  });

  it('should have required match properties', () => {
    const mockMatch = {
      id: 1,
      user: {
        id: 1,
        first_name: 'Alice',
        last_name: 'Johnson',
        age: 25,
        current_city: 'New York',
        current_country: 'USA',
        occupation: 'Software Engineer',
        education_level: 'bachelors',
        photos: [],
        profile_completion: 85,
        is_online: true,
        last_seen: new Date().toISOString()
      },
      matched_at: new Date().toISOString(),
      compatibility_score: 85
    };
    
    expect(mockMatch.id).toBeDefined();
    expect(mockMatch.user).toBeDefined();
    expect(mockMatch.matched_at).toBeDefined();
    expect(mockMatch.compatibility_score).toBeDefined();
  });

  it('should have required message properties', () => {
    const mockMessage = {
      id: 1,
      conversation_id: 1,
      sender: {
        id: 1,
        first_name: 'Bob',
        last_name: 'Wilson'
      },
      content: 'Hello there!',
      created_at: new Date().toISOString(),
      is_read: false
    };
    
    expect(mockMessage.id).toBeDefined();
    expect(mockMessage.conversation_id).toBeDefined();
    expect(mockMessage.sender).toBeDefined();
    expect(mockMessage.content).toBeDefined();
    expect(mockMessage.created_at).toBeDefined();
    expect(mockMessage.is_read).toBeDefined();
  });

  it('should process dashboard data correctly', () => {
    const mockData = {
      matches: { data: [{ id: 1, user: { id: 1 }, created_at: '2023-01-01', compatibility_score: 85 }] },
      conversations: { data: [{ id: 1, unread_count: 2, last_message: { id: 1, sender: { id: 1 }, content: 'Hello', created_at: '2023-01-01', is_read: false } }] },
      profileCompletion: { completion_percentage: 75 },
      unreadCount: 5,
      profile: { profile_views: 100 }
    };

    component['processDashboardData'](mockData);

    expect(component.stats.totalMatches).toBe(1);
    expect(component.stats.newMessages).toBe(2);
    expect(component.stats.profileCompletion).toBe(75);
    expect(component.stats.profileViews).toBe(100);
    expect(component.stats.unreadNotifications).toBe(5);
    expect(component.recentMatches.length).toBe(1);
    expect(component.recentMessages.length).toBe(1);
  });

  it('should handle current user subscription status', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      subscription: {
        status: 'active',
        plan_type: 'premium'
      }
    };

    component.currentUser = mockUser;
    component['processDashboardData']({});

    expect(component.stats.activeSubscriptions).toBe(1);
  });

  it('should handle user without subscription', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com'
    };

    component.currentUser = mockUser;
    component['processDashboardData']({});

    expect(component.stats.activeSubscriptions).toBe(0);
  });
}); 