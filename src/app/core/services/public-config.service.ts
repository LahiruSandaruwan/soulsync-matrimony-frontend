import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PublicConfig {
  app: {
    name: string;
    version: string;
    environment: string;
    debug_mode: boolean;
    url: string;
    api_version: string;
    timezone: string;
    locale: string;
    supported_locales: string[];
  };
  payments: {
    stripe: {
      publishable_key: string;
      enabled: boolean;
      currency: string;
      webhook_endpoint: string;
    };
    paypal: {
      client_id: string;
      enabled: boolean;
      currency: string;
      environment: string;
      webhook_endpoint: string;
    };
    payhere: {
      merchant_id: string;
      enabled: boolean;
      currency: string;
      webhook_endpoint: string;
    };
    webxpay: {
      merchant_id: string;
      enabled: boolean;
      currency: string;
      webhook_endpoint: string;
    };
    supported_currencies: string[];
    default_currency: string;
  };
  features: {
    chat_enabled: boolean;
    video_calls_enabled: boolean;
    voice_messages_enabled: boolean;
    horoscope_matching: boolean;
    premium_features: boolean;
    social_login: boolean;
    push_notifications: boolean;
    email_notifications: boolean;
    profile_verification: boolean;
    advanced_search: boolean;
    ai_matching: boolean;
    analytics_enabled: boolean;
    content_moderation: boolean;
    two_factor_auth: boolean;
    privacy_mode: boolean;
  };
  social: {
    google: {
      client_id: string;
      enabled: boolean;
    };
    facebook: {
      app_id: string;
      enabled: boolean;
    };
    apple: {
      client_id: string;
      enabled: boolean;
    };
  };
  location: {
    default_country: string;
    supported_countries: { [key: string]: string };
    currency_mapping: { [key: string]: string };
  };
  subscription: {
    trial_period_days: number;
    plans: {
      [key: string]: {
        name: string;
        price_usd?: number;
        price_lkr?: number;
        features: string[];
      };
    };
  };
  limits: {
    profile: {
      max_photos: number;
      max_bio_length: number;
      max_interests: number;
      photo_size_mb: number;
      voice_intro_seconds: number;
    };
    matching: {
      daily_likes_free: number;
      daily_likes_premium: number;
      daily_super_likes_free: number;
      daily_super_likes_premium: number;
      search_results_per_page: number;
      max_search_filters: number;
    };
    chat: {
      max_message_length: number;
      max_voice_message_seconds: number;
      max_file_size_mb: number;
      typing_indicator_timeout: number;
    };
    api: {
      rate_limit_per_minute: number;
      rate_limit_auth_per_minute: number;
      max_page_size: number;
    };
  };
  ui: {
    theme: {
      primary_color: string;
      secondary_color: string;
      accent_color: string;
      neutral_color: string;
      success_color: string;
      warning_color: string;
      error_color: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    layout: {
      max_width: string;
      sidebar_width: string;
      header_height: string;
      footer_height: string;
    };
    animations: {
      enabled: boolean;
      duration_fast: string;
      duration_normal: string;
      duration_slow: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class PublicConfigService {
  private configSubject = new BehaviorSubject<PublicConfig | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private lastFetchTime = 0;
  private readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds
  
  config$ = this.configSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadConfig().subscribe();
  }

  /**
   * Load configuration from public endpoint
   */
  loadConfig(forceRefresh = false): Observable<PublicConfig> {
    const now = Date.now();
    const shouldRefresh = forceRefresh || (now - this.lastFetchTime) > this.CACHE_DURATION;
    
    if (!shouldRefresh && this.configSubject.value) {
      return of(this.configSubject.value);
    }

    this.loadingSubject.next(true);

    return this.http.get<{ success: boolean; data: PublicConfig }>(`${environment.apiUrl}/public/config`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error('Failed to load configuration');
          }
        }),
        tap(config => {
          this.configSubject.next(config);
          this.lastFetchTime = now;
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error loading public config:', error);
          this.loadingSubject.next(false);
          
          // Return fallback config
          const fallbackConfig = this.getFallbackConfig();
          this.configSubject.next(fallbackConfig);
          return of(fallbackConfig);
        }),
        shareReplay(1)
      );
  }

  /**
   * Get current config synchronously
   */
  getConfig(): PublicConfig | null {
    return this.configSubject.value;
  }

  /**
   * Get specific config section
   */
  getAppConfig(): Observable<PublicConfig['app']> {
    return this.config$.pipe(
      map(config => config?.app || this.getFallbackConfig().app)
    );
  }

  getPaymentConfig(): Observable<PublicConfig['payments']> {
    return this.config$.pipe(
      map(config => config?.payments || this.getFallbackConfig().payments)
    );
  }

  getFeatureFlags(): Observable<PublicConfig['features']> {
    return this.config$.pipe(
      map(config => config?.features || this.getFallbackConfig().features)
    );
  }

  getSocialConfig(): Observable<PublicConfig['social']> {
    return this.config$.pipe(
      map(config => config?.social || this.getFallbackConfig().social)
    );
  }

  getLocationConfig(): Observable<PublicConfig['location']> {
    return this.config$.pipe(
      map(config => config?.location || this.getFallbackConfig().location)
    );
  }

  getSubscriptionConfig(): Observable<PublicConfig['subscription']> {
    return this.config$.pipe(
      map(config => config?.subscription || this.getFallbackConfig().subscription)
    );
  }

  getLimitsConfig(): Observable<PublicConfig['limits']> {
    return this.config$.pipe(
      map(config => config?.limits || this.getFallbackConfig().limits)
    );
  }

  getUIConfig(): Observable<PublicConfig['ui']> {
    return this.config$.pipe(
      map(config => config?.ui || this.getFallbackConfig().ui)
    );
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: keyof PublicConfig['features']): Observable<boolean> {
    return this.getFeatureFlags().pipe(
      map(features => features[feature] || false)
    );
  }

  /**
   * Get payment gateway keys
   */
  getStripePublishableKey(): Observable<string> {
    return this.getPaymentConfig().pipe(
      map(payments => payments.stripe.publishable_key)
    );
  }

  getPayPalClientId(): Observable<string> {
    return this.getPaymentConfig().pipe(
      map(payments => payments.paypal.client_id)
    );
  }

  /**
   * Get social login configuration
   */
  getGoogleClientId(): Observable<string> {
    return this.getSocialConfig().pipe(
      map(social => social.google.client_id)
    );
  }

  getFacebookAppId(): Observable<string> {
    return this.getSocialConfig().pipe(
      map(social => social.facebook.app_id)
    );
  }

  /**
   * Refresh configuration
   */
  refreshConfig(): Observable<PublicConfig> {
    return this.loadConfig(true);
  }

  /**
   * Clear cached configuration
   */
  clearCache(): void {
    this.configSubject.next(null);
    this.lastFetchTime = 0;
  }

  /**
   * Get fallback configuration when API fails
   */
  private getFallbackConfig(): PublicConfig {
    return {
      app: {
        name: 'SoulSync',
        version: '1.0.0',
        environment: 'production',
        debug_mode: false,
        url: environment.apiUrl.replace('/api/v1', ''),
        api_version: 'v1',
        timezone: 'UTC',
        locale: 'en',
        supported_locales: ['en', 'si', 'ta']
      },
      payments: {
        stripe: {
          publishable_key: environment.stripe?.publishableKey || '',
          enabled: !!(environment.stripe?.publishableKey),
          currency: 'usd',
          webhook_endpoint: `${environment.apiUrl}/webhooks/stripe`
        },
        paypal: {
          client_id: environment.paypal?.clientId || '',
          enabled: !!(environment.paypal?.clientId),
          currency: 'usd',
          environment: environment.paypal?.environment || 'sandbox',
          webhook_endpoint: `${environment.apiUrl}/webhooks/paypal`
        },
        payhere: {
          merchant_id: environment.payhere?.merchantId || '',
          enabled: !!(environment.payhere?.merchantId),
          currency: 'lkr',
          webhook_endpoint: `${environment.apiUrl}/webhooks/payhere`
        },
        webxpay: {
          merchant_id: environment.webxpay?.merchantId || '',
          enabled: !!(environment.webxpay?.merchantId),
          currency: 'lkr',
          webhook_endpoint: `${environment.apiUrl}/webhooks/webxpay`
        },
        supported_currencies: ['USD', 'LKR', 'INR', 'GBP', 'EUR', 'AUD', 'CAD', 'SGD', 'AED', 'SAR'],
        default_currency: 'USD'
      },
      features: {
        chat_enabled: true,
        video_calls_enabled: true,
        voice_messages_enabled: true,
        horoscope_matching: true,
        premium_features: true,
        social_login: true,
        push_notifications: true,
        email_notifications: true,
        profile_verification: true,
        advanced_search: true,
        ai_matching: true,
        analytics_enabled: true,
        content_moderation: true,
        two_factor_auth: true,
        privacy_mode: true
      },
      social: {
        google: {
          client_id: environment.google?.clientId || '',
          enabled: !!(environment.google?.clientId)
        },
        facebook: {
          app_id: environment.facebook?.appId || '',
          enabled: !!(environment.facebook?.appId)
        },
        apple: {
          client_id: environment.apple?.clientId || '',
          enabled: !!(environment.apple?.clientId)
        }
      },
      location: {
        default_country: 'LK',
        supported_countries: {
          'LK': 'Sri Lanka',
          'IN': 'India',
          'GB': 'United Kingdom',
          'US': 'United States',
          'AU': 'Australia',
          'CA': 'Canada',
          'SG': 'Singapore',
          'AE': 'United Arab Emirates',
          'SA': 'Saudi Arabia'
        },
        currency_mapping: {
          'LK': 'LKR',
          'IN': 'INR',
          'GB': 'GBP',
          'US': 'USD',
          'AU': 'AUD',
          'CA': 'CAD',
          'SG': 'SGD',
          'AE': 'AED',
          'SA': 'SAR'
        }
      },
      subscription: {
        trial_period_days: 7,
        plans: {
          free: { name: 'Free', features: ['Basic profile', 'Limited matches', 'Basic chat'] },
          basic: { name: 'Basic', price_usd: 4.99, price_lkr: 1500, features: ['Extended profile', 'More matches', 'Voice messages'] },
          premium: { name: 'Premium', price_usd: 9.99, price_lkr: 3000, features: ['All features', 'Unlimited matches', 'Priority support'] },
          platinum: { name: 'Platinum', price_usd: 19.99, price_lkr: 6000, features: ['VIP features', 'Personal matchmaker', '24/7 support'] }
        }
      },
      limits: {
        profile: {
          max_photos: 10,
          max_bio_length: 1000,
          max_interests: 15,
          photo_size_mb: 5,
          voice_intro_seconds: 60
        },
        matching: {
          daily_likes_free: 10,
          daily_likes_premium: 100,
          daily_super_likes_free: 1,
          daily_super_likes_premium: 5,
          search_results_per_page: 20,
          max_search_filters: 10
        },
        chat: {
          max_message_length: 2000,
          max_voice_message_seconds: 120,
          max_file_size_mb: 10,
          typing_indicator_timeout: 5
        },
        api: {
          rate_limit_per_minute: 60,
          rate_limit_auth_per_minute: 5,
          max_page_size: 100
        }
      },
      ui: {
        theme: {
          primary_color: '#ec4899',
          secondary_color: '#f43f5e',
          accent_color: '#a855f7',
          neutral_color: '#e5d9cc',
          success_color: '#10b981',
          warning_color: '#f59e0b',
          error_color: '#ef4444'
        },
        fonts: {
          heading: 'Playfair Display',
          body: 'Inter'
        },
        layout: {
          max_width: '1200px',
          sidebar_width: '280px',
          header_height: '64px',
          footer_height: '200px'
        },
        animations: {
          enabled: true,
          duration_fast: '150ms',
          duration_normal: '300ms',
          duration_slow: '500ms'
        }
      }
    };
  }
}
