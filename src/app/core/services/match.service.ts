import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { Match, MatchSuggestion, MatchFilters, MatchStats, MatchRequest } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private matchesSubject = new BehaviorSubject<Match[]>([]);
  public matches$ = this.matchesSubject.asObservable();

  private suggestionsSubject = new BehaviorSubject<MatchSuggestion[]>([]);
  public suggestions$ = this.suggestionsSubject.asObservable();

  private statsSubject = new BehaviorSubject<MatchStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  // Get match suggestions
  getSuggestions(filters?: MatchFilters): Observable<MatchSuggestion[]> {
    return this.apiService.get<MatchSuggestion[]>('/matches/suggestions', filters as any)
      .pipe(
        map(response => {
          if (response.success) {
            this.suggestionsSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Get Suggestions Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get user matches
  getMatches(): Observable<Match[]> {
    return this.apiService.get<Match[]>('/matches')
      .pipe(
        map(response => {
          if (response.success) {
            this.matchesSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Get Matches Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Like a user
  likeUser(userId: number): Observable<any> {
    return this.apiService.post<any>(`/matches/${userId}/like`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Like User Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Dislike a user
  dislikeUser(userId: number): Observable<any> {
    return this.apiService.post<any>(`/matches/${userId}/dislike`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Dislike User Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Super like a user
  superLikeUser(userId: number): Observable<any> {
    return this.apiService.post<any>(`/matches/${userId}/super-like`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Super Like User Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Block a user
  blockUser(userId: number): Observable<any> {
    return this.apiService.post<any>(`/matches/${userId}/block`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Block User Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get match statistics
  getMatchStats(): Observable<MatchStats> {
    return this.apiService.get<MatchStats>('/insights/match-analytics')
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
          console.error('Get Match Stats Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get compatibility score
  // Remove compatibility from Match; handled via Horoscope service

  // Get interaction status
  getInteractionStatus(userId: number): Observable<{
    is_liked: boolean;
    is_super_liked: boolean;
    is_blocked: boolean;
    is_matched: boolean;
  }> {
    return this.apiService.get<any>(`/matches/interaction-status/${userId}`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Get Interaction Status Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get current matches value
  getMatchesValue(): Match[] {
    return this.matchesSubject.value;
  }

  // Get current suggestions value
  getSuggestionsValue(): MatchSuggestion[] {
    return this.suggestionsSubject.value;
  }

  // Get current stats value
  getStatsValue(): MatchStats | null {
    return this.statsSubject.value;
  }

  // Clear cache
  clearCache(): void {
    this.matchesSubject.next([]);
    this.suggestionsSubject.next([]);
    this.statsSubject.next(null);
  }
} 