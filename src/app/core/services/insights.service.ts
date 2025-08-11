import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InsightsService {
  constructor(private api: ApiService) {}

  getProfileViews(): Observable<any> {
    return this.api.get<any>('/insights/profile-views').pipe(
      map(res => res.success ? res.data : (() => { throw new Error(res.message); })()),
      catchError(err => throwError(() => err))
    );
  }

  getMatchAnalytics(): Observable<any> {
    return this.api.get<any>('/insights/match-analytics').pipe(
      map(res => res.success ? res.data : (() => { throw new Error(res.message); })()),
      catchError(err => throwError(() => err))
    );
  }

  getCompatibilityReports(): Observable<any> {
    return this.api.get<any>('/insights/compatibility-reports').pipe(
      map(res => res.success ? res.data : (() => { throw new Error(res.message); })()),
      catchError(err => throwError(() => err))
    );
  }

  getProfileOptimization(): Observable<any> {
    return this.api.get<any>('/insights/profile-optimization').pipe(
      map(res => res.success ? res.data : (() => { throw new Error(res.message); })()),
      catchError(err => throwError(() => err))
    );
  }
}


