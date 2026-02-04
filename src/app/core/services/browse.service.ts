import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LiveProfile } from '../../shared/components/live-profile-card/live-profile-card.component';

export interface RecentProfile {
  id: number;
  first_name: string;
  age: number | null;
  city: string | null;
  country: string | null;
  height_cm: number | null;
  occupation: string | null;
  religion: string | null;
  photo_url: string | null;
  is_new: boolean;
  joined_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class BrowseService {
  constructor(private api: ApiService) {}

  getLiveProfiles(limit: number = 5): Observable<LiveProfile[]> {
    return this.api.get<any>('/browse/live', { limit }).pipe(
      map(res => (res.success ? (res.data || []) : [])),
      catchError(() => of([]))
    );
  }

  getAll(params?: any): Observable<any[]> {
    return this.api.get<any>('/browse', params).pipe(
      map(res => (res.success ? (res.data?.users || res.data || []) : (() => { throw new Error(res.message); })())),
      catchError(err => throwError(() => err))
    );
  }

  getPremium(): Observable<any[]> {
    return this.api.get<any>('/browse/premium').pipe(
      map(res => (res.success ? (res.data?.users || res.data || []) : (() => { throw new Error(res.message); })())),
      catchError(err => throwError(() => err))
    );
  }

  getRecentProfiles(limit: number = 6): Observable<RecentProfile[]> {
    return this.api.get<any>('/browse/recent', { limit }).pipe(
      map(res => (res.success ? (res.data || []) : [])),
      catchError(() => of([]))
    );
  }

  getRecent(params?: any): Observable<any> {
    return this.api.get<any>('/browse/recent', params).pipe(
      map(res => res),
      catchError(err => throwError(() => err))
    );
  }

  getVerified(): Observable<any[]> {
    return this.api.get<any>('/browse/verified').pipe(
      map(res => (res.success ? (res.data?.users || res.data || []) : (() => { throw new Error(res.message); })())),
      catchError(err => throwError(() => err))
    );
  }
}


