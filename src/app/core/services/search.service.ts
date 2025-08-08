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
    
    // Convert filters to query parameters
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    // Add filter parameters
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof SearchFilters];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => {
            params = params.append(key, item);
          });
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    return this.http.post<SearchResponse>(`${environment.apiUrl}/search`, {}, { headers, params })
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
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    // Add filter parameters
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof SearchFilters];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => {
            params = params.append(key, item);
          });
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    return this.http.post<SearchResponse>(`${environment.apiUrl}/search/advanced`, {}, { headers, params })
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

  searchByLocation(location: string, radius: number = 50, page: number = 1): Observable<SearchResponse> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('location', location)
      .set('radius', radius.toString())
      .set('page', page.toString());

    return this.http.get<SearchResponse>(`${environment.apiUrl}/search/location`, { headers, params })
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