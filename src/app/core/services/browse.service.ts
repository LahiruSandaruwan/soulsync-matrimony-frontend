import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LiveProfile } from '../../shared/components/live-profile-card/live-profile-card.component';

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

  getRecent(): Observable<any[]> {
    return this.api.get<any>('/browse/recent').pipe(
      map(res => (res.success ? (res.data?.users || res.data || []) : (() => { throw new Error(res.message); })())),
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


