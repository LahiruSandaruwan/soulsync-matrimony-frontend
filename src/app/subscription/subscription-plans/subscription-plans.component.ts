import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { PaymentService } from '../../core/services/payment.service';
import { ScriptLoaderService } from '../../core/services/script-loader.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

interface SubscriptionPlan {
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
  popular?: boolean;
}

interface CurrentSubscription {
  id: number;
  plan_type: string;
  status: string;
  start_date: string;
  end_date: string;
  auto_renewal: boolean;
}

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ModalComponent
  ],
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss']
})
export class SubscriptionPlansComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  
  loading = true;
  error = '';
  success = '';
  
  plans: SubscriptionPlan[] = [];
  currentSubscription: CurrentSubscription | null = null;
  selectedPlan: SubscriptionPlan | null = null;
  currentUser: any = null;
  
  showPaymentModal = false;
  processingPayment = false;
  errorMessage = '';
  successMessage = '';
  paymentMethod = '';
  @ViewChild('stripeCard', { static: false }) stripeCardRef?: ElementRef;
  @ViewChild('paypalButtons', { static: false }) paypalButtonsRef?: ElementRef;
  private stripe?: any;
  private stripeElements?: any;
  private cardElement?: any;
  
  // Currency preference
  currency: 'USD' | 'LKR' = 'USD';
  
  // Default plans if API fails
  defaultPlans: SubscriptionPlan[] = [
    {
      id: 1,
      name: 'Free',
      type: 'free',
      price_usd: 0,
      price_lkr: 0,
      duration_months: 1,
      features: [
        'Basic profile creation',
        'Limited daily matches (5)',
        'Basic search functionality',
        'Standard customer support'
      ],
      limits: {
        daily_matches: 5,
        messages_per_day: 10,
        photo_uploads: 3
      }
    },
    {
      id: 2,
      name: 'Basic',
      type: 'basic',
      price_usd: 9.99,
      price_lkr: 3200,
      duration_months: 1,
      features: [
        'All Free features',
        'Unlimited daily matches',
        'Advanced search filters',
        'Message read receipts',
        'Priority customer support'
      ],
      limits: {
        daily_matches: -1, // Unlimited
        messages_per_day: 50,
        photo_uploads: 10
      }
    },
    {
      id: 3,
      name: 'Premium',
      type: 'premium',
      price_usd: 19.99,
      price_lkr: 6400,
      duration_months: 1,
      features: [
        'All Basic features',
        'Unlimited messages',
        'Advanced compatibility matching',
        'Profile boost',
        'See who liked you',
        '24/7 customer support'
      ],
      limits: {
        daily_matches: -1,
        messages_per_day: -1,
        photo_uploads: 20
      },
      popular: true
    },
    {
      id: 4,
      name: 'Platinum',
      type: 'platinum',
      price_usd: 39.99,
      price_lkr: 12800,
      duration_months: 1,
      features: [
        'All Premium features',
        'Exclusive platinum badge',
        'Priority profile placement',
        'Personal matchmaker',
        'Video call feature',
        'Premium events access'
      ],
      limits: {
        daily_matches: -1,
        messages_per_day: -1,
        photo_uploads: -1
      }
    }
  ];

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router,
    private scriptLoader: ScriptLoaderService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadSubscriptionPlans();
    this.loadCurrentSubscription();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  loadSubscriptionPlans(): void {
    this.loading = true;
    this.error = '';

    this.paymentService.getSubscriptionPlans()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.plans = response?.data || this.defaultPlans;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading subscription plans:', error);
          // Fallback to default plans
          this.plans = this.defaultPlans;
          this.loading = false;
        }
      });
  }

  private loadCurrentSubscription(): void {
    this.paymentService.getCurrentSubscription()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.currentSubscription = response?.data || null;
        },
        error: (error: any) => {
          console.error('Error loading current subscription:', error);
        }
      });
  }

  onSelectPlan(plan: SubscriptionPlan): void {
    if (plan.type === 'free') {
      this.subscribeToFreePlan();
    } else {
      this.selectedPlan = plan;
      this.showPaymentModal = true;
    }
  }

  subscribeToFreePlan(): void {
    this.processingPayment = true;
    this.errorMessage = '';
    this.successMessage = '';

    // For free plan, we don't need payment processing
    const request = {
      plan_id: 1, // Assuming plan ID 1 is free
      currency: this.currency,
      auto_renewal: false
    };

    this.paymentService.subscribeToPlan(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.processingPayment = false;
          this.successMessage = 'Successfully subscribed to free plan!';
          this.loadCurrentSubscription();
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.processingPayment = false;
          this.errorMessage = error.message || 'Failed to subscribe to free plan';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
  }

  subscribeToPlan(plan: any): void {
    this.selectedPlan = plan;
    this.showPaymentModal = true;
  }

  async processSubscription(): Promise<void> {
    if (!this.selectedPlan) {
      this.errorMessage = 'Please select a plan';
      return;
    }

    this.processingPayment = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.paymentMethod === 'stripe') {
      await this.handleStripeFlow();
    } else if (this.paymentMethod === 'paypal') {
      // Buttons are rendered immediately on selection; nothing to do here
      this.processingPayment = false;
      return;
    } else {
      this.errorMessage = 'Select a payment method';
      this.processingPayment = false;
    }
  }

  private async initStripe(): Promise<void> {
    if (this.stripe) return;
    await this.scriptLoader.load('https://js.stripe.com/v3/');
    // @ts-ignore
    this.stripe = (window as any).Stripe(environment.payments.stripe.publishableKey);
    this.stripeElements = this.stripe.elements({ appearance: { theme: 'flat' } });
    this.cardElement = this.stripeElements.create('card');
    if (this.stripeCardRef?.nativeElement) {
      this.cardElement.mount(this.stripeCardRef.nativeElement);
    }
  }

  private async handleStripeFlow(): Promise<void> {
    try {
      await this.initStripe();
      // Confirm card payment client-side (PaymentIntent should be created on server within subscribe request)
      // For now, use a simplified flow: tokenize via Payment Element and pass token to subscribe
      const { paymentMethod, error } = await this.stripe.createPaymentMethod({ type: 'card', card: this.cardElement });
      if (error) throw new Error(error.message);
      const subscribeReq = {
        plan_type: this.selectedPlan!.type,
        currency: this.currency,
        auto_renewal: true,
        payment_method: 'stripe' as const,
        payment_token: paymentMethod.id
      };
      await firstValueFrom(this.paymentService.subscribeToPlan(subscribeReq));
      this.processingPayment = false;
      this.successMessage = 'Subscription successful!';
      this.showPaymentModal = false;
      this.loadCurrentSubscription();
    } catch (e: any) {
      this.processingPayment = false;
      this.errorMessage = e.message || 'Stripe payment failed';
    }
  }

  private async renderPayPalButtons(): Promise<void> {
    try {
      // Load PayPal JS SDK dynamically
      const clientId = environment.payments.paypal.clientId;
      const currency = this.currency;
      await this.scriptLoader.load(`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`);
      const amount = this.selectedPlan ? this.getPlanPrice(this.selectedPlan).toFixed(2) : '0.00';
      // @ts-ignore
      (window as any).paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: amount, currency_code: currency } }]
          });
        },
        onApprove: async (data: any) => {
          const subscribeReq = {
            plan_type: this.selectedPlan!.type,
            currency: this.currency,
            auto_renewal: true,
            payment_method: 'paypal' as const,
            payment_token: data.orderID
          };
          await firstValueFrom(this.paymentService.subscribeToPlan(subscribeReq));
          this.processingPayment = false;
          this.successMessage = 'Subscription successful!';
          this.showPaymentModal = false;
          this.loadCurrentSubscription();
        },
        onError: (err: any) => {
          this.processingPayment = false;
          this.errorMessage = err?.message || 'PayPal payment failed';
        }
      }).render(this.paypalButtonsRef!.nativeElement);
    } catch (e: any) {
      this.processingPayment = false;
      this.errorMessage = e.message || 'Unable to initialize PayPal';
    }
  }

  // Removed duplicate detailed handler; use single entrypoint below

  cancelCurrentSubscription(): void {
    if (!this.currentSubscription) {
      this.errorMessage = 'No active subscription found';
      return;
    }

    this.processingPayment = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.paymentService.cancelSubscription()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.processingPayment = false;
          this.successMessage = 'Subscription cancelled successfully';
          this.loadCurrentSubscription();
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.processingPayment = false;
          this.errorMessage = error.message || 'Failed to cancel subscription';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
  }

  onUpgradeSubscription(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
    this.showPaymentModal = true;
  }

  onClosePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedPlan = null;
  }

  onToggleCurrency(): void {
    this.currency = this.currency === 'USD' ? 'LKR' : 'USD';
  }

  getPlanPrice(plan: SubscriptionPlan): number {
    return this.currency === 'USD' ? plan.price_usd : plan.price_lkr;
  }

  getCurrencySymbol(): string {
    return this.currency === 'USD' ? '$' : 'Rs.';
  }

  isCurrentPlan(plan: SubscriptionPlan): boolean {
    return this.currentSubscription?.plan_type === plan.type;
  }

  canUpgradeTo(plan: SubscriptionPlan): boolean {
    if (!this.currentSubscription) return true;
    
    const planHierarchy = ['free', 'basic', 'premium', 'platinum'];
    const currentIndex = planHierarchy.indexOf(this.currentSubscription.plan_type);
    const targetIndex = planHierarchy.indexOf(plan.type);
    
    return targetIndex > currentIndex;
  }

  getPlanStatusText(): string {
    if (!this.currentSubscription) return 'No active subscription';
    
    const status = this.currentSubscription.status;
    const planType = this.currentSubscription.plan_type;
    
    switch (status) {
      case 'active':
        return `Active ${planType} subscription`;
      case 'cancelled':
        return `${planType} subscription (cancelled)`;
      case 'expired':
        return `${planType} subscription (expired)`;
      default:
        return `${planType} subscription (${status})`;
    }
  }

  getDaysRemaining(): number {
    if (!this.currentSubscription || this.currentSubscription.status !== 'active') {
      return 0;
    }
    
    const endDate = new Date(this.currentSubscription.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  isFeatureIncluded(plan: SubscriptionPlan, feature: string): boolean {
    return plan.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  }

  getLimitText(limit: number | undefined): string {
    if (limit === undefined) return 'N/A';
    if (limit === -1) return 'Unlimited';
    return limit.toString();
  }

  onCancelSubscription(): void {
    this.processingPayment = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.paymentService.cancelSubscription()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.processingPayment = false;
          this.successMessage = 'Subscription cancelled successfully';
          this.loadCurrentSubscription();
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.processingPayment = false;
          this.errorMessage = error.message || 'Failed to cancel subscription';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
  }

  onProcessPayment(method: string): void {
    this.paymentMethod = method;
    if (method === 'stripe') {
      // Initialize Stripe and display card element
      this.initStripe();
      this.processingPayment = false;
    } else if (method === 'paypal') {
      this.processingPayment = true;
      this.renderPayPalButtons();
    }
  }
}
