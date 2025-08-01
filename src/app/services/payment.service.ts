import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Subscription, SubscriptionPlan } from '../models/user.model';

export interface PaymentMethod {
  id: number;
  user_id: number;
  type: 'stripe' | 'paypal' | 'payhere';
  provider: string;
  last_four?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
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

export interface SubscriptionRequest {
  plan_id: number;
  payment_method_id?: number;
  auto_renewal: boolean;
  coupon_code?: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  payment_method_id: number;
  description: string;
  metadata?: any;
}

export interface BillingHistory {
  id: number;
  user_id: number;
  subscription_id?: number;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  payment_method: string;
  description: string;
  invoice_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  currency?: string;
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export interface SubscriptionResponse {
  success: boolean;
  data: Subscription;
  message: string;
}

export interface PlansResponse {
  success: boolean;
  data: SubscriptionPlan[];
  message: string;
}

export interface PaymentMethodsResponse {
  success: boolean;
  data: PaymentMethod[];
  message: string;
}

export interface BillingHistoryResponse {
  success: boolean;
  data: BillingHistory[];
  message: string;
}

export interface CouponsResponse {
  success: boolean;
  data: Coupon[];
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private currentSubscriptionSubject = new BehaviorSubject<Subscription | null>(null);
  public currentSubscription$ = this.currentSubscriptionSubject.asObservable();

  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  public paymentMethods$ = this.paymentMethodsSubject.asObservable();

  private billingHistorySubject = new BehaviorSubject<BillingHistory[]>([]);
  public billingHistory$ = this.billingHistorySubject.asObservable();

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
    return this.http.get<PlansResponse>(`${environment.apiUrl}/subscriptions/plans`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getCurrentSubscription(): Observable<Subscription> {
    const headers = this.getAuthHeaders();
    return this.http.get<SubscriptionResponse>(`${environment.apiUrl}/subscriptions/current`, { headers })
      .pipe(
        map(response => response.data),
        tap(subscription => {
          this.currentSubscriptionSubject.next(subscription);
        }),
        catchError(this.handleError)
      );
  }

  createSubscription(request: SubscriptionRequest): Observable<Subscription> {
    const headers = this.getAuthHeaders();
    return this.http.post<SubscriptionResponse>(`${environment.apiUrl}/subscriptions`, request, { headers })
      .pipe(
        map(response => response.data),
        tap(subscription => {
          this.currentSubscriptionSubject.next(subscription);
        }),
        catchError(this.handleError)
      );
  }

  updateSubscription(subscriptionId: number, updates: {
    plan_id?: number;
    auto_renewal?: boolean;
  }): Observable<Subscription> {
    const headers = this.getAuthHeaders();
    return this.http.put<SubscriptionResponse>(`${environment.apiUrl}/subscriptions/${subscriptionId}`, updates, { headers })
      .pipe(
        map(response => response.data),
        tap(subscription => {
          this.currentSubscriptionSubject.next(subscription);
        }),
        catchError(this.handleError)
      );
  }

  cancelSubscription(subscriptionId: number, reason?: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = reason ? { reason } : {};
    return this.http.post(`${environment.apiUrl}/subscriptions/${subscriptionId}/cancel`, body, { headers })
      .pipe(
        tap(() => {
          const currentSubscription = this.currentSubscriptionSubject.value;
          if (currentSubscription && currentSubscription.id === subscriptionId) {
            this.currentSubscriptionSubject.next({
              ...currentSubscription,
              status: 'cancelled'
            });
          }
        }),
        catchError(this.handleError)
      );
  }

  reactivateSubscription(subscriptionId: number): Observable<Subscription> {
    const headers = this.getAuthHeaders();
    return this.http.post<SubscriptionResponse>(`${environment.apiUrl}/subscriptions/${subscriptionId}/reactivate`, {}, { headers })
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
    return this.http.get<PaymentMethodsResponse>(`${environment.apiUrl}/payments/methods`, { headers })
      .pipe(
        map(response => response.data),
        tap(methods => {
          this.paymentMethodsSubject.next(methods);
        }),
        catchError(this.handleError)
      );
  }

  addPaymentMethod(paymentMethodData: {
    type: 'stripe' | 'paypal' | 'payhere';
    token?: string;
    payment_method_id?: string;
  }): Observable<PaymentMethod> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: boolean, data: PaymentMethod }>(`${environment.apiUrl}/payments/methods`, paymentMethodData, { headers })
      .pipe(
        map(response => response.data),
        tap(method => {
          const currentMethods = this.paymentMethodsSubject.value;
          this.paymentMethodsSubject.next([...currentMethods, method]);
        }),
        catchError(this.handleError)
      );
  }

