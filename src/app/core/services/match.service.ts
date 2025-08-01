import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

export interface MatchSuggestion {
  id: number;
  user: User;
  match_percentage: number;
  compatibility_score: number;
  mutual_interests: string[];
  distance_km?: number;
  suggested_at: string;
}

export interface MatchRequest {
  id: number;
  from_user: User;
  to_user: User;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: number;
  user1: User;
  user2: User;
  match_percentage: number;
  created_at: string;
  last_interaction?: string;
  is_active: boolean;
}

export interface MatchActionRequest {
  user_id: number;
  action: 'like' | 'dislike' | 'super_like' | 'block';
  message?: string;
}

export interface MatchResponse {
  success: boolean;
  data: any;
  message: string;
}

export interface SuggestionsResponse {
  success: boolean;
  data: MatchSuggestion[];
  message: string;
}

export interface MatchesResponse {
  success: boolean;
  data: Match[];
  message: string;
}

export interface RequestsResponse {
  success: boolean;
  data: MatchRequest[];
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private suggestionsSubject = new BehaviorSubject<MatchSuggestion[]>([]);
  public suggestions$ = this.suggestionsSubject.asObservable();

  private matchesSubject = new BehaviorSubject<Match[]>([]);
  public matches$ = this.matchesSubject.asObservable();

  private pendingRequestsSubject = new BehaviorSubject<MatchRequest[]>([]);
  public pendingRequests$ = this.pendingRequestsSubject.asObservable();

  private sentRequestsSubject = new BehaviorSubject<MatchRequest[]>([]);
  public sentRequests$ = this.sentRequestsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Match Suggestions
  getSuggestions(page: number = 1, limit: number = 20): Observable<MatchSuggestion[]> {
    const headers = this.getAuthHeaders();
    const params = { page: page.toString(), limit: limit.toString() };
    
    return this.http.get<SuggestionsResponse>(`${environment.apiUrl}/matches/suggestions`, { 
      headers, 
      params 
    }).pipe(
      map(response => response.data),
      tap(suggestions => {
        if (page === 1) {
          this.suggestionsSubject.next(suggestions);
        } else {
          const currentSuggestions = this.suggestionsSubject.value;
          this.suggestionsSubject.next([...currentSuggestions, ...suggestions]);
        }
      }),
      catchError(this.handleError)
    );
  }

  refreshSuggestions(): Observable<MatchSuggestion[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<SuggestionsResponse>(`${environment.apiUrl}/matches/suggestions/refresh`, { headers })
      .pipe(
        map(response => response.data),
        tap(suggestions => {
          this.suggestionsSubject.next(suggestions);
        }),
        catchError(this.handleError)
      );
  }

  // Match Actions
  likeUser(userId: number, message?: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const request: MatchActionRequest = {
      user_id: userId,
      action: 'like',
      message
    };

    return this.http.post<MatchResponse>(`${environment.apiUrl}/matches/actions`, request, { headers })
      .pipe(
        tap(() => {
          // Remove from suggestions
          const currentSuggestions = this.suggestionsSubject.value;
          const filteredSuggestions = currentSuggestions.filter(s => s.user.id !== userId);
          this.suggestionsSubject.next(filteredSuggestions);
        }),
        catchError(this.handleError)
      );
  }

  dislikeUser(userId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    const request: MatchActionRequest = {
      user_id: userId,
      action: 'dislike'
    };

    return this.http.post<MatchResponse>(`${environment.apiUrl}/matches/actions`, request, { headers })
      .pipe(
        tap(() => {
          // Remove from suggestions
          const currentSuggestions = this.suggestionsSubject.value;
          const filteredSuggestions = currentSuggestions.filter(s => s.user.id !== userId);
          this.suggestionsSubject.next(filteredSuggestions);
        }),
        catchError(this.handleError)
      );
  }

  superLikeUser(userId: number, message?: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const request: MatchActionRequest = {
      user_id: userId,
      action: 'super_like',
      message
    };

    return this.http.post<MatchResponse>(`${environment.apiUrl}/matches/actions`, request, { headers })
      .pipe(
        tap(() => {
          // Remove from suggestions
          const currentSuggestions = this.suggestionsSubject.value;
          const filteredSuggestions = currentSuggestions.filter(s => s.user.id !== userId);
          this.suggestionsSubject.next(filteredSuggestions);
        }),
        catchError(this.handleError)
      );
  }

