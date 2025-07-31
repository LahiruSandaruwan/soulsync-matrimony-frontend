import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-romantic text-gradient mb-2">⭐ Upgrade Your Experience</h1>
          <p class="text-gray-600">Unlock premium features to find your perfect match faster</p>
        </div>

        <!-- Current Plan Status -->
        <div class="card mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-romantic text-gradient mb-2">Current Plan</h2>
              <p class="text-gray-600">{{ currentPlan.name }} • {{ currentPlan.price }}/month</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Next billing: {{ currentPlan.nextBilling }}</p>
              <button class="btn-outline text-sm mt-2">📅 Manage Billing</button>
            </div>
          </div>
        </div>

        <!-- Subscription Plans -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <!-- Basic Plan -->
          <div class="card relative">
            <div class="text-center mb-6">
              <h3 class="text-2xl font-romantic text-gradient mb-2">💕 Basic</h3>
              <div class="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <p class="text-gray-600">Free forever</p>
            </div>

            <ul class="space-y-3 mb-6">
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Create profile</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Browse profiles</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Send 5 likes per day</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Basic matching</span>
              </li>
              <li class="flex items-center text-gray-400">
                <span class="mr-2">✗</span>
                <span class="text-sm">Advanced filters</span>
              </li>
              <li class="flex items-center text-gray-400">
                <span class="mr-2">✗</span>
                <span class="text-sm">Unlimited messaging</span>
              </li>
            </ul>

            <button class="w-full btn-outline" disabled>
              Current Plan
            </button>
          </div>

          <!-- Premium Plan -->
          <div class="card relative border-2 border-primary-500 transform scale-105">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span class="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                ⭐ Most Popular
              </span>
            </div>
            
            <div class="text-center mb-6">
              <h3 class="text-2xl font-romantic text-gradient mb-2">💎 Premium</h3>
              <div class="text-4xl font-bold text-gray-900 mb-2">$19.99</div>
              <p class="text-gray-600">per month</p>
            </div>

            <ul class="space-y-3 mb-6">
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Everything in Basic</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Unlimited likes</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Advanced filters</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">See who liked you</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Unlimited messaging</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Profile boost</span>
              </li>
            </ul>

            <button 
              class="w-full btn-primary"
              (click)="subscribe('premium')"
              [disabled]="isProcessing"
            >
              <span *ngIf="isProcessing" class="loading-spinner mr-2"></span>
              {{ isProcessing ? 'Processing...' : '💎 Upgrade to Premium' }}
            </button>
          </div>

          <!-- VIP Plan -->
          <div class="card relative">
            <div class="text-center mb-6">
              <h3 class="text-2xl font-romantic text-gradient mb-2">👑 VIP</h3>
              <div class="text-4xl font-bold text-gray-900 mb-2">$39.99</div>
              <p class="text-gray-600">per month</p>
            </div>

            <ul class="space-y-3 mb-6">
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Everything in Premium</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Priority customer support</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Profile verification badge</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Advanced compatibility</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Exclusive events access</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-sm">Personal matchmaker</span>
              </li>
            </ul>

            <button 
              class="w-full btn-secondary"
              (click)="subscribe('vip')"
              [disabled]="isProcessing"
            >
              <span *ngIf="isProcessing" class="loading-spinner mr-2"></span>
              {{ isProcessing ? 'Processing...' : '👑 Go VIP' }}
            </button>
          </div>
        </div>

        <!-- Features Comparison -->
        <div class="card mb-8">
          <h2 class="text-2xl font-romantic text-gradient mb-6 text-center">Feature Comparison</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-3 px-4">Feature</th>
                  <th class="text-center py-3 px-4">Basic</th>
                  <th class="text-center py-3 px-4">Premium</th>
                  <th class="text-center py-3 px-4">VIP</th>
                </tr>
              </thead>
              <tbody class="space-y-2">
                <tr class="border-b">
                  <td class="py-3 px-4">Daily Likes</td>
                  <td class="text-center py-3 px-4">5</td>
                  <td class="text-center py-3 px-4">Unlimited</td>
                  <td class="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr class="border-b">
                  <td class="py-3 px-4">Messaging</td>
                  <td class="text-center py-3 px-4">Limited</td>
                  <td class="text-center py-3 px-4">Unlimited</td>
                  <td class="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr class="border-b">
                  <td class="py-3 px-4">Advanced Filters</td>
                  <td class="text-center py-3 px-4">✗</td>
                  <td class="text-center py-3 px-4">✓</td>
                  <td class="text-center py-3 px-4">✓</td>
                </tr>
                <tr class="border-b">
                  <td class="py-3 px-4">See Who Liked You</td>
                  <td class="text-center py-3 px-4">✗</td>
                  <td class="text-center py-3 px-4">✓</td>
                  <td class="text-center py-3 px-4">✓</td>
                </tr>
                <tr class="border-b">
                  <td class="py-3 px-4">Profile Boost</td>
                  <td class="text-center py-3 px-4">✗</td>
                  <td class="text-center py-3 px-4">Monthly</td>
                  <td class="text-center py-3 px-4">Weekly</td>
                </tr>
                <tr class="border-b">
                  <td class="py-3 px-4">Priority Support</td>
                  <td class="text-center py-3 px-4">✗</td>
                  <td class="text-center py-3 px-4">✗</td>
                  <td class="text-center py-3 px-4">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="card">
          <h2 class="text-2xl font-romantic text-gradient mb-4">💳 Payment Methods</h2>
          <div class="flex space-x-4">
            <div class="flex items-center space-x-2">
              <span class="text-2xl">💳</span>
              <span class="text-sm">Credit/Debit Cards</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-2xl">🏦</span>
              <span class="text-sm">Bank Transfer</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-2xl">📱</span>
              <span class="text-sm">Mobile Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SubscriptionPlansComponent implements OnInit {
  currentPlan: any = {
    name: 'Basic',
    price: '$0',
    nextBilling: 'N/A'
  };
  isProcessing = false;

  constructor() { }

  ngOnInit(): void {
    this.loadCurrentPlan();
  }

  loadCurrentPlan(): void {
    // TODO: Load current subscription from API
    console.log('Loading current plan...');
  }

  subscribe(planType: string): void {
    this.isProcessing = true;
    
    // TODO: Implement payment processing
    console.log('Subscribing to:', planType);
    
    // Simulate payment processing
    setTimeout(() => {
      this.isProcessing = false;
      // TODO: Handle success/failure
      console.log('Subscription processed successfully!');
    }, 2000);
  }
} 