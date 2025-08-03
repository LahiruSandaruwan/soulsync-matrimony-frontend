import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  stripe_price_id?: string;
  paypal_plan_id?: string;
}

export interface PaymentMethod {
  id: number;
  type: 'card' | 'paypal' | 'bank_account';
  last4?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  payment_method_id: string;
  created_at: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  client_secret: string;
  payment_method_types: string[];
  created_at: string;
}

export interface Subscription {
  id: number;
  plan_id: number;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  trial_end?: string;
  stripe_subscription_id?: string;
  paypal_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  payment_method: PaymentMethod;
  subscription?: Subscription;
  description: string;
  created_at: string;
}

export interface CreateSubscriptionRequest {
  plan_id: number;
  payment_method_id: string;
  coupon_code?: string;
}

export interface UpdateSubscriptionRequest {
  plan_id?: number;
  cancel_at_period_end?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private plansSubject = new BehaviorSubject<SubscriptionPlan[]>([]);
  public plans$ = this.plansSubject.asObservable();

  private currentSubscriptionSubject = new BehaviorSubject<Subscription | null>(null);
  public currentSubscription$ = this.currentSubscriptionSubject.asObservable();

  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  public paymentMethods$ = this.paymentMethodsSubject.asObservable();

  private paymentHistorySubject = new BehaviorSubject<PaymentHistory[]>([]);
  public paymentHistory$ = this.paymentHistorySubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Subscription Plans
  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: SubscriptionPlan[] }>(`${environment.apiUrl}/subscriptions/plans`, { headers })
      .pipe(
        map(response => response.data),
        tap(plans => {
          this.plansSubject.next(plans);
        }),
        catchError(this.handleError)
      );
  }

  getSubscriptionPlan(planId: number): Observable<SubscriptionPlan> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: SubscriptionPlan }>(`${environment.apiUrl}/subscriptions/plans/${planId}`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Current Subscription
  getCurrentSubscription(): Observable<Subscription | null> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: Subscription | null }>(`${environment.apiUrl}/subscriptions/current`, { headers })
      .pipe(
        map(response => response.data),
        tap(subscription => {
          this.currentSubscriptionSubject.next(subscription);
        }),
        catchError(this.handleError)
      );
  }

  // Create Subscription
  createSubscription(request: CreateSubscriptionRequest): Observable<Subscription> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: boolean, data: Subscription }>(`${environment.apiUrl}/subscriptions`, request, { headers })
      .pipe(
        map(response => response.data),
        tap(subscription => {
          this.currentSubscriptionSubject.next(subscription);
        }),
        catchError(this.handleError)
      );
  }

  // Update Subscription
  updateSubscription(subscriptionId: number, request: UpdateSubscriptionRequest): Observable<Subscription> {
    const headers = this.getAuthHeaders();
    return this.http.put<{ success: boolean, data: Subscription }>(`${environment.apiUrl}/subscriptions/${subscriptionId}`, request, { headers })
      .pipe(
        map(response => response.data),
        tap(subscription => {
          this.currentSubscriptionSubject.next(subscription);
        }),
        catchError(this.handleError)
      );
  }

  // Cancel Subscription
  cancelSubscription(subscriptionId: number, cancelAtPeriodEnd: boolean = true): Observable<Subscription> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: boolean, data: Subscription }>(`${environment.apiUrl}/subscriptions/${subscriptionId}/cancel`, 
      { cancel_at_period_end: cancelAtPeriodEnd }, { headers })
      .pipe(
        map(response => response.data),
        tap(subscription => {
          this.currentSubscriptionSubject.next(subscription);
        }),
        catchError(this.handleError)
      );
  }

  // Reactivate Subscription
  reactivateSubscription(subscriptionId: number): Observable<Subscription> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: boolean, data: Subscription }>(`${environment.apiUrl}/subscriptions/${subscriptionId}/reactivate`, {}, { headers })
      .pipe(
        map(response => response.data),
        tap(subscription => {
          this.currentSubscriptionSubject.next(subscription);
        }),
        catchError(this.handleError)
      );
  }

  // Payment Methods
  getPaymentMethods(): Observable<PaymentMethod[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: PaymentMethod[] }>(`${environment.apiUrl}/payments/methods`, { headers })
      .pipe(
        map(response => response.data),
        tap(methods => {
          this.paymentMethodsSubject.next(methods);
        }),
        catchError(this.handleError)
      );
  }

  addPaymentMethod(paymentMethodId: string, type: 'card' | 'paypal'): Observable<PaymentMethod> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: boolean, data: PaymentMethod }>(`${environment.apiUrl}/payments/methods`, 
      { payment_method_id: paymentMethodId, type }, { headers })
      .pipe(
        map(response => response.data),
        tap(method => {
          const currentMethods = this.paymentMethodsSubject.value;
          this.paymentMethodsSubject.next([...currentMethods, method]);
        }),
        catchError(this.handleError)
      );
  }

  setDefaultPaymentMethod(methodId: number): Observable<PaymentMethod> {
    const headers = this.getAuthHeaders();
    return this.http.put<{ success: boolean, data: PaymentMethod }>(`${environment.apiUrl}/payments/methods/${methodId}/default`, {}, { headers })
      .pipe(
        map(response => response.data),
        tap(method => {
          const currentMethods = this.paymentMethodsSubject.value;
          const updatedMethods = currentMethods.map(m => ({
            ...m,
            is_default: m.id === methodId
          }));
          this.paymentMethodsSubject.next(updatedMethods);
        }),
        catchError(this.handleError)
      );
  }

  deletePaymentMethod(methodId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${environment.apiUrl}/payments/methods/${methodId}`, { headers })
      .pipe(
        tap(() => {
          const currentMethods = this.paymentMethodsSubject.value;
          const updatedMethods = currentMethods.filter(m => m.id !== methodId);
          this.paymentMethodsSubject.next(updatedMethods);
        }),
        catchError(this.handleError)
      );
  }

  // Payment History
  getPaymentHistory(page: number = 1, limit: number = 20): Observable<PaymentHistory[]> {
    const headers = this.getAuthHeaders();
    const params = { page: page.toString(), limit: limit.toString() };

    return this.http.get<{ success: boolean, data: PaymentHistory[] }>(`${environment.apiUrl}/payments/history`, { headers, params })
      .pipe(
        map(response => response.data),
        tap(history => {
          if (page === 1) {
            this.paymentHistorySubject.next(history);
          } else {
            const currentHistory = this.paymentHistorySubject.value;
            this.paymentHistorySubject.next([...currentHistory, ...history]);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Stripe Integration
  createStripePaymentIntent(amount: number, currency: string = 'usd'): Observable<PaymentIntent> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: boolean, data: PaymentIntent }>(`${environment.apiUrl}/payments/stripe/create-intent`, 
      { amount, currency }, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  confirmStripePayment(paymentIntentId: string, paymentMethodId: string): Observable<PaymentIntent> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: boolean, data: PaymentIntent }>(`${environment.apiUrl}/payments/stripe/confirm`, 
      { payment_intent_id: paymentIntentId, payment_method_id: paymentMethodId }, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // PayPal Integration
  createPayPalOrder(amount: number, currency: string = 'USD'): Observable<{ order_id: string; approval_url: string }> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: boolean, data: { order_id: string; approval_url: string } }>(`${environment.apiUrl}/payments/paypal/create-order`, 
      { amount, currency }, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  capturePayPalOrder(orderId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: boolean, data: any }>(`${environment.apiUrl}/payments/paypal/capture`, 
      { order_id: orderId }, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Coupons
  validateCoupon(couponCode: string): Observable<{
    valid: boolean;
    discount_percent?: number;
    discount_amount?: number;
    message?: string;
  }> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: boolean, data: any }>(`${environment.apiUrl}/payments/validate-coupon`, 
      { coupon_code: couponCode }, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Utility methods
  getPlansValue(): SubscriptionPlan[] {
    return this.plansSubject.value;
  }

  getCurrentSubscriptionValue(): Subscription | null {
    return this.currentSubscriptionSubject.value;
  }

  getPaymentMethodsValue(): PaymentMethod[] {
    return this.paymentMethodsSubject.value;
  }

  getPaymentHistoryValue(): PaymentHistory[] {
    return this.paymentHistorySubject.value;
  }

  // Check if user has active subscription
  hasActiveSubscription(): boolean {
    const subscription = this.currentSubscriptionSubject.value;
    return subscription?.status === 'active' || subscription?.status === 'trialing';
  }

  // Check if user has premium features
  hasPremiumFeatures(): boolean {
    return this.hasActiveSubscription();
  }

  // Clear cache
  clearCache(): void {
    this.plansSubject.next([]);
    this.currentSubscriptionSubject.next(null);
    this.paymentMethodsSubject.next([]);
    this.paymentHistorySubject.next([]);
  }

  // Compatibility methods for existing components
  subscribeToFree(): Observable<Subscription> {
    // Create a free subscription
    return this.createSubscription({
      plan_id: 1, // Assuming plan ID 1 is free
      payment_method_id: 'free'
    });
  }

  subscribe(subscriptionData: any): Observable<Subscription> {
    return this.createSubscription(subscriptionData);
  }

  cancelSubscriptionLegacy(subscriptionId?: number): Observable<Subscription> {
    const id = subscriptionId || this.currentSubscriptionSubject.value?.id;
    if (!id) {
      return throwError(() => new Error('No subscription ID found'));
    }
    return this.cancelSubscription(id, true);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Payment operation failed';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Payment Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 