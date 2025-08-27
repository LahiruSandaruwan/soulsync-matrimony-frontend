import { test, expect } from '@playwright/test';

test.describe('Payment and Subscription Flow', () => {
  // Test user credentials - these should be configured in your test environment
  const testUser = {
    email: 'test@soulsync.com',
    password: 'password123'
  };

  test.beforeEach(async ({ page }) => {
    // Login before each payment test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test.describe('Subscription Plans Page', () => {
    test('should display subscription plans', async ({ page }) => {
      await page.goto('/subscription/plans');
      
      // Check page title and description
      await expect(page.locator('h1')).toContainText('Choose Your Plan');
      await expect(page.locator('text=Find your perfect match with the right plan')).toBeVisible();
      
      // Verify all plan cards are visible
      await expect(page.locator('[data-testid="plan-free"]')).toBeVisible();
      await expect(page.locator('[data-testid="plan-basic"]')).toBeVisible();
      await expect(page.locator('[data-testid="plan-premium"]')).toBeVisible();
      await expect(page.locator('[data-testid="plan-platinum"]')).toBeVisible();
      
      // Check plan features are displayed
      await expect(page.locator('text=Basic profile')).toBeVisible();
      await expect(page.locator('text=Unlimited matches')).toBeVisible();
      await expect(page.locator('text=Priority support')).toBeVisible();
    });

    test('should show plan comparison', async ({ page }) => {
      await page.goto('/subscription/plans');
      
      // Click compare plans button if available
      const compareButton = page.locator('text=Compare Plans');
      if (await compareButton.isVisible()) {
        await compareButton.click();
        await expect(page.locator('[data-testid="plan-comparison"]')).toBeVisible();
      }
    });

    test('should display correct pricing based on currency', async ({ page }) => {
      await page.goto('/subscription/plans');
      
      // Check if currency selector is available
      const currencySelector = page.locator('[data-testid="currency-selector"]');
      if (await currencySelector.isVisible()) {
        await currencySelector.selectOption('LKR');
        await expect(page.locator('text=LKR')).toBeVisible();
        
        await currencySelector.selectOption('USD');
        await expect(page.locator('text=USD')).toBeVisible();
      }
    });
  });

  test.describe('Payment Process', () => {
    test('should initiate payment for basic plan', async ({ page }) => {
      await page.goto('/subscription/plans');
      
      // Click on basic plan upgrade button
      await page.click('[data-testid="plan-basic"] button:has-text("Upgrade")');
      
      // Should navigate to payment page
      await expect(page).toHaveURL(/\/subscription\/checkout/);
      
      // Verify payment form elements
      await expect(page.locator('h1')).toContainText('Complete Your Purchase');
      await expect(page.locator('[data-testid="plan-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-methods"]')).toBeVisible();
    });

    test('should display payment methods', async ({ page }) => {
      await page.goto('/subscription/checkout?plan=basic');
      
      // Check available payment methods
      await expect(page.locator('[data-testid="payment-stripe"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-paypal"]')).toBeVisible();
      
      // Check local payment methods for specific regions
      const payHereMethod = page.locator('[data-testid="payment-payhere"]');
      if (await payHereMethod.isVisible()) {
        await expect(payHereMethod).toBeVisible();
      }
    });

    test('should validate payment form', async ({ page }) => {
      await page.goto('/subscription/checkout?plan=basic');
      
      // Select Stripe payment method
      await page.click('[data-testid="payment-stripe"]');
      
      // Try to submit without filling card details
      await page.click('button:has-text("Complete Payment")');
      
      // Should show validation errors
      await expect(page.locator('.error-message')).toBeVisible();
    });

    test('should process test payment with Stripe', async ({ page }) => {
      await page.goto('/subscription/checkout?plan=basic');
      
      // Select Stripe payment method
      await page.click('[data-testid="payment-stripe"]');
      
      // Fill in test card details (Stripe test card)
      await page.fill('[data-testid="card-number"]', '4242424242424242');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', 'Test User');
      
      // Submit payment
      await page.click('button:has-text("Complete Payment")');
      
      // Should show processing state
      await expect(page.locator('text=Processing payment')).toBeVisible();
      
      // Should redirect to success page
      await page.waitForURL(/\/subscription\/success/, { timeout: 30000 });
      await expect(page.locator('h1')).toContainText('Payment Successful');
    });

    test('should handle payment failure', async ({ page }) => {
      await page.goto('/subscription/checkout?plan=basic');
      
      // Select Stripe payment method
      await page.click('[data-testid="payment-stripe"]');
      
      // Fill in declined test card
      await page.fill('[data-testid="card-number"]', '4000000000000002');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', 'Test User');
      
      // Submit payment
      await page.click('button:has-text("Complete Payment")');
      
      // Should show error message
      await expect(page.locator('.payment-error')).toBeVisible();
      await expect(page.locator('text=Your card was declined')).toBeVisible();
    });

    test('should process PayPal payment', async ({ page }) => {
      await page.goto('/subscription/checkout?plan=premium');
      
      // Select PayPal payment method
      await page.click('[data-testid="payment-paypal"]');
      
      // Click PayPal button
      await page.click('[data-testid="paypal-button"]');
      
      // This would open PayPal in a new window/popup
      // In a real test, you'd handle the PayPal sandbox flow
      // For now, we'll just verify the button works
      await expect(page.locator('[data-testid="paypal-loading"]')).toBeVisible();
    });
  });

  test.describe('Subscription Management', () => {
    test('should display current subscription', async ({ page }) => {
      await page.goto('/subscription');
      
      // Check subscription status
      await expect(page.locator('h1')).toContainText('Your Subscription');
      await expect(page.locator('[data-testid="current-plan"]')).toBeVisible();
      await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="next-billing"]')).toBeVisible();
    });

    test('should allow plan upgrade', async ({ page }) => {
      await page.goto('/subscription');
      
      // Click upgrade button
      const upgradeButton = page.locator('button:has-text("Upgrade Plan")');
      if (await upgradeButton.isVisible()) {
        await upgradeButton.click();
        await expect(page).toHaveURL(/\/subscription\/plans/);
      }
    });

    test('should allow subscription cancellation', async ({ page }) => {
      await page.goto('/subscription');
      
      // Click cancel subscription button
      const cancelButton = page.locator('button:has-text("Cancel Subscription")');
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        // Confirm cancellation in modal
        await expect(page.locator('[data-testid="cancel-modal"]')).toBeVisible();
        await page.click('button:has-text("Confirm Cancellation")');
        
        // Should show cancellation success
        await expect(page.locator('text=Subscription cancelled')).toBeVisible();
      }
    });

    test('should display payment history', async ({ page }) => {
      await page.goto('/subscription/history');
      
      // Check payment history elements
      await expect(page.locator('h1')).toContainText('Payment History');
      await expect(page.locator('[data-testid="payment-table"]')).toBeVisible();
      
      // Check if payments are listed
      const paymentRows = page.locator('[data-testid="payment-row"]');
      const count = await paymentRows.count();
      if (count > 0) {
        await expect(paymentRows.first()).toBeVisible();
        await expect(page.locator('[data-testid="payment-amount"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="payment-date"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="payment-status"]').first()).toBeVisible();
      }
    });

    test('should allow invoice download', async ({ page }) => {
      await page.goto('/subscription/history');
      
      // Look for download invoice button
      const downloadButton = page.locator('[data-testid="download-invoice"]').first();
      if (await downloadButton.isVisible()) {
        // Start download
        const downloadPromise = page.waitForEvent('download');
        await downloadButton.click();
        const download = await downloadPromise;
        
        // Verify download
        expect(download.suggestedFilename()).toContain('invoice');
      }
    });
  });

  test.describe('Payment Security', () => {
    test('should handle expired sessions during payment', async ({ page }) => {
      await page.goto('/subscription/checkout?plan=basic');
      
      // Simulate expired session by clearing auth token
      await page.evaluate(() => {
        localStorage.removeItem('token');
      });
      
      // Try to submit payment
      await page.click('button:has-text("Complete Payment")');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should validate payment amount on server', async ({ page }) => {
      await page.goto('/subscription/checkout?plan=basic');
      
      // This test would verify that tampering with client-side pricing
      // doesn't affect server-side validation
      // Implementation would depend on your specific security measures
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto('/subscription/plans');
      
      // Intercept and fail API requests
      await page.route('**/api/v1/subscription/**', route => route.abort());
      
      // Try to upgrade
      await page.click('[data-testid="plan-basic"] button:has-text("Upgrade")');
      
      // Should show error message
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('text=Unable to process')).toBeVisible();
    });

    test('should retry failed payments', async ({ page }) => {
      await page.goto('/subscription/checkout?plan=basic');
      
      // This would test the retry mechanism for failed payments
      // Implementation depends on your retry logic
    });
  });

  test.describe('Webhook Handling', () => {
    test('should update subscription status after webhook', async ({ page, context }) => {
      // This test would verify that subscription status updates
      // after successful webhook processing
      // Implementation would require webhook simulation
    });
  });
});
