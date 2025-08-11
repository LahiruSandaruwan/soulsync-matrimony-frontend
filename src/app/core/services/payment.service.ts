import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { environment } from '../../../environments/environment';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_account';
  brand?: string;
  last4?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  type: 'free' | 'basic' | 'premium' | 'platinum';
  price_usd: number;
  price_lkr: number;
  duration_months: number;
  features: string[];
  limits: {
    daily_matches?: number;
    messages_per_day?: number;
    photo_uploads?: number;
  };
}

export interface Subscription {
  id: number;
  plan_type: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  auto_renewal: boolean;
  payment_method?: PaymentMethod;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  client_secret: string;
}

export interface PaymentRequest {
  plan_id: number;
  payment_method_id?: string;
  currency: 'USD' | 'LKR';
  auto_renewal?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private subscriptionSubject = new BehaviorSubject<Subscription | null>(null);
  public subscription$ = this.subscriptionSubject.asObservable();

  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  public paymentMethods$ = this.paymentMethodsSubject.asObservable();

  private plansSubject = new BehaviorSubject<SubscriptionPlan[]>([]);
  public plans$ = this.plansSubject.asObservable();

  private isProcessingSubject = new BehaviorSubject<boolean>(false);
  public isProcessing$ = this.isProcessingSubject.asObservable();

  constructor(private apiService: ApiService) {}

  // Get subscription plans
  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.apiService.get<SubscriptionPlan[]>('/subscription/plans')
      .pipe(
        map(response => {
          if (response.success) {
            this.plansSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Get Plans Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get current subscription
  getCurrentSubscription(): Observable<Subscription> {
    return this.apiService.get<Subscription>('/subscription')
      .pipe(
        map(response => {
          if (response.success) {
            this.subscriptionSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Get Subscription Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get payment methods
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.apiService.get<PaymentMethod[]>('/payment/methods')
      .pipe(
        map(response => {
          if (response.success) {
            this.paymentMethodsSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Get Payment Methods Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Create payment intent
  // Note: client tokens should be created server-side during subscribe

  // Subscribe to plan
  subscribeToPlan(request: PaymentRequest & { payment_method?: 'stripe' | 'paypal' | 'payhere' | 'webxpay'; payment_token?: string; duration_months?: number; auto_renewal?: boolean; billing_details?: any }): Observable<Subscription> {
    this.isProcessingSubject.next(true);
    
    return this.apiService.post<Subscription>('/subscription/subscribe', request)
      .pipe(
        map(response => {
          if (response.success) {
            this.subscriptionSubject.next(response.data);
            this.isProcessingSubject.next(false);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Subscribe Error:', error);
          this.isProcessingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  // Cancel subscription
  cancelSubscription(): Observable<void> {
    return this.apiService.post<void>('/subscription/cancel')
      .pipe(
        map(response => {
          if (response.success) {
            const currentSubscription = this.subscriptionSubject.value;
            if (currentSubscription) {
              this.subscriptionSubject.next({
                ...currentSubscription,
                status: 'cancelled'
              });
            }
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Cancel Subscription Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Update subscription
  updateSubscription(request: { plan_type: 'basic' | 'premium' | 'platinum'; payment_method?: 'stripe'|'paypal'|'payhere'|'webxpay'; payment_token?: string }): Observable<Subscription> {
    return this.apiService.post<Subscription>('/subscription/upgrade', request)
      .pipe(
        map(response => {
          if (response.success) {
            this.subscriptionSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Update Subscription Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Add payment method
  // Remove unsupported stored payment methods endpoints for now

  // Remove payment method
  removePaymentMethod(_methodId: string): Observable<void> { return throwError(() => new Error('Not supported')); }

  // Set default payment method
  setDefaultPaymentMethod(_methodId: string): Observable<PaymentMethod> { return throwError(() => new Error('Not supported')); }

  // Get payment history
  getPaymentHistory(): Observable<any[]> {
    return this.apiService.get<any[]>('/subscription/history')
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Get Payment History Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Process Stripe payment
  processStripePayment(paymentIntentId: string, paymentMethodId: string): Observable<any> {
    return this.apiService.post<any>('/subscription/payment/verify', {
      payment_id: paymentIntentId,
      payment_method: 'stripe',
      payment_method_id: paymentMethodId
    })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('Stripe Payment Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Process PayPal payment
  processPayPalPayment(orderId: string): Observable<any> {
    return this.apiService.post<any>('/subscription/payment/verify', {
      payment_id: orderId,
      payment_method: 'paypal'
    })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          console.error('PayPal Payment Error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get Stripe publishable key
  getStripePublishableKey(): Observable<string> {
    // Prefer admin settings; fallback to environment
    return this.apiService.get<{ publishable_key: string }>(`/admin/settings`)
      .pipe(
        map(response => {
          if (response.success) {
            return (response.data as any)?.payment?.stripe_public_key
              || (this as any)?.runtime?.get?.('payments.stripe.publishableKey')
              || (environment as any)?.payments?.stripe?.publishableKey || '';
          } else {
            return (this as any)?.runtime?.get?.('payments.stripe.publishableKey') || (environment as any)?.payments?.stripe?.publishableKey || '';
          }
        }),
        catchError(error => {
          const fallback = (this as any)?.runtime?.get?.('payments.stripe.publishableKey') || (environment as any)?.payments?.stripe?.publishableKey || '';
          return fallback ? new Observable(sub => { sub.next(fallback); sub.complete(); }) : throwError(() => error);
        })
      );
  }

  // Get PayPal client ID
  getPayPalClientId(): Observable<string> {
    return this.apiService.get<{ client_id: string }>(`/admin/settings`)
      .pipe(
        map(response => {
          if (response.success) {
            return (response.data as any)?.payment?.paypal_client_id
              || (this as any)?.runtime?.get?.('payments.paypal.clientId')
              || (environment as any)?.payments?.paypal?.clientId || '';
          } else {
            return (this as any)?.runtime?.get?.('payments.paypal.clientId') || (environment as any)?.payments?.paypal?.clientId || '';
          }
        }),
        catchError(error => {
          const fallback = (this as any)?.runtime?.get?.('payments.paypal.clientId') || (environment as any)?.payments?.paypal?.clientId || '';
          return fallback ? new Observable(sub => { sub.next(fallback); sub.complete(); }) : throwError(() => error);
        })
      );
  }

  // Get current subscription value
  getSubscriptionValue(): Subscription | null {
    return this.subscriptionSubject.value;
  }

  // Get current payment methods value
  getPaymentMethodsValue(): PaymentMethod[] {
    return this.paymentMethodsSubject.value;
  }

  // Get current plans value
  getPlansValue(): SubscriptionPlan[] {
    return this.plansSubject.value;
  }

  // Check if processing
  isProcessing(): boolean {
    return this.isProcessingSubject.value;
  }

  // Clear cache
  clearCache(): void {
    this.subscriptionSubject.next(null);
    this.paymentMethodsSubject.next([]);
    this.plansSubject.next([]);
    this.isProcessingSubject.next(false);
  }
} 