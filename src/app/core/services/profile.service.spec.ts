import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { environment } from '../../../environments/environment';

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
    it('should send GET request to profile endpoint', () => {
      const mockResponse = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        profile_completion: 85
      };

      service.getProfile().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateProfile', () => {
    it('should send PUT request to update profile endpoint', () => {
      const profileData = {
        first_name: 'John',
        last_name: 'Doe',
        about_me: 'Test description'
      };
      const mockResponse = { message: 'Profile updated successfully' };

      service.updateProfile(profileData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(profileData);
      req.flush(mockResponse);
    });
  });

  describe('uploadPhoto', () => {
    it('should send POST request to upload photo endpoint', () => {
      const formData = new FormData();
      formData.append('file', new File([''], 'test.jpg'));
      const mockResponse = { message: 'Photo uploaded successfully' };

      service.uploadPhoto(formData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/photos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(formData);
      req.flush(mockResponse);
    });
  });

  describe('getPhotos', () => {
    it('should send GET request to get photos endpoint', () => {
      const mockResponse = [
        { id: 1, url: 'photo1.jpg', is_public: true },
        { id: 2, url: 'photo2.jpg', is_public: false }
      ];

      service.getPhotos().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/photos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updatePhotoPrivacy', () => {
    it('should send PUT request to update photo privacy endpoint', () => {
      const photoId = 1;
      const isPublic = true;
      const mockResponse = { message: 'Photo privacy updated successfully' };

      service.updatePhotoPrivacy(photoId, isPublic).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/photos/${photoId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ is_public: isPublic });
      req.flush(mockResponse);
    });
  });

  describe('deletePhoto', () => {
    it('should send DELETE request to delete photo endpoint', () => {
      const photoId = 1;
      const mockResponse = { message: 'Photo deleted successfully' };

      service.deletePhoto(photoId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/photos/${photoId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getSettings', () => {
    it('should send GET request to get settings endpoint', () => {
      const mockResponse = {
        notification_settings: {
          email_notifications: true,
          push_notifications: true
        },
        privacy_settings: {
          profile_visibility: 'public',
          show_online_status: true
        }
      };

      service.getSettings().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/settings`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateNotificationSettings', () => {
    it('should send PUT request to update notification settings endpoint', () => {
      const settings = {
        email_notifications: true,
        push_notifications: false,
        sms_notifications: true
      };
      const mockResponse = { message: 'Notification settings updated successfully' };

      service.updateNotificationSettings(settings).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/notification-settings`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(settings);
      req.flush(mockResponse);
    });
  });

  describe('updatePrivacySettings', () => {
    it('should send PUT request to update privacy settings endpoint', () => {
      const settings = {
        profile_visibility: 'public',
        show_online_status: true,
        allow_messages_from: 'matches'
      };
      const mockResponse = { message: 'Privacy settings updated successfully' };

      service.updatePrivacySettings(settings).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/privacy-settings`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(settings);
      req.flush(mockResponse);
    });
  });

  describe('exportData', () => {
    it('should send GET request to export data endpoint', () => {
      const mockResponse = { download_url: 'https://example.com/export.zip' };

      service.exportData().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/export-data`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getMatches', () => {
    it('should send GET request to get matches endpoint', () => {
      const mockResponse = [
        { id: 1, name: 'Alice', compatibility: 85 },
        { id: 2, name: 'Bob', compatibility: 78 }
      ];

      service.getMatches().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/matches`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getProfileViews', () => {
    it('should send GET request to get profile views endpoint', () => {
      const mockResponse = [
        { id: 1, viewer: 'Alice', viewed_at: '2023-01-15T10:30:00Z' },
        { id: 2, viewer: 'Bob', viewed_at: '2023-01-14T15:45:00Z' }
      ];

      service.getProfileViews().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/views`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('handleError', () => {
    it('should handle HTTP errors', () => {
      const errorResponse = { status: 404, message: 'Profile not found' };
      
      service.getProfile().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile`);
      req.flush(errorResponse, { status: 404, statusText: 'Not Found' });
    });
  });
}); 