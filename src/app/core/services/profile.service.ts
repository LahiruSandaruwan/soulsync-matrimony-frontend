import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService, ApiResponse, PaginatedResponse } from './api.service';
import { User, UserProfile, UserPhoto } from '../models/user.model';

export interface ProfileCompletion {
  completion_percentage: number;
  missing_fields: string[];
  completed_fields: string[];
}

export interface ProfileStats {
  profile_views: number;
  likes_received: number;
  matches_count: number;
  response_rate: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();

  private photosSubject = new BehaviorSubject<UserPhoto[]>([]);
  public photos$ = this.photosSubject.asObservable();

  private completionSubject = new BehaviorSubject<ProfileCompletion | null>(null);
  public completion$ = this.completionSubject.asObservable();

  private statsSubject = new BehaviorSubject<ProfileStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  // Get user profile
  getProfile(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>('/profile')
      .pipe(
        map(response => {
          if (response.success) {
            this.profileSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Profile Service Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Update user profile
  updateProfile(profileData: Partial<UserProfile>): Observable<UserProfile> {
    return this.apiService.put<UserProfile>('/profile', profileData)
      .pipe(
        map(response => {
          if (response.success) {
            this.profileSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Profile Update Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get profile completion
  getProfileCompletion(): Observable<ProfileCompletion> {
    return this.apiService.get<ProfileCompletion>('/profile/completion-status')
      .pipe(
        map(response => {
          if (response.success) {
            this.completionSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Profile Completion Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get profile statistics
  getProfileStats(): Observable<ProfileStats> {
    return this.apiService.get<ProfileStats>('/settings/stats')
      .pipe(
        map(response => {
          if (response.success) {
            this.statsSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Profile Stats Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get user photos
  getPhotos(): Observable<UserPhoto[]> {
    return this.apiService.get<UserPhoto[]>('/profile/photos')
      .pipe(
        map(response => {
          if (response.success) {
            this.photosSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Photos Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Upload single photo
  uploadPhoto(file: File): Observable<UserPhoto> {
    return this.apiService.uploadFile<UserPhoto>('/profile/photos', file)
      .pipe(
        map(response => {
          if (response.success) {
            const currentPhotos = this.photosSubject.value;
            this.photosSubject.next([...currentPhotos, response.data]);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Photo Upload Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Upload multiple photos
  uploadPhotos(files: File[]): Observable<UserPhoto[]> {
    // Backend supports single upload; optional: iterate client-side if batch not available
    return this.apiService.uploadFiles<UserPhoto[]>('/profile/photos', files)
      .pipe(
        map(response => {
          if (response.success) {
            const currentPhotos = this.photosSubject.value;
            this.photosSubject.next([...currentPhotos, ...response.data]);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Photos Upload Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Set primary photo
  setPrimaryPhoto(photoId: number): Observable<UserPhoto> {
    return this.apiService.post<UserPhoto>(`/profile/photos/${photoId}/set-profile`)
      .pipe(
        map(response => {
          if (response.success) {
            const currentPhotos = this.photosSubject.value.map(photo => ({
              ...photo,
              is_primary: photo.id === photoId
            }));
            this.photosSubject.next(currentPhotos);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Set Primary Photo Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Delete photo
  deletePhoto(photoId: number): Observable<void> {
    return this.apiService.delete<void>(`/profile/photos/${photoId}`)
      .pipe(
        map(response => {
          if (response.success) {
            const currentPhotos = this.photosSubject.value.filter(photo => photo.id !== photoId);
            this.photosSubject.next(currentPhotos);
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Delete Photo Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Toggle photo privacy
  togglePhotoPrivacy(photoId: number): Observable<UserPhoto> {
    return this.apiService.post<UserPhoto>(`/profile/photos/${photoId}/toggle-private`)
      .pipe(
        map(response => {
          if (response.success) {
            const currentPhotos = this.photosSubject.value.map(photo => 
              photo.id === photoId ? { ...photo, is_private: !photo.is_private } : photo
            );
            this.photosSubject.next(currentPhotos);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Toggle Photo Privacy Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get profile by user ID (for viewing other profiles)
  getProfileById(userId: number): Observable<UserProfile> {
    return this.apiService.get<UserProfile>(`/users/${userId}`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Get Profile by ID Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get user preferences
  getPreferences(): Observable<any> {
    return this.apiService.get<any>('/preferences')
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Get Preferences Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get user settings
  getSettings(): Observable<any> {
    return this.apiService.get<any>('/settings')
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Get Settings Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Update notification settings
  updateNotificationSettings(settings: any): Observable<any> {
    return this.apiService.put<any>('/settings/notifications', settings)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Update Notification Settings Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Update privacy settings
  updatePrivacySettings(settings: any): Observable<any> {
    return this.apiService.put<any>('/settings/privacy', settings)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Update Privacy Settings Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Export user data
  exportData(): Observable<any> {
    return this.apiService.post<any>('/settings/export-data')
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Export Data Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get current profile value
  getProfileValue(): UserProfile | null {
    return this.profileSubject.value;
  }

  // Get current photos value
  getPhotosValue(): UserPhoto[] {
    return this.photosSubject.value;
  }

  // Get current completion value
  getCompletionValue(): ProfileCompletion | null {
    return this.completionSubject.value;
  }

  // Get current stats value
  getStatsValue(): ProfileStats | null {
    return this.statsSubject.value;
  }

  // Clear cache
  clearCache(): void {
    this.profileSubject.next(null);
    this.photosSubject.next([]);
    this.completionSubject.next(null);
    this.statsSubject.next(null);
  }
} 