import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SearchFilters {
  age_min?: number;
  age_max?: number;
  location?: string;
  religion?: string;
  education?: string;
  marital_status?: string;
  occupation?: string;
  looking_for?: string;
  distance_max?: number;
  height_min?: number;
  height_max?: number;
  family_type?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  interests?: string[];
  languages?: string[];
}

export interface SearchResponse {
  success: boolean;
  data: any[];
  total: number;
  has_more: boolean;
  current_page: number;
  per_page: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  searchUsers(filters: SearchFilters, page: number = 1, perPage: number = 20): Observable<SearchResponse> {
    const headers = this.getAuthHeaders();
    const body = {
      query: '',
      filters,
      page,
      per_page: perPage
    };
    return this.http.post<SearchResponse>(`${environment.apiUrl}/search`, body, { headers })
      .pipe(
        map(response => ({
          success: true,
          data: response.data || [],
          total: response.total || 0,
          has_more: response.has_more || false,
          current_page: response.current_page || page,
          per_page: response.per_page || perPage
        })),
        catchError(this.handleError)
      );
  }

  advancedSearch(filters: SearchFilters, page: number = 1, perPage: number = 20): Observable<SearchResponse> {
    const headers = this.getAuthHeaders();
    const body = {
      ...filters,
      page,
      per_page: perPage
    };
    return this.http.post<SearchResponse>(`${environment.apiUrl}/search/advanced`, body, { headers })
      .pipe(
        map(response => ({
          success: true,
          data: response.data || [],
          total: response.total || 0,
          has_more: response.has_more || false,
          current_page: response.current_page || page,
          per_page: response.per_page || perPage
        })),
        catchError(this.handleError)
      );
  }

  // Remove unsupported search helpers (location/interests/suggestions/recent)

  searchByInterests(interests: string[], page: number = 1): Observable<SearchResponse> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('page', page.toString());

    interests.forEach(interest => {
      params.append('interests', interest);
    });

    return this.http.get<SearchResponse>(`${environment.apiUrl}/search/interests`, { headers, params })
      .pipe(
        map(response => ({
          success: true,
          data: response.data || [],
          total: response.total || 0,
          has_more: response.has_more || false,
          current_page: response.current_page || page,
          per_page: response.per_page || 20
        })),
        catchError(this.handleError)
      );
  }

  getSearchSuggestions(query: string): Observable<string[]> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('q', query);

    return this.http.get<{ suggestions: string[] }>(`${environment.apiUrl}/search/suggestions`, { headers, params })
      .pipe(
        map(response => response.suggestions || []),
        catchError(this.handleError)
      );
  }

  getRecentSearches(): Observable<any[]> {
    const headers = this.getAuthHeaders();

    return this.http.get<{ searches: any[] }>(`${environment.apiUrl}/search/recent`, { headers })
      .pipe(
        map(response => response.searches || []),
        catchError(this.handleError)
      );
  }

  saveSearch(filters: SearchFilters, name?: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const payload = {
      filters,
      name: name || 'Saved Search'
    };

    return this.http.post(`${environment.apiUrl}/search/save`, payload, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getSavedSearches(): Observable<any[]> {
    const headers = this.getAuthHeaders();

    return this.http.get<{ searches: any[] }>(`${environment.apiUrl}/search/saved`, { headers })
      .pipe(
        map(response => response.searches || []),
        catchError(this.handleError)
      );
  }

  deleteSavedSearch(searchId: number): Observable<any> {
    const headers = this.getAuthHeaders();

    return this.http.delete(`${environment.apiUrl}/search/saved/${searchId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getSearchStats(): Observable<any> {
    const headers = this.getAuthHeaders();

    return this.http.get(`${environment.apiUrl}/search/stats`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Search service error:', error);
    return throwError(() => new Error(error.error?.message || 'Search failed'));
  }
} 