  updatePaymentMethod(methodId: number, updates: {
    is_default?: boolean;
    expiry_month?: number;
    expiry_year?: number;
  }): Observable<PaymentMethod> {
    const headers = this.getAuthHeaders();
    return this.http.put<{ success: boolean, data: PaymentMethod }>(`${environment.apiUrl}/payments/methods/${methodId}`, updates, { headers })
      .pipe(
        map(response => response.data),
        tap(updatedMethod => {
          const currentMethods = this.paymentMethodsSubject.value;
          const updatedMethods = currentMethods.map(method => 
            method.id === methodId ? updatedMethod : method
          );
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
          const filteredMethods = currentMethods.filter(method => method.id !== methodId);
          this.paymentMethodsSubject.next(filteredMethods);
        }),
        catchError(this.handleError)
      );
  }

  setDefaultPaymentMethod(methodId: number): Observable<PaymentMethod> {
    return this.updatePaymentMethod(methodId, { is_default: true });
  }

  // Payment Processing
  createPaymentIntent(amount: number, currency: string = 'USD'): Observable<PaymentIntent> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: boolean, data: PaymentIntent }>(`${environment.apiUrl}/payments/intent`, {
      amount,
      currency
    }, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  processPayment(request: PaymentRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/payments/process`, request, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Billing History
  getBillingHistory(page: number = 1, limit: number = 20): Observable<BillingHistory[]> {
    const headers = this.getAuthHeaders();
    const params = { page: page.toString(), limit: limit.toString() };
    
    return this.http.get<BillingHistoryResponse>(`${environment.apiUrl}/payments/history`, { 
      headers, 
      params 
    }).pipe(
      map(response => response.data),
      tap(history => {
        if (page === 1) {
          this.billingHistorySubject.next(history);
        } else {
          const currentHistory = this.billingHistorySubject.value;
          this.billingHistorySubject.next([...currentHistory, ...history]);
        }
      }),
      catchError(this.handleError)
    );
  }

  getInvoice(invoiceId: string): Observable<{ url: string }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: { url: string } }>(`${environment.apiUrl}/payments/invoices/${invoiceId}`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Coupons
  validateCoupon(code: string): Observable<Coupon> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean, data: Coupon }>(`${environment.apiUrl}/payments/coupons/validate/${code}`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getAvailableCoupons(): Observable<Coupon[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<CouponsResponse>(`${environment.apiUrl}/payments/coupons`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Refunds
  requestRefund(paymentId: string, reason: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/payments/refunds`, {
      payment_id: paymentId,
      reason
    }, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Webhooks
  handleWebhook(payload: any, signature: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/payments/webhooks`, {
      payload,
      signature
    }, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Utility Methods
  getCurrentSubscriptionValue(): Subscription | null {
    return this.currentSubscriptionSubject.value;
  }

  getPaymentMethodsValue(): PaymentMethod[] {
    return this.paymentMethodsSubject.value;
  }

  getBillingHistoryValue(): BillingHistory[] {
    return this.billingHistorySubject.value;
  }

  getDefaultPaymentMethod(): PaymentMethod | null {
    const methods = this.paymentMethodsSubject.value;
    return methods.find(method => method.is_default) || null;
  }

  isSubscriptionActive(): boolean {
    const subscription = this.currentSubscriptionSubject.value;
    return subscription?.status === 'active';
  }

  isSubscriptionExpired(): boolean {
    const subscription = this.currentSubscriptionSubject.value;
    if (!subscription) return false;
    
    const expiryDate = new Date(subscription.end_date);
    return expiryDate < new Date();
  }

  getDaysUntilExpiry(): number {
    const subscription = this.currentSubscriptionSubject.value;
    if (!subscription) return 0;
    
    const expiryDate = new Date(subscription.end_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  clearCache(): void {
    this.currentSubscriptionSubject.next(null);
    this.paymentMethodsSubject.next([]);
    this.billingHistorySubject.next([]);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Payment Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 