  blockUser(userId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    const request: MatchActionRequest = {
      user_id: userId,
      action: 'block'
    };

    return this.http.post<MatchResponse>(`${environment.apiUrl}/matches/actions`, request, { headers })
      .pipe(
        tap(() => {
          // Remove from suggestions
          const currentSuggestions = this.suggestionsSubject.value;
          const filteredSuggestions = currentSuggestions.filter(s => s.user.id !== userId);
          this.suggestionsSubject.next(filteredSuggestions);
        }),
        catchError(this.handleError)
      );
  }

  // Match Requests
  getPendingRequests(): Observable<MatchRequest[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<RequestsResponse>(`${environment.apiUrl}/matches/requests/pending`, { headers })
      .pipe(
        map(response => response.data),
        tap(requests => {
          this.pendingRequestsSubject.next(requests);
        }),
        catchError(this.handleError)
      );
  }

  getSentRequests(): Observable<MatchRequest[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<RequestsResponse>(`${environment.apiUrl}/matches/requests/sent`, { headers })
      .pipe(
        map(response => response.data),
        tap(requests => {
          this.sentRequestsSubject.next(requests);
        }),
        catchError(this.handleError)
      );
  }

  acceptRequest(requestId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<MatchResponse>(`${environment.apiUrl}/matches/requests/${requestId}/accept`, {}, { headers })
      .pipe(
        tap(() => {
          // Remove from pending requests
          const currentRequests = this.pendingRequestsSubject.value;
          const filteredRequests = currentRequests.filter(r => r.id !== requestId);
          this.pendingRequestsSubject.next(filteredRequests);
        }),
        catchError(this.handleError)
      );
  }

  rejectRequest(requestId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<MatchResponse>(`${environment.apiUrl}/matches/requests/${requestId}/reject`, {}, { headers })
      .pipe(
        tap(() => {
          // Remove from pending requests
          const currentRequests = this.pendingRequestsSubject.value;
          const filteredRequests = currentRequests.filter(r => r.id !== requestId);
          this.pendingRequestsSubject.next(filteredRequests);
        }),
        catchError(this.handleError)
      );
  }

  withdrawRequest(requestId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<MatchResponse>(`${environment.apiUrl}/matches/requests/${requestId}/withdraw`, {}, { headers })
      .pipe(
        tap(() => {
          // Remove from sent requests
          const currentRequests = this.sentRequestsSubject.value;
          const filteredRequests = currentRequests.filter(r => r.id !== requestId);
          this.sentRequestsSubject.next(filteredRequests);
        }),
        catchError(this.handleError)
      );
  }

  // Active Matches
  getMatches(): Observable<Match[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<MatchesResponse>(`${environment.apiUrl}/matches`, { headers })
      .pipe(
        map(response => response.data),
        tap(matches => {
          this.matchesSubject.next(matches);
        }),
        catchError(this.handleError)
      );
  }

  getMatch(matchId: number): Observable<Match> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: Match }>(`${environment.apiUrl}/matches/${matchId}`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  unmatch(matchId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<MatchResponse>(`${environment.apiUrl}/matches/${matchId}`, { headers })
      .pipe(
        tap(() => {
          // Remove from matches
          const currentMatches = this.matchesSubject.value;
          const filteredMatches = currentMatches.filter(m => m.id !== matchId);
          this.matchesSubject.next(filteredMatches);
        }),
        catchError(this.handleError)
      );
  }

  // Match Statistics
  getMatchStats(): Observable<{
    total_matches: number;
    active_matches: number;
    pending_requests: number;
    sent_requests: number;
    daily_likes_remaining: number;
    daily_super_likes_remaining: number;
  }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: any }>(`${environment.apiUrl}/matches/stats`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Compatibility
  getCompatibilityScore(userId: number): Observable<{
    overall_score: number;
    personality_score: number;
    lifestyle_score: number;
    values_score: number;
    interests_score: number;
    detailed_breakdown: any;
  }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: any }>(`${environment.apiUrl}/matches/compatibility/${userId}`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Utility Methods
  getSuggestionsValue(): MatchSuggestion[] {
    return this.suggestionsSubject.value;
  }

  getMatchesValue(): Match[] {
    return this.matchesSubject.value;
  }

  getPendingRequestsValue(): MatchRequest[] {
    return this.pendingRequestsSubject.value;
  }

  getSentRequestsValue(): MatchRequest[] {
    return this.sentRequestsSubject.value;
  }

  clearCache(): void {
    this.suggestionsSubject.next([]);
    this.matchesSubject.next([]);
    this.pendingRequestsSubject.next([]);
    this.sentRequestsSubject.next([]);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Match Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 