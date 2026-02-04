import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  SuccessStory,
  SuccessStoryCard,
  SuccessStorySubmission,
  SuccessStoryUpdate,
  SuccessStoryListParams,
  SuccessStoryStats,
  UserSearchResult
} from '../models/success-story.model';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

@Injectable({ providedIn: 'root' })
export class SuccessStoryService {
  private featuredStoriesSubject = new BehaviorSubject<SuccessStoryCard[]>([]);
  public featuredStories$ = this.featuredStoriesSubject.asObservable();

  private myStoriesSubject = new BehaviorSubject<SuccessStory[]>([]);
  public myStories$ = this.myStoriesSubject.asObservable();

  constructor(private api: ApiService) {}

  // =========== PUBLIC ENDPOINTS (No Auth) ===========

  /**
   * Get paginated list of approved public stories
   */
  getApprovedStories(params?: SuccessStoryListParams): Observable<PaginatedResponse<SuccessStoryCard>> {
    return this.api.get<any>('/success-stories', params).pipe(
      map((res: any) => {
        if (res.success) {
          return {
            data: res.data || [],
            meta: res.meta
          };
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Get featured stories for homepage carousel
   */
  getFeaturedStories(limit: number = 6): Observable<SuccessStoryCard[]> {
    return this.api.get<any>('/success-stories/featured', { limit }).pipe(
      map(res => (res.success ? (res.data || []) : [])),
      tap(stories => this.featuredStoriesSubject.next(stories)),
      catchError(() => of([]))
    );
  }

  /**
   * Get a single story by ID (public for approved, auth required for own drafts)
   */
  getStoryById(id: number): Observable<SuccessStory> {
    return this.api.get<any>(`/success-stories/${id}`).pipe(
      map(res => {
        if (res.success) {
          return res.data;
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  // =========== AUTHENTICATED ENDPOINTS ===========

  /**
   * Get user's own stories
   */
  getMyStories(): Observable<SuccessStory[]> {
    return this.api.get<any>('/success-stories/my-stories').pipe(
      map(res => {
        if (res.success) {
          const stories = res.data || [];
          this.myStoriesSubject.next(stories);
          return stories;
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Submit a new success story (optionally with photos via FormData)
   */
  submitStory(data: SuccessStorySubmission, photos?: File[]): Observable<SuccessStory> {
    const formData = new FormData();

    // Add text fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add photos
    if (photos && photos.length > 0) {
      photos.forEach(photo => {
        formData.append('photos[]', photo);
      });
    }

    return this.api.post<any>('/success-stories', formData).pipe(
      map(res => {
        if (res.success) {
          return res.data;
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Update an existing draft story
   */
  updateStory(id: number, data: SuccessStoryUpdate, newPhotos?: File[]): Observable<SuccessStory> {
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Laravel method spoofing for FormData

    // Add text fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}[]`, String(item)));
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add new photos
    if (newPhotos && newPhotos.length > 0) {
      newPhotos.forEach(photo => {
        formData.append('photos[]', photo);
      });
    }

    return this.api.post<any>(`/success-stories/${id}`, formData).pipe(
      map(res => {
        if (res.success) {
          return res.data;
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Submit a draft story for approval
   */
  submitForApproval(id: number): Observable<{ message: string }> {
    return this.api.post<any>(`/success-stories/${id}/submit`, {}).pipe(
      map(res => {
        if (res.success) {
          return { message: res.message };
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Delete a draft story
   */
  deleteStory(id: number): Observable<{ message: string }> {
    return this.api.delete<any>(`/success-stories/${id}`).pipe(
      map(res => {
        if (res.success) {
          return { message: res.message };
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Search for users (to select partner)
   */
  searchUsers(query: string): Observable<UserSearchResult[]> {
    return this.api.get<any>('/success-stories/search-users', { query }).pipe(
      map(res => (res.success ? (res.data || []) : [])),
      catchError(() => of([]))
    );
  }

  // =========== ADMIN ENDPOINTS ===========

  /**
   * Get all stories with filters (admin)
   */
  getAllStoriesAdmin(params?: SuccessStoryListParams): Observable<PaginatedResponse<SuccessStory> & { stats: SuccessStoryStats }> {
    return this.api.get<any>('/admin/success-stories', params).pipe(
      map((res: any) => {
        if (res.success) {
          return {
            data: res.data || [],
            meta: res.meta,
            stats: res.stats
          };
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Get pending stories queue (admin)
   */
  getPendingStoriesAdmin(): Observable<PaginatedResponse<SuccessStory> & { pending_count: number }> {
    return this.api.get<any>('/admin/success-stories/pending').pipe(
      map((res: any) => {
        if (res.success) {
          return {
            data: res.data || [],
            meta: res.meta,
            pending_count: res.pending_count
          };
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Get story details (admin)
   */
  getStoryAdmin(id: number): Observable<SuccessStory> {
    return this.api.get<any>(`/admin/success-stories/${id}`).pipe(
      map(res => {
        if (res.success) {
          return res.data;
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Approve a story (admin)
   */
  approveStory(id: number, notes?: string, feature: boolean = false): Observable<{ message: string }> {
    return this.api.post<any>(`/admin/success-stories/${id}/approve`, { notes, feature }).pipe(
      map(res => {
        if (res.success) {
          return { message: res.message };
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Reject a story (admin)
   */
  rejectStory(id: number, reason: string, notes?: string): Observable<{ message: string }> {
    return this.api.post<any>(`/admin/success-stories/${id}/reject`, { reason, notes }).pipe(
      map(res => {
        if (res.success) {
          return { message: res.message };
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Set story as featured (admin)
   */
  setFeatured(id: number): Observable<{ message: string }> {
    return this.api.post<any>(`/admin/success-stories/${id}/feature`, {}).pipe(
      map(res => {
        if (res.success) {
          return { message: res.message };
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Remove featured status (admin)
   */
  removeFeatured(id: number): Observable<{ message: string }> {
    return this.api.delete<any>(`/admin/success-stories/${id}/feature`).pipe(
      map(res => {
        if (res.success) {
          return { message: res.message };
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Bulk approve stories (admin)
   */
  bulkApprove(storyIds: number[]): Observable<{ message: string }> {
    return this.api.post<any>('/admin/success-stories/bulk-approve', { story_ids: storyIds }).pipe(
      map(res => {
        if (res.success) {
          return { message: res.message };
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Bulk reject stories (admin)
   */
  bulkReject(storyIds: number[], reason: string): Observable<{ message: string }> {
    return this.api.post<any>('/admin/success-stories/bulk-reject', { story_ids: storyIds, reason }).pipe(
      map(res => {
        if (res.success) {
          return { message: res.message };
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Delete a story (admin)
   */
  deleteStoryAdmin(id: number): Observable<{ message: string }> {
    return this.api.delete<any>(`/admin/success-stories/${id}`).pipe(
      map(res => {
        if (res.success) {
          return { message: res.message };
        }
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }
}
