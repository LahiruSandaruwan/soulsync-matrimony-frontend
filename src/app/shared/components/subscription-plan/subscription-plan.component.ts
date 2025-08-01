import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  is_popular?: boolean;
  is_current?: boolean;
  discount_percentage?: number;
  original_price?: number;
  max_photos?: number;
  unlimited_likes?: boolean;
  see_who_liked?: boolean;
  advanced_filters?: boolean;
  read_receipts?: boolean;
  priority_support?: boolean;
  verified_badge?: boolean;
  boost_profile?: boolean;
  rewind_likes?: boolean;
  super_likes_per_month?: number;
}

@Component({
  selector: 'app-subscription-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-plan.component.html',
  styleUrls: ['./subscription-plan.component.scss']
})
export class SubscriptionPlanComponent {
  @Input() plan!: SubscriptionPlan;
  @Input() showActions: boolean = true;
  @Input() selectedPlanId?: number;
  
  @Output() selectPlan = new EventEmitter<SubscriptionPlan>();
  @Output() subscribe = new EventEmitter<SubscriptionPlan>();

  isSelected(): boolean {
    return this.selectedPlanId === this.plan.id;
  }

  getFormattedPrice(): string {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'LKR': 'Rs.'
    };
    
    const symbol = currencySymbols[this.plan.currency] || this.plan.currency;
    return `${symbol}${this.plan.price}`;
  }

  getBillingCycleText(): string {
    switch (this.plan.billing_cycle) {
      case 'monthly':
        return '/month';
      case 'yearly':
        return '/year';
      case 'lifetime':
        return 'one-time';
      default:
        return '';
    }
  }

  getSavingsText(): string {
    if (this.plan.discount_percentage && this.plan.original_price) {
      const savings = this.plan.original_price - this.plan.price;
      return `Save ${this.plan.discount_percentage}% (${this.plan.currency}${savings})`;
    }
    return '';
  }

  onSelectPlan(): void {
    this.selectPlan.emit(this.plan);
  }

  onSubscribe(): void {
    this.subscribe.emit(this.plan);
  }

  getFeatureIcon(feature: string): string {
    const featureIcons: { [key: string]: string } = {
      'unlimited_likes': '❤️',
      'see_who_liked': '👁️',
      'advanced_filters': '🔍',
      'read_receipts': '✓',
      'priority_support': '🎧',
      'verified_badge': '✅',
      'boost_profile': '🚀',
      'rewind_likes': '↩️',
      'super_likes': '⭐',
      'max_photos': '📷'
    };
    
    return featureIcons[feature] || '✓';
  }

  getFeatureText(feature: string): string {
    const featureTexts: { [key: string]: string } = {
      'unlimited_likes': 'Unlimited Likes',
      'see_who_liked': 'See Who Liked You',
      'advanced_filters': 'Advanced Filters',
      'read_receipts': 'Read Receipts',
      'priority_support': 'Priority Support',
      'verified_badge': 'Verified Badge',
      'boost_profile': 'Profile Boost',
      'rewind_likes': 'Rewind Last Like',
      'super_likes': `${this.plan.super_likes_per_month || 5} Super Likes/month`,
      'max_photos': `${this.plan.max_photos || 6} Photos`
    };
    
    return featureTexts[feature] || feature;
  }

  isPopularPlan(): boolean {
    return this.plan.is_popular || false;
  }

  isCurrentPlan(): boolean {
    return this.plan.is_current || false;
  }
} 