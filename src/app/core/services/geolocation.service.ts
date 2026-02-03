import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  CountryInfo,
  SupportedCountry,
  CountryPricing,
  PriceCalculation,
  COUNTRY_STORAGE_KEY,
  DEFAULT_COUNTRY,
  COUNTRY_CURRENCY_MAP
} from '../models/pricing.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private apiService = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // State management using signals
  private countryInfoSignal = signal<CountryInfo | null>(null);
  private isDetectingSignal = signal<boolean>(false);
  private supportedCountriesSignal = signal<SupportedCountry[]>([]);

  // BehaviorSubject for backward compatibility with components using observables
  private countrySubject = new BehaviorSubject<CountryInfo | null>(null);
  private pricingSubject = new BehaviorSubject<CountryPricing | null>(null);

  // Public observables
  public country$ = this.countrySubject.asObservable();
  public pricing$ = this.pricingSubject.asObservable();

  // Computed signals
  readonly countryInfo = computed(() => this.countryInfoSignal());
  readonly isDetecting = computed(() => this.isDetectingSignal());
  readonly supportedCountries = computed(() => this.supportedCountriesSignal());
  readonly currentCountryCode = computed(() => this.countryInfoSignal()?.countryCode || DEFAULT_COUNTRY);
  readonly currentCurrency = computed(() => this.countryInfoSignal()?.currencyCode || 'USD');
  readonly currentCurrencySymbol = computed(() => this.countryInfoSignal()?.currencySymbol || '$');

  constructor() {
    this.initializeCountry();
  }

  /**
   * Initialize country from storage or detect from IP
   */
  private initializeCountry(): void {
    const storedCountry = this.getStoredCountry();
    if (storedCountry) {
      this.countryInfoSignal.set(storedCountry);
      this.countrySubject.next(storedCountry);
    } else {
      // Auto-detect on initialization
      this.detectCountry().subscribe();
    }
  }

  /**
   * Detect country from IP address
   */
  detectCountry(): Observable<CountryInfo> {
    this.isDetectingSignal.set(true);

    return this.apiService.get<{
      country_code: string;
      country_name: string;
      currency_code: string;
      currency_symbol: string;
    }>('/subscription/detect-location').pipe(
      map(response => {
        if (response.success && response.data) {
          const countryInfo: CountryInfo = {
            countryCode: response.data.country_code,
            countryName: response.data.country_name,
            currencyCode: response.data.currency_code,
            currencySymbol: response.data.currency_symbol,
            detectedBy: 'ip'
          };
          this.setCountryInfo(countryInfo);
          return countryInfo;
        }
        throw new Error('Failed to detect location');
      }),
      catchError(error => {
        this.handleError('Failed to detect country from IP', error);
        // Fallback to default country
        const defaultInfo: CountryInfo = {
          countryCode: DEFAULT_COUNTRY,
          countryName: 'United States',
          currencyCode: 'USD',
          currencySymbol: '$',
          detectedBy: 'default'
        };
        this.setCountryInfo(defaultInfo);
        return of(defaultInfo);
      }),
      tap(() => this.isDetectingSignal.set(false))
    );
  }

  /**
   * Manually set country (from dropdown selection)
   */
  setManualCountry(countryCode: string, countryName?: string): void {
    const currency = COUNTRY_CURRENCY_MAP[countryCode] || { code: 'USD', symbol: '$' };

    const countryInfo: CountryInfo = {
      countryCode: countryCode,
      countryName: countryName || countryCode,
      currencyCode: currency.code,
      currencySymbol: currency.symbol,
      detectedBy: 'manual'
    };

    this.setCountryInfo(countryInfo);
    this.persistCountry(countryInfo);
  }

  /**
   * Get supported countries list
   */
  getSupportedCountries(): Observable<SupportedCountry[]> {
    return this.apiService.get<SupportedCountry[]>('/subscription/countries').pipe(
      map(response => {
        if (response.success && response.data) {
          const countries = response.data.map(c => ({
            countryCode: (c as any).country_code || c.countryCode,
            countryName: (c as any).country_name || c.countryName,
            currencyCode: (c as any).currency_code || c.currencyCode,
            currencySymbol: (c as any).currency_symbol || c.currencySymbol,
            isActive: (c as any).is_active ?? c.isActive ?? true,
            paymentMethods: (c as any).payment_methods || c.paymentMethods || []
          }));
          this.supportedCountriesSignal.set(countries);
          return countries;
        }
        return [];
      }),
      catchError(error => {
        this.handleError('Failed to load supported countries', error);
        return of([]);
      })
    );
  }

  /**
   * Get pricing for a specific country
   */
  getPricingForCountry(countryCode?: string): Observable<CountryPricing> {
    const code = countryCode || this.currentCountryCode();

    return this.apiService.get<any>(`/subscription/plans?country=${code}`).pipe(
      map(response => {
        if (response.success && response.data) {
          const pricing: CountryPricing = {
            countryCode: response.data.country_code || code,
            countryName: response.data.country_name || '',
            currencyCode: response.data.currency_code || 'USD',
            currencySymbol: response.data.currency_symbol || '$',
            plans: response.data.plans || [],
            paymentMethods: response.data.payment_methods || [],
            taxRate: response.data.tax_rate,
            taxName: response.data.tax_name,
            taxInclusive: response.data.tax_inclusive
          };
          this.pricingSubject.next(pricing);
          return pricing;
        }
        throw new Error('Failed to get pricing');
      }),
      catchError(error => {
        this.handleError('Failed to load pricing', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Calculate price for a specific plan and duration
   */
  calculatePrice(plan: string, duration: string, countryCode?: string, discountCode?: string): Observable<PriceCalculation> {
    const code = countryCode || this.currentCountryCode();

    return this.apiService.post<any>('/subscription/calculate-price', {
      plan,
      duration,
      country_code: code,
      discount_code: discountCode
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            plan: response.data.plan,
            duration: response.data.duration,
            countryCode: response.data.country_code,
            originalPrice: response.data.original_price,
            discountedPrice: response.data.discounted_price,
            discountPercentage: response.data.discount_percentage,
            taxAmount: response.data.tax_amount,
            finalPrice: response.data.final_price,
            currency: response.data.currency,
            currencySymbol: response.data.currency_symbol
          };
        }
        throw new Error('Failed to calculate price');
      }),
      catchError(error => {
        this.handleError('Failed to calculate price', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current country code
   */
  getCountryCode(): string {
    return this.countryInfoSignal()?.countryCode || this.getStoredCountry()?.countryCode || DEFAULT_COUNTRY;
  }

  /**
   * Get current currency code
   */
  getCurrency(): string {
    return this.countryInfoSignal()?.currencyCode || 'USD';
  }

  /**
   * Get current currency symbol
   */
  getCurrencySymbol(): string {
    return this.countryInfoSignal()?.currencySymbol || '$';
  }

  /**
   * Check if country was manually selected
   */
  isManuallySelected(): boolean {
    return this.countryInfoSignal()?.detectedBy === 'manual';
  }

  /**
   * Reset to auto-detected country
   */
  resetToAutoDetect(): void {
    this.clearStoredCountry();
    this.detectCountry().subscribe();
  }

  /**
   * Format price with currency symbol
   */
  formatPrice(amount: number, currencySymbol?: string): string {
    const symbol = currencySymbol || this.currentCurrencySymbol();
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Private helper methods

  private setCountryInfo(info: CountryInfo): void {
    this.countryInfoSignal.set(info);
    this.countrySubject.next(info);
  }

  private getStoredCountry(): CountryInfo | null {
    if (!this.isBrowser) return null;

    try {
      const stored = localStorage.getItem(COUNTRY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }

  private persistCountry(info: CountryInfo): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(COUNTRY_STORAGE_KEY, JSON.stringify(info));
    } catch {
      // Ignore storage errors
    }
  }

  private clearStoredCountry(): void {
    if (!this.isBrowser) return;

    try {
      localStorage.removeItem(COUNTRY_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  private handleError(message: string, error: any): void {
    if (!environment.production) {
      console.error(`Geolocation Service Error: ${message}`, error);
    }
  }
}
