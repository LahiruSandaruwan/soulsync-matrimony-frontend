import { test, expect } from '@playwright/test';

test.describe('Admin Panel Flow', () => {
  const adminUser = {
    email: 'admin@soulsync.com',
    password: 'password123'
  };

  const regularUser = {
    email: 'test@soulsync.com',
    password: 'password123'
  };

  test.beforeEach(async ({ page }) => {
    // Login as admin user
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test.describe('Admin Access Control', () => {
    test('should allow admin access to admin panel', async ({ page }) => {
      await page.goto('/admin');
      
      // Should not redirect to unauthorized page
      await expect(page).toHaveURL('/admin');
      await expect(page.locator('h1')).toContainText('Admin Dashboard');
    });

    test('should prevent regular user access to admin panel', async ({ page }) => {
      // Logout admin and login as regular user
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Logout');
      
      await page.fill('input[type="email"]', regularUser.email);
      await page.fill('input[type="password"]', regularUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Try to access admin panel
      await page.goto('/admin');
      
      // Should redirect to unauthorized page or dashboard
      await expect(page).not.toHaveURL('/admin');
      await expect(page.locator('text=Unauthorized')).toBeVisible();
    });
  });

  test.describe('Admin Dashboard', () => {
    test('should display admin dashboard overview', async ({ page }) => {
      await page.goto('/admin');
      
      // Check dashboard elements
      await expect(page.locator('h1')).toContainText('Admin Dashboard');
      await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-matches"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-reports"]')).toBeVisible();
      
      // Check charts and analytics
      await expect(page.locator('[data-testid="user-growth-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-chart"]')).toBeVisible();
    });

    test('should display recent activity feed', async ({ page }) => {
      await page.goto('/admin');
      
      // Check activity feed
      await expect(page.locator('[data-testid="activity-feed"]')).toBeVisible();
      
      const activities = page.locator('[data-testid="activity-item"]');
      const count = await activities.count();
      
      if (count > 0) {
        await expect(activities.first()).toBeVisible();
        await expect(page.locator('[data-testid="activity-user"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="activity-action"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="activity-time"]').first()).toBeVisible();
      }
    });

    test('should display system health metrics', async ({ page }) => {
      await page.goto('/admin');
      
      // Check system health section
      await expect(page.locator('[data-testid="system-health"]')).toBeVisible();
      await expect(page.locator('[data-testid="server-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="database-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="cache-status"]')).toBeVisible();
    });
  });

  test.describe('User Management', () => {
    test('should display user management page', async ({ page }) => {
      await page.goto('/admin/users');
      
      // Check page elements
      await expect(page.locator('h1')).toContainText('User Management');
      await expect(page.locator('[data-testid="user-search"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-filters"]')).toBeVisible();
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    });

    test('should search users', async ({ page }) => {
      await page.goto('/admin/users');
      
      // Search for specific user
      await page.fill('[data-testid="user-search"]', 'test@soulsync.com');
      await page.press('[data-testid="user-search"]', 'Enter');
      
      // Should filter users
      await page.waitForTimeout(500);
      const userRows = page.locator('[data-testid="user-row"]');
      const count = await userRows.count();
      
      if (count > 0) {
        await expect(page.locator('text=test@soulsync.com')).toBeVisible();
      }
    });

    test('should filter users by status', async ({ page }) => {
      await page.goto('/admin/users');
      
      // Apply status filter
      await page.selectOption('[data-testid="status-filter"]', 'active');
      
      // Should show only active users
      await page.waitForTimeout(500);
      const statusCells = page.locator('[data-testid="user-status"]');
      const count = await statusCells.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const status = await statusCells.nth(i).textContent();
          expect(status?.toLowerCase()).toContain('active');
        }
      }
    });

    test('should view user details', async ({ page }) => {
      await page.goto('/admin/users');
      
      // Click on first user
      const userRows = page.locator('[data-testid="user-row"]');
      const count = await userRows.count();
      
      if (count > 0) {
        await userRows.first().click();
        
        // Should open user details modal/page
        await expect(page.locator('[data-testid="user-details"]')).toBeVisible();
        await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
        await expect(page.locator('[data-testid="user-registration-date"]')).toBeVisible();
        await expect(page.locator('[data-testid="user-activity"]')).toBeVisible();
      }
    });

    test('should suspend user account', async ({ page }) => {
      await page.goto('/admin/users');
      
      const userRows = page.locator('[data-testid="user-row"]');
      const count = await userRows.count();
      
      if (count > 0) {
        // Click on user actions
        await page.click('[data-testid="user-actions"]');
        await page.click('text=Suspend');
        
        // Should show confirmation dialog
        await expect(page.locator('[data-testid="suspend-confirmation"]')).toBeVisible();
        
        // Provide suspension reason
        await page.fill('[data-testid="suspension-reason"]', 'Test suspension');
        await page.click('button:has-text("Confirm Suspension")');
        
        // Should show success message
        await expect(page.locator('text=User suspended')).toBeVisible();
      }
    });

    test('should ban user account', async ({ page }) => {
      await page.goto('/admin/users');
      
      const userRows = page.locator('[data-testid="user-row"]');
      const count = await userRows.count();
      
      if (count > 0) {
        await page.click('[data-testid="user-actions"]');
        await page.click('text=Ban');
        
        // Should show ban confirmation
        await expect(page.locator('[data-testid="ban-confirmation"]')).toBeVisible();
        
        await page.fill('[data-testid="ban-reason"]', 'Test ban');
        await page.click('button:has-text("Confirm Ban")');
        
        // Should show success message
        await expect(page.locator('text=User banned')).toBeVisible();
      }
    });

    test('should export user data', async ({ page }) => {
      await page.goto('/admin/users');
      
      // Click export button
      const exportButton = page.locator('[data-testid="export-users"]');
      if (await exportButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();
        const download = await downloadPromise;
        
        // Verify download
        expect(download.suggestedFilename()).toContain('users');
        expect(download.suggestedFilename()).toContain('.csv');
      }
    });
  });

  test.describe('Content Management', () => {
    test('should display pending photo reviews', async ({ page }) => {
      await page.goto('/admin/content');
      
      // Check pending photos section
      await expect(page.locator('h2')).toContainText('Pending Photo Reviews');
      await expect(page.locator('[data-testid="pending-photos"]')).toBeVisible();
      
      const photos = page.locator('[data-testid="pending-photo"]');
      const count = await photos.count();
      
      if (count > 0) {
        await expect(photos.first()).toBeVisible();
        await expect(page.locator('[data-testid="photo-user"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="approve-photo"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="reject-photo"]').first()).toBeVisible();
      }
    });

    test('should approve photo', async ({ page }) => {
      await page.goto('/admin/content');
      
      const approveButtons = page.locator('[data-testid="approve-photo"]');
      const count = await approveButtons.count();
      
      if (count > 0) {
        await approveButtons.first().click();
        
        // Should show success message
        await expect(page.locator('text=Photo approved')).toBeVisible();
        
        // Photo should be removed from pending list
        const newCount = await page.locator('[data-testid="pending-photo"]').count();
        expect(newCount).toBeLessThan(count);
      }
    });

    test('should reject photo with reason', async ({ page }) => {
      await page.goto('/admin/content');
      
      const rejectButtons = page.locator('[data-testid="reject-photo"]');
      const count = await rejectButtons.count();
      
      if (count > 0) {
        await rejectButtons.first().click();
        
        // Should show rejection reason dialog
        await expect(page.locator('[data-testid="rejection-reason"]')).toBeVisible();
        
        await page.selectOption('[data-testid="rejection-reason"]', 'inappropriate_content');
        await page.fill('[data-testid="rejection-comments"]', 'Test rejection');
        await page.click('button:has-text("Reject Photo")');
        
        // Should show success message
        await expect(page.locator('text=Photo rejected')).toBeVisible();
      }
    });

    test('should manage interests', async ({ page }) => {
      await page.goto('/admin/content/interests');
      
      // Check interests management
      await expect(page.locator('h1')).toContainText('Manage Interests');
      await expect(page.locator('[data-testid="interests-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-interest"]')).toBeVisible();
    });

    test('should add new interest', async ({ page }) => {
      await page.goto('/admin/content/interests');
      
      // Click add interest
      await page.click('[data-testid="add-interest"]');
      
      // Fill interest form
      await page.fill('[data-testid="interest-name"]', 'Test Interest');
      await page.selectOption('[data-testid="interest-category"]', 'hobbies');
      await page.fill('[data-testid="interest-description"]', 'Test interest description');
      
      // Submit form
      await page.click('button:has-text("Add Interest")');
      
      // Should show success message
      await expect(page.locator('text=Interest added')).toBeVisible();
      
      // Should appear in list
      await expect(page.locator('text=Test Interest')).toBeVisible();
    });
  });

  test.describe('Report Management', () => {
    test('should display reports list', async ({ page }) => {
      await page.goto('/admin/reports');
      
      // Check reports page
      await expect(page.locator('h1')).toContainText('User Reports');
      await expect(page.locator('[data-testid="reports-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="report-filters"]')).toBeVisible();
    });

    test('should filter reports by status', async ({ page }) => {
      await page.goto('/admin/reports');
      
      // Filter by pending reports
      await page.selectOption('[data-testid="status-filter"]', 'pending');
      
      // Should show only pending reports
      await page.waitForTimeout(500);
      const statusCells = page.locator('[data-testid="report-status"]');
      const count = await statusCells.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const status = await statusCells.nth(i).textContent();
          expect(status?.toLowerCase()).toContain('pending');
        }
      }
    });

    test('should view report details', async ({ page }) => {
      await page.goto('/admin/reports');
      
      const reportRows = page.locator('[data-testid="report-row"]');
      const count = await reportRows.count();
      
      if (count > 0) {
        await reportRows.first().click();
        
        // Should open report details
        await expect(page.locator('[data-testid="report-details"]')).toBeVisible();
        await expect(page.locator('[data-testid="report-type"]')).toBeVisible();
        await expect(page.locator('[data-testid="report-description"]')).toBeVisible();
        await expect(page.locator('[data-testid="reported-user"]')).toBeVisible();
        await expect(page.locator('[data-testid="reporter-user"]')).toBeVisible();
      }
    });

    test('should resolve report', async ({ page }) => {
      await page.goto('/admin/reports');
      
      const reportRows = page.locator('[data-testid="report-row"]');
      const count = await reportRows.count();
      
      if (count > 0) {
        await reportRows.first().click();
        
        // Take action on report
        await page.click('[data-testid="resolve-report"]');
        
        // Should show resolution form
        await expect(page.locator('[data-testid="resolution-form"]')).toBeVisible();
        
        await page.selectOption('[data-testid="resolution-action"]', 'warning_sent');
        await page.fill('[data-testid="resolution-notes"]', 'Test resolution');
        
        await page.click('button:has-text("Resolve Report")');
        
        // Should show success message
        await expect(page.locator('text=Report resolved')).toBeVisible();
      }
    });

    test('should dismiss false report', async ({ page }) => {
      await page.goto('/admin/reports');
      
      const reportRows = page.locator('[data-testid="report-row"]');
      const count = await reportRows.count();
      
      if (count > 0) {
        await reportRows.first().click();
        
        await page.click('[data-testid="dismiss-report"]');
        
        // Should show dismissal form
        await expect(page.locator('[data-testid="dismissal-form"]')).toBeVisible();
        
        await page.fill('[data-testid="dismissal-reason"]', 'False report - no violation found');
        
        await page.click('button:has-text("Dismiss Report")');
        
        // Should show success message
        await expect(page.locator('text=Report dismissed')).toBeVisible();
      }
    });
  });

  test.describe('Analytics and Statistics', () => {
    test('should display analytics dashboard', async ({ page }) => {
      await page.goto('/admin/analytics');
      
      // Check analytics elements
      await expect(page.locator('h1')).toContainText('Analytics');
      await expect(page.locator('[data-testid="user-metrics"]')).toBeVisible();
      await expect(page.locator('[data-testid="engagement-metrics"]')).toBeVisible();
      await expect(page.locator('[data-testid="revenue-metrics"]')).toBeVisible();
    });

    test('should filter analytics by date range', async ({ page }) => {
      await page.goto('/admin/analytics');
      
      // Set date range
      await page.fill('[data-testid="start-date"]', '2024-01-01');
      await page.fill('[data-testid="end-date"]', '2024-01-31');
      await page.click('[data-testid="apply-filters"]');
      
      // Should update charts and metrics
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-testid="date-range-display"]')).toContainText('Jan 2024');
    });

    test('should export analytics report', async ({ page }) => {
      await page.goto('/admin/analytics');
      
      // Export report
      const exportButton = page.locator('[data-testid="export-analytics"]');
      if (await exportButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();
        const download = await downloadPromise;
        
        // Verify download
        expect(download.suggestedFilename()).toContain('analytics');
        expect(download.suggestedFilename()).toMatch(/\.(csv|pdf)$/);
      }
    });
  });

  test.describe('System Settings', () => {
    test('should display system settings', async ({ page }) => {
      await page.goto('/admin/settings');
      
      // Check settings categories
      await expect(page.locator('h1')).toContainText('System Settings');
      await expect(page.locator('[data-testid="general-settings"]')).toBeVisible();
      await expect(page.locator('[data-testid="security-settings"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-settings"]')).toBeVisible();
      await expect(page.locator('[data-testid="feature-flags"]')).toBeVisible();
    });

    test('should update general settings', async ({ page }) => {
      await page.goto('/admin/settings');
      
      // Update app name
      await page.fill('[data-testid="app-name"]', 'SoulSync Test');
      await page.fill('[data-testid="app-description"]', 'Test description');
      
      // Save settings
      await page.click('[data-testid="save-general-settings"]');
      
      // Should show success message
      await expect(page.locator('text=Settings updated')).toBeVisible();
    });

    test('should toggle feature flags', async ({ page }) => {
      await page.goto('/admin/settings');
      
      // Toggle a feature flag
      const featureToggle = page.locator('[data-testid="feature-chat"] input[type="checkbox"]');
      const isChecked = await featureToggle.isChecked();
      
      await featureToggle.click();
      
      // Save feature flags
      await page.click('[data-testid="save-feature-flags"]');
      
      // Should show success message
      await expect(page.locator('text=Feature flags updated')).toBeVisible();
      
      // Verify toggle state changed
      const newState = await featureToggle.isChecked();
      expect(newState).toBe(!isChecked);
    });

    test('should update payment settings', async ({ page }) => {
      await page.goto('/admin/settings');
      
      // Update payment gateway settings
      await page.fill('[data-testid="stripe-public-key"]', 'pk_test_updated');
      await page.fill('[data-testid="paypal-client-id"]', 'paypal_test_updated');
      
      // Save payment settings
      await page.click('[data-testid="save-payment-settings"]');
      
      // Should show success message
      await expect(page.locator('text=Payment settings updated')).toBeVisible();
    });
  });

  test.describe('Admin Activity Logging', () => {
    test('should log admin actions', async ({ page }) => {
      await page.goto('/admin/activity-log');
      
      // Check activity log
      await expect(page.locator('h1')).toContainText('Admin Activity Log');
      await expect(page.locator('[data-testid="activity-log-table"]')).toBeVisible();
      
      const logEntries = page.locator('[data-testid="log-entry"]');
      const count = await logEntries.count();
      
      if (count > 0) {
        await expect(page.locator('[data-testid="log-admin"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="log-action"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="log-timestamp"]').first()).toBeVisible();
      }
    });

    test('should filter activity log', async ({ page }) => {
      await page.goto('/admin/activity-log');
      
      // Filter by action type
      await page.selectOption('[data-testid="action-filter"]', 'user_suspended');
      
      // Should show only suspension actions
      await page.waitForTimeout(500);
      const actionCells = page.locator('[data-testid="log-action"]');
      const count = await actionCells.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const action = await actionCells.nth(i).textContent();
          expect(action?.toLowerCase()).toContain('suspend');
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Intercept and fail admin API requests
      await page.route('**/api/v1/admin/**', route => route.abort());
      
      await page.goto('/admin/users');
      
      // Should show error message
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('text=Failed to load')).toBeVisible();
    });

    test('should show loading states', async ({ page }) => {
      // Delay API responses
      await page.route('**/api/v1/admin/**', route => {
        setTimeout(() => route.continue(), 2000);
      });
      
      await page.goto('/admin/users');
      
      // Should show loading spinner
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/admin');
      
      // Should show mobile navigation
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Navigation should be collapsible
      await page.click('[data-testid="mobile-menu-toggle"]');
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    });
  });
});
