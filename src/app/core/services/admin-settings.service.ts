import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

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

  constructor(private api: ApiService) {}

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
}


