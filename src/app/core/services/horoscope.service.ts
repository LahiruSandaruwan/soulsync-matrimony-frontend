import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface Horoscope {
  sun_sign: string;
  moon_sign?: string;
  birth_time?: string;
  birth_place?: string;
}

@Injectable({ providedIn: 'root' })
export class HoroscopeService {
  constructor(private api: ApiService) {}

  getHoroscope(): Observable<Horoscope> {
    return this.api.get<Horoscope>('/horoscope').pipe(
      map(res => {
        if (res.success) return res.data;
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  createHoroscope(data: Horoscope): Observable<Horoscope> {
    return this.api.post<Horoscope>('/horoscope', data).pipe(
      map(res => {
        if (res.success) return res.data;
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  updateHoroscope(data: Partial<Horoscope>): Observable<Horoscope> {
    return this.api.put<Horoscope>('/horoscope', data).pipe(
      map(res => {
        if (res.success) return res.data;
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }

  checkCompatibility(userId: number): Observable<{ score: number; factors: string[] }> {
    return this.api.post<{ score: number; factors: string[] }>(`/horoscope/compatibility/${userId}`).pipe(
      map(res => {
        if (res.success) return res.data;
        throw new Error(res.message);
      }),
      catchError(err => throwError(() => err))
    );
  }
}


