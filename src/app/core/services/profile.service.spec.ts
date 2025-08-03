import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService, ProfileResponse, PhotosResponse, PreferenceResponse } from './profile.service';
import { environment } from '../../../environments/environment';
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
    it('should send GET request to profile endpoint', () => {
      const mockResponse: ProfileResponse = {
        success: true,
        data: {
          id: 1,
          user_id: 1,
          height_cm: 170,
          weight_kg: 65,
          body_type: 'average',
          complexion: 'fair',
          blood_group: 'A+',
          current_city: 'New York',
          current_state: 'NY',
          current_country: 'USA',
          education_level: 'bachelors',
          occupation: 'Software Engineer',
          company: 'Tech Corp',
          job_title: 'Senior Developer',
          annual_income_usd: 80000,
          religion: 'Christianity',
          caste: 'General',
          mother_tongue: 'English',
          languages_known: ['English', 'Spanish'],
          family_type: 'nuclear',
          family_status: 'middle_class',
          diet: 'vegetarian',
          smoking: 'never',
          drinking: 'never',
          hobbies: ['Reading', 'Traveling'],
          about_me: 'I am a passionate individual',
          looking_for: 'Someone who shares my values',
          marital_status: 'never_married',
          have_children: false,
          children_count: 0,
          willing_to_relocate: true,
          preferred_locations: ['New York', 'California'],
          completion_percentage: 85,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        message: 'Profile retrieved successfully'
      };

      service.getProfile().subscribe(response => {
        expect(response).toEqual(mockResponse.data);
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
      const mockResponse: ProfileResponse = {
        success: true,
        data: {
          id: 1,
          user_id: 1,
          about_me: 'Test description',
          completion_percentage: 85,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        message: 'Profile updated successfully'
      };

      service.updateProfile(profileData).subscribe(response => {
        expect(response).toEqual(mockResponse.data);
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
      const mockResponse: PhotosResponse = {
        success: true,
        data: [
          {
            id: 1,
            user_id: 1,
            file_path: 'uploads/photos/photo1.jpg',
            is_primary: true,
            is_private: false,
            status: 'approved' as const,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          },
          {
            id: 2,
            user_id: 1,
            file_path: 'uploads/photos/photo2.jpg',
            is_primary: false,
            is_private: true,
            status: 'approved' as const,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          }
        ],
        message: 'Photos retrieved successfully'
      };

      service.getPhotos().subscribe(response => {
        expect(response).toEqual(mockResponse.data);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/photos`);
      expect(req.request.method).toBe('GET');
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

  describe('setPrimaryPhoto', () => {
    it('should send PUT request to set primary photo endpoint', () => {
      const photoId = 1;
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          user_id: 1,
          file_path: 'uploads/photos/test.jpg',
          is_primary: true,
          is_private: false,
          status: 'approved' as const,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      };

      service.setPrimaryPhoto(photoId).subscribe(response => {
        expect(response).toEqual(mockResponse.data);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/photos/${photoId}`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('getProfileCompletion', () => {
    it('should send GET request to get profile completion endpoint', () => {
      const mockResponse = { 
        success: true,
        data: { completion_percentage: 85 }
      };

      service.getProfileCompletion().subscribe(response => {
        expect(response).toEqual(mockResponse.data);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/completion`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPreferences', () => {
    it('should send GET request to get preferences endpoint', () => {
      const mockResponse: PreferenceResponse = {
        success: true,
        data: {
          id: 1,
          user_id: 1,
          age_min: 25,
          age_max: 35,
          height_min: 160,
          height_max: 180,
          education_level: ['bachelors', 'masters'],
          religion: ['Christianity', 'Hinduism'],
          location_preference: 'same_city',
          max_distance_km: 50,
          deal_breakers: ['smoking', 'drinking'],
          preferred_diet: ['vegetarian'],
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        message: 'Preferences retrieved successfully'
      };

      service.getPreferences().subscribe(response => {
        expect(response).toEqual(mockResponse.data);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/preferences`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updatePreferences', () => {
    it('should send PUT request to update preferences endpoint', () => {
      const preferencesData = {
        age_min: 25,
        age_max: 35,
        location_preference: 'same_city' as const
      };
      const mockResponse: PreferenceResponse = {
        success: true,
        data: {
          id: 1,
          user_id: 1,
          age_min: 25,
          age_max: 35,
          location_preference: 'same_city',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        message: 'Preferences updated successfully'
      };

      service.updatePreferences(preferencesData).subscribe(response => {
        expect(response).toEqual(mockResponse.data);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/preferences`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(preferencesData);
      req.flush(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors', () => {
      service.getProfile().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
}); 