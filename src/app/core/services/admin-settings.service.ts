import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { PublicConfigService } from './public-config.service';

export interface SystemSettings {
  general?: any;
  security?: any;
  notifications?: any;
  payments?: {
    stripe_public_key?: string;
    paypal_client_id?: string;
    default_currency?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AdminSettingsService {
  private settingsSubject = new BehaviorSubject<SystemSettings | null>(null);
  public settings$ = this.settingsSubject.asObservable();

  constructor(
    private api: ApiService,
    private publicConfigService: PublicConfigService
  ) {}

  fetch(): Observable<SystemSettings> {
    return this.api.get<SystemSettings>('/admin/settings').pipe(
      map(res => {
        if (res.success) return res.data as any;
        throw new Error(res.message);
      }),
      tap(data => this.settingsSubject.next(data)),
      catchError(err => throwError(() => err))
    );
  }

  update(category: 'general'|'security'|'notifications'|'payments', settings: any): Observable<SystemSettings> {
    return this.api.put<SystemSettings>('/admin/settings', { category, settings }).pipe(
      map(res => {
        if (res.success) return res.data as any;
        throw new Error(res.message);
      }),
      tap(data => this.settingsSubject.next(data)),
      catchError(err => throwError(() => err))
    );
  }

  get value(): SystemSettings | null { return this.settingsSubject.value; }

  /**
   * Get feature flags from public config
   */
  getFeatureFlags(): Observable<any> {
    return this.publicConfigService.getFeatureFlags();
  }

  /**
   * Get payment configuration from public config
   */
  getPaymentConfig(): Observable<any> {
    return this.publicConfigService.getPaymentConfig();
  }

  /**
   * Get public app configuration
   */
  getPublicConfig(): Observable<any> {
    return this.publicConfigService.config$;
  }

  /**
   * Check if a specific feature is enabled
   */
  isFeatureEnabled(feature: string): Observable<boolean> {
    return this.publicConfigService.isFeatureEnabled(feature as any);
  }

  /**
   * Refresh public configuration
   */
  refreshPublicConfig(): Observable<any> {
    return this.publicConfigService.refreshConfig();
  }

  /**
   * Get admin dashboard overview stats
   */
  getDashboardStats(): Observable<any> {
    return this.api.get<any>('/admin/dashboard').pipe(
      map(res => {
        if (res.success) return res.data;
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Get detailed admin statistics
   */
  getDetailedStats(period: number = 30): Observable<any> {
    return this.api.get<any>('/admin/stats', { period }).pipe(
      map(res => {
        if (res.success) return res.data;
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }
}


