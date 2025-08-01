import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserProfile, UserPhoto, UserPreference } from '../models/user.model';

export interface ProfileUpdateRequest {
  height_cm?: number;
  weight_kg?: number;
  body_type?: 'slim' | 'average' | 'athletic' | 'heavy';
  complexion?: 'very_fair' | 'fair' | 'wheatish' | 'brown' | 'dark';
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  current_city?: string;
  current_state?: string;
  current_country?: string;
  education_level?: 'high_school' | 'diploma' | 'bachelors' | 'masters' | 'phd' | 'other';
  occupation?: string;
  company?: string;
  job_title?: string;
  annual_income_usd?: number;
  religion?: string;
  caste?: string;
  mother_tongue?: string;
  languages_known?: string[];
  family_type?: 'nuclear' | 'joint';
  family_status?: 'middle_class' | 'upper_middle_class' | 'rich' | 'affluent';
  diet?: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'jain' | 'occasionally_non_veg';
  smoking?: 'never' | 'occasionally' | 'regularly';
  drinking?: 'never' | 'occasionally' | 'socially' | 'regularly';
  hobbies?: string[];
  about_me?: string;
  looking_for?: string;
  marital_status?: 'never_married' | 'divorced' | 'widowed' | 'separated';
  have_children?: boolean;
  children_count?: number;
  willing_to_relocate?: boolean;
  preferred_locations?: string[];
}

export interface PreferenceUpdateRequest {
  age_min?: number;
  age_max?: number;
  height_min?: number;
  height_max?: number;
  education_level?: string[];
  religion?: string[];
  location_preference?: 'same_city' | 'same_state' | 'same_country' | 'anywhere';
  max_distance_km?: number;
  deal_breakers?: string[];
  preferred_diet?: string[];
}

export interface PhotoUploadRequest {
  file: File;
  is_primary?: boolean;
  is_private?: boolean;
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
  message: string;
}

export interface PhotosResponse {
  success: boolean;
  data: UserPhoto[];
  message: string;
}

export interface PreferenceResponse {
  success: boolean;
  data: UserPreference;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private currentProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentProfile$ = this.currentProfileSubject.asObservable();

  private currentPreferenceSubject = new BehaviorSubject<UserPreference | null>(null);
  public currentPreference$ = this.currentPreferenceSubject.asObservable();

  private photosSubject = new BehaviorSubject<UserPhoto[]>([]);
  public photos$ = this.photosSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Profile Management
  getProfile(): Observable<UserProfile> {
    const headers = this.getAuthHeaders();
    return this.http.get<ProfileResponse>(`${environment.apiUrl}/profile`, { headers })
      .pipe(
        map(response => response.data),
        tap(profile => {
          this.currentProfileSubject.next(profile);
        }),
        catchError(this.handleError)
      );
  }

  updateProfile(request: ProfileUpdateRequest): Observable<UserProfile> {
    const headers = this.getAuthHeaders();
    return this.http.put<ProfileResponse>(`${environment.apiUrl}/profile`, request, { headers })
      .pipe(
        map(response => response.data),
        tap(profile => {
          this.currentProfileSubject.next(profile);
        }),
        catchError(this.handleError)
      );
  }

  getProfileCompletion(): Observable<{ completion_percentage: number }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: { completion_percentage: number } }>(
      `${environment.apiUrl}/profile/completion`, { headers }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Photo Management
  getPhotos(): Observable<UserPhoto[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<PhotosResponse>(`${environment.apiUrl}/profile/photos`, { headers })
      .pipe(
        map(response => response.data),
        tap(photos => {
          this.photosSubject.next(photos);
        }),
        catchError(this.handleError)
      );
  }

  uploadPhoto(request: PhotoUploadRequest): Observable<UserPhoto> {
    const headers = this.getAuthHeaders();
    const formData = new FormData();
    formData.append('photo', request.file);
    if (request.is_primary !== undefined) {
      formData.append('is_primary', request.is_primary.toString());
    }
    if (request.is_private !== undefined) {
      formData.append('is_private', request.is_private.toString());
    }

    return this.http.post<{ success: boolean, data: UserPhoto }>(
      `${environment.apiUrl}/profile/photos`, formData, { headers }
    ).pipe(
      map(response => response.data),
      tap(photo => {
        const currentPhotos = this.photosSubject.value;
        this.photosSubject.next([...currentPhotos, photo]);
      }),
      catchError(this.handleError)
    );
  }

  updatePhoto(photoId: number, updates: { is_primary?: boolean; is_private?: boolean }): Observable<UserPhoto> {
    const headers = this.getAuthHeaders();
    return this.http.put<{ success: boolean, data: UserPhoto }>(
      `${environment.apiUrl}/profile/photos/${photoId}`, updates, { headers }
    ).pipe(
      map(response => response.data),
      tap(updatedPhoto => {
        const currentPhotos = this.photosSubject.value;
        const updatedPhotos = currentPhotos.map(photo => 
          photo.id === photoId ? updatedPhoto : photo
        );
        this.photosSubject.next(updatedPhotos);
      }),
      catchError(this.handleError)
    );
  }

  deletePhoto(photoId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${environment.apiUrl}/profile/photos/${photoId}`, { headers })
      .pipe(
        tap(() => {
          const currentPhotos = this.photosSubject.value;
          const filteredPhotos = currentPhotos.filter(photo => photo.id !== photoId);
          this.photosSubject.next(filteredPhotos);
        }),
        catchError(this.handleError)
      );
  }

  setPrimaryPhoto(photoId: number): Observable<UserPhoto> {
    return this.updatePhoto(photoId, { is_primary: true });
  }

  // Preferences Management
  getPreferences(): Observable<UserPreference> {
    const headers = this.getAuthHeaders();
    return this.http.get<PreferenceResponse>(`${environment.apiUrl}/profile/preferences`, { headers })
      .pipe(
        map(response => response.data),
        tap(preference => {
          this.currentPreferenceSubject.next(preference);
        }),
        catchError(this.handleError)
      );
  }

  updatePreferences(request: PreferenceUpdateRequest): Observable<UserPreference> {
    const headers = this.getAuthHeaders();
    return this.http.put<PreferenceResponse>(`${environment.apiUrl}/profile/preferences`, request, { headers })
      .pipe(
        map(response => response.data),
        tap(preference => {
          this.currentPreferenceSubject.next(preference);
        }),
        catchError(this.handleError)
      );
  }

  // Profile Visibility
  updateProfileVisibility(settings: {
    profile_visible?: boolean;
    show_photos?: boolean;
    show_contact?: boolean;
    show_location?: boolean;
  }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${environment.apiUrl}/profile/visibility`, settings, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Profile Verification
  requestVerification(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/profile/verify`, {}, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getVerificationStatus(): Observable<{ verified: boolean; status: string }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: { verified: boolean; status: string } }>(
      `${environment.apiUrl}/profile/verification-status`, { headers }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Utility Methods
  getCurrentProfileValue(): UserProfile | null {
    return this.currentProfileSubject.value;
  }

  getCurrentPreferenceValue(): UserPreference | null {
    return this.currentPreferenceSubject.value;
  }

  getPhotosValue(): UserPhoto[] {
    return this.photosSubject.value;
  }

  getPrimaryPhoto(): UserPhoto | null {
    const photos = this.photosSubject.value;
    return photos.find(photo => photo.is_primary) || null;
  }

  clearCache(): void {
    this.currentProfileSubject.next(null);
    this.currentPreferenceSubject.next(null);
    this.photosSubject.next([]);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Profile Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 