import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService, ProfileCompletion, ProfileStats } from './profile.service';
import { UserProfile, UserPhoto } from '../models/user.model';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileService]
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const mockProfile: UserProfile = {
        id: 1,
        user_id: 1,
        height_cm: 170,
        weight_kg: 70,
        current_city: 'New York',
        education_level: 'bachelors',
        occupation: 'Software Engineer',
        religion: 'Christian',
        hobbies: ['reading', 'traveling'],
        about_me: 'I love to travel and read books.',
        completion_percentage: 85,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      service.getProfile().subscribe(response => {
        expect(response).toEqual(mockProfile);
      });

      const req = httpMock.expectOne('/api/v1/profile');
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockProfile, message: 'Profile retrieved successfully' });
    });

    it('should handle error', () => {
      service.getProfile().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Failed to load profile');
        }
      });

      const req = httpMock.expectOne('/api/v1/profile');
      req.flush({ success: false, message: 'Failed to load profile' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', () => {
      const updateData = {
        height_cm: 175,
        weight_kg: 75,
        current_city: 'Los Angeles'
      };

      const mockProfile: UserProfile = {
        id: 1,
        user_id: 1,
        height_cm: 175,
        weight_kg: 75,
        current_city: 'Los Angeles',
        completion_percentage: 90,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      service.updateProfile(updateData).subscribe(response => {
        expect(response).toEqual(mockProfile);
      });

      const req = httpMock.expectOne('/api/v1/profile');
      expect(req.request.method).toBe('PUT');
      req.flush({ success: true, data: mockProfile, message: 'Profile updated successfully' });
    });
  });

  describe('getPhotos', () => {
    it('should return user photos', () => {
      const mockPhotos: UserPhoto[] = [
        {
          id: 1,
          user_id: 1,
          file_path: '/photos/photo1.jpg',
          is_primary: true,
          is_private: false,
          status: 'approved',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ];

      service.getPhotos().subscribe(response => {
        expect(response).toEqual(mockPhotos);
      });

      const req = httpMock.expectOne('/api/v1/profile/photos');
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockPhotos, message: 'Photos retrieved successfully' });
    });
  });

  describe('uploadPhoto', () => {
    it('should upload photo', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockPhoto: UserPhoto = {
        id: 1,
        user_id: 1,
        file_path: '/photos/uploaded.jpg',
        is_primary: false,
        is_private: false,
        status: 'pending',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      service.uploadPhoto(mockFile).subscribe(response => {
        expect(response).toEqual(mockPhoto);
      });

      const req = httpMock.expectOne('/api/v1/profile/photos');
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, data: mockPhoto, message: 'Photo uploaded successfully' });
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo', () => {
      service.deletePhoto(1).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne('/api/v1/profile/photos/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true, message: 'Photo deleted successfully' });
    });
  });

  describe('getProfileCompletion', () => {
    it('should return profile completion', () => {
      const mockCompletion: ProfileCompletion = {
        completion_percentage: 85,
        missing_fields: ['occupation', 'religion'],
        completed_fields: ['height_cm', 'weight_kg', 'current_city']
      };

      service.getProfileCompletion().subscribe(response => {
        expect(response).toEqual(mockCompletion);
      });

      const req = httpMock.expectOne('/api/v1/profile/completion');
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockCompletion, message: 'Completion data retrieved' });
    });
  });

  describe('getProfileStats', () => {
    it('should return profile stats', () => {
      const mockStats: ProfileStats = {
        profile_views: 150,
        likes_received: 25,
        matches_count: 8,
        response_rate: 75
      };

      service.getProfileStats().subscribe(response => {
        expect(response).toEqual(mockStats);
      });

      const req = httpMock.expectOne('/api/v1/profile/stats');
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockStats, message: 'Stats retrieved successfully' });
    });
  });

  describe('getPreferences', () => {
    it('should return user preferences', () => {
      const mockPreferences = {
        age_min: 25,
        age_max: 35,
        max_distance_km: 50,
        religion: ['Christian', 'Catholic'],
        education_level: ['bachelors', 'masters']
      };

      service.getPreferences().subscribe(response => {
        expect(response).toEqual(mockPreferences);
      });

      const req = httpMock.expectOne('/api/v1/profile/preferences');
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockPreferences, message: 'Preferences retrieved' });
    });
  });

  describe('getSettings', () => {
    it('should return user settings', () => {
      const mockSettings = {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          profile_visible: true,
          show_photos: true,
          show_contact: false
        }
      };

      service.getSettings().subscribe(response => {
        expect(response).toEqual(mockSettings);
      });

      const req = httpMock.expectOne('/api/v1/profile/settings');
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockSettings, message: 'Settings retrieved' });
    });
  });

  describe('updateNotificationSettings', () => {
    it('should update notification settings', () => {
      const settingsData = {
        email: true,
        push: false,
        sms: true
      };

      service.updateNotificationSettings(settingsData).subscribe(response => {
        expect(response).toEqual(settingsData);
      });

      const req = httpMock.expectOne('/api/v1/profile/notification-settings');
      expect(req.request.method).toBe('PUT');
      req.flush({ success: true, data: settingsData, message: 'Settings updated' });
    });
  });

  describe('updatePrivacySettings', () => {
    it('should update privacy settings', () => {
      const privacyData = {
        profile_visible: true,
        show_photos: false,
        show_contact: true
      };

      service.updatePrivacySettings(privacyData).subscribe(response => {
        expect(response).toEqual(privacyData);
      });

      const req = httpMock.expectOne('/api/v1/profile/privacy-settings');
      expect(req.request.method).toBe('PUT');
      req.flush({ success: true, data: privacyData, message: 'Privacy settings updated' });
    });
  });

  describe('exportData', () => {
    it('should export user data', () => {
      const mockExportData = {
        profile: {},
        photos: [],
        matches: [],
        messages: []
      };

      service.exportData().subscribe(response => {
        expect(response).toEqual(mockExportData);
      });

      const req = httpMock.expectOne('/api/v1/profile/export-data');
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockExportData, message: 'Data exported' });
    });
  });
}); 