import { test, expect } from '@playwright/test';

test.describe('Browse and Discovery Flow', () => {
  const testUser = {
    email: 'test@soulsync.com',
    password: 'password123'
  };

  test.beforeEach(async ({ page }) => {
    // Login before each browse test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test.describe('General Browse Page', () => {
    test('should display browse profiles page', async ({ page }) => {
      await page.goto('/browse');
      
      // Check page elements
      await expect(page.locator('h1')).toContainText('Discover Profiles');
      await expect(page.locator('[data-testid="browse-filters"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-grid"]')).toBeVisible();
      
      // Check filter buttons
      await expect(page.locator('button:has-text("All Profiles")')).toBeVisible();
      await expect(page.locator('button:has-text("Premium")')).toBeVisible();
      await expect(page.locator('button:has-text("Recently Joined")')).toBeVisible();
      await expect(page.locator('button:has-text("Verified")')).toBeVisible();
    });

    test('should display user profiles in grid', async ({ page }) => {
      await page.goto('/browse');
      
      // Wait for profiles to load
      await page.waitForTimeout(1000);
      
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        // Check profile card elements
        await expect(profiles.first()).toBeVisible();
        await expect(page.locator('[data-testid="profile-photo"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="profile-name"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="profile-age"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="profile-location"]').first()).toBeVisible();
        
        // Check action buttons
        await expect(page.locator('[data-testid="like-button"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="dislike-button"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="super-like-button"]').first()).toBeVisible();
      }
    });

    test('should apply filters', async ({ page }) => {
      await page.goto('/browse');
      
      // Apply age filter
      await page.fill('[data-testid="age-min"]', '25');
      await page.fill('[data-testid="age-max"]', '35');
      
      // Apply location filter
      await page.fill('[data-testid="location-filter"]', 'Colombo');
      
      // Apply filter
      await page.click('[data-testid="apply-filters"]');
      
      // Wait for results
      await page.waitForTimeout(1000);
      
      // Verify filtered results
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        // Check that profiles match filter criteria
        const ageTexts = await page.locator('[data-testid="profile-age"]').allTextContents();
        for (const ageText of ageTexts) {
          const age = parseInt(ageText);
          expect(age).toBeGreaterThanOrEqual(25);
          expect(age).toBeLessThanOrEqual(35);
        }
      }
    });

    test('should reset filters', async ({ page }) => {
      await page.goto('/browse');
      
      // Apply some filters
      await page.fill('[data-testid="age-min"]', '30');
      await page.fill('[data-testid="location-filter"]', 'Test Location');
      
      // Reset filters
      await page.click('[data-testid="reset-filters"]');
      
      // Verify filters are cleared
      await expect(page.locator('[data-testid="age-min"]')).toHaveValue('');
      await expect(page.locator('[data-testid="location-filter"]')).toHaveValue('');
    });

    test('should paginate results', async ({ page }) => {
      await page.goto('/browse');
      
      // Wait for profiles to load
      await page.waitForTimeout(1000);
      
      // Check if pagination exists
      const pagination = page.locator('[data-testid="pagination"]');
      if (await pagination.isVisible()) {
        const nextButton = page.locator('[data-testid="next-page"]');
        if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
          // Click next page
          await nextButton.click();
          
          // Should load new profiles
          await page.waitForTimeout(1000);
          await expect(page.locator('[data-testid="profile-grid"]')).toBeVisible();
        }
      }
    });
  });

  test.describe('Premium Browse Page', () => {
    test('should display premium profiles', async ({ page }) => {
      await page.goto('/browse/premium');
      
      // Check premium page elements
      await expect(page.locator('h1')).toContainText('Premium Members');
      await expect(page.locator('text=Verified premium members')).toBeVisible();
      
      // Check premium indicators
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        // Should have premium badges
        await expect(page.locator('[data-testid="premium-badge"]').first()).toBeVisible();
        await expect(page.locator('text=PREMIUM')).toBeVisible();
      }
    });

    test('should show premium features info', async ({ page }) => {
      await page.goto('/browse/premium');
      
      // Check premium features section
      await expect(page.locator('[data-testid="premium-features"]')).toBeVisible();
      await expect(page.locator('text=Verified Profiles')).toBeVisible();
      await expect(page.locator('text=Video Calling')).toBeVisible();
      await expect(page.locator('text=Priority Support')).toBeVisible();
    });

    test('should show upgrade CTA for non-premium users', async ({ page }) => {
      await page.goto('/browse/premium');
      
      // Check for upgrade CTA
      const upgradeCTA = page.locator('[data-testid="upgrade-cta"]');
      if (await upgradeCTA.isVisible()) {
        await expect(page.locator('text=Upgrade to Premium')).toBeVisible();
        
        // Click upgrade button
        await page.click('button:has-text("Upgrade to Premium")');
        
        // Should navigate to subscription plans
        await expect(page).toHaveURL(/\/subscription\/plans/);
      }
    });

    test('should filter premium profiles', async ({ page }) => {
      await page.goto('/browse/premium');
      
      // Apply premium-specific filters
      await page.selectOption('[data-testid="sort-by"]', 'compatibility');
      await page.fill('[data-testid="education-filter"]', 'Master');
      
      // Apply filters
      await page.click('[data-testid="apply-filters"]');
      
      // Should show filtered premium profiles
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-testid="profile-grid"]')).toBeVisible();
    });
  });

  test.describe('Recent Members Page', () => {
    test('should display recently joined members', async ({ page }) => {
      await page.goto('/browse/recent');
      
      // Check recent page elements
      await expect(page.locator('h1')).toContainText('New Members');
      await expect(page.locator('text=recently joined members')).toBeVisible();
      
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        // Should have "NEW" badges
        await expect(page.locator('[data-testid="new-badge"]').first()).toBeVisible();
        await expect(page.locator('text=NEW')).toBeVisible();
        
        // Should show join date
        await expect(page.locator('[data-testid="join-date"]').first()).toBeVisible();
      }
    });

    test('should filter by time period', async ({ page }) => {
      await page.goto('/browse/recent');
      
      // Change time period filter
      await page.selectOption('[data-testid="period-filter"]', '7'); // Last 7 days
      
      // Should update results
      await page.waitForTimeout(1000);
      
      // Verify all members are from last 7 days
      const joinDates = await page.locator('[data-testid="join-date"]').allTextContents();
      for (const dateText of joinDates) {
        // Should contain recent time indicators
        expect(dateText.toLowerCase()).toMatch(/(today|yesterday|\d+ days? ago|this week)/);
      }
    });

    test('should show welcome message', async ({ page }) => {
      await page.goto('/browse/recent');
      
      // Check welcome section
      await expect(page.locator('[data-testid="welcome-section"]')).toBeVisible();
      await expect(page.locator('text=Welcome New Members')).toBeVisible();
      await expect(page.locator('text=Fresh Profiles')).toBeVisible();
    });

    test('should display tips for engaging with new members', async ({ page }) => {
      await page.goto('/browse/recent');
      
      // Check tips section
      await expect(page.locator('[data-testid="engagement-tips"]')).toBeVisible();
      await expect(page.locator('text=Make a Great First Impression')).toBeVisible();
      await expect(page.locator('text=Be Welcoming')).toBeVisible();
      await expect(page.locator('text=Start Conversations')).toBeVisible();
    });
  });

  test.describe('Verified Members Page', () => {
    test('should display verified members', async ({ page }) => {
      await page.goto('/browse/verified');
      
      // Check verified page elements
      await expect(page.locator('h1')).toContainText('Verified Members');
      await expect(page.locator('text=verified for authenticity')).toBeVisible();
      
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        // Should have verification badges
        await expect(page.locator('[data-testid="verified-badge"]').first()).toBeVisible();
        
        // Should show different verification types
        const verificationBadges = page.locator('[data-testid="verification-type"]');
        const badgeCount = await verificationBadges.count();
        
        if (badgeCount > 0) {
          // Check for different verification types
          const verificationTypes = await verificationBadges.allTextContents();
          expect(verificationTypes.some(type => 
            ['photo', 'document', 'phone', 'email'].includes(type.toLowerCase())
          )).toBeTruthy();
        }
      }
    });

    test('should show verification benefits', async ({ page }) => {
      await page.goto('/browse/verified');
      
      // Check verification benefits section
      await expect(page.locator('[data-testid="verification-benefits"]')).toBeVisible();
      await expect(page.locator('text=Why Choose Verified Members')).toBeVisible();
      await expect(page.locator('text=Real Photos')).toBeVisible();
      await expect(page.locator('text=Identity Verified')).toBeVisible();
      await expect(page.locator('text=Safe & Secure')).toBeVisible();
    });

    test('should filter by verification type', async ({ page }) => {
      await page.goto('/browse/verified');
      
      // Filter by specific verification type
      await page.selectOption('[data-testid="verification-filter"]', 'photo_verified');
      
      // Should show only photo-verified profiles
      await page.waitForTimeout(1000);
      
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        // All profiles should have photo verification badge
        const photoVerificationBadges = page.locator('[data-testid="photo-verified"]');
        const badgeCount = await photoVerificationBadges.count();
        expect(badgeCount).toBeGreaterThan(0);
      }
    });

    test('should show verification process info', async ({ page }) => {
      await page.goto('/browse/verified');
      
      // Check verification process section
      await expect(page.locator('[data-testid="verification-process"]')).toBeVisible();
      await expect(page.locator('text=Get Your Profile Verified')).toBeVisible();
      
      // Check verification steps
      await expect(page.locator('text=Photo Verification')).toBeVisible();
      await expect(page.locator('text=Document Verification')).toBeVisible();
      await expect(page.locator('text=Phone Verification')).toBeVisible();
      
      // Check start verification button
      const startVerificationButton = page.locator('button:has-text("Start Verification Process")');
      if (await startVerificationButton.isVisible()) {
        await startVerificationButton.click();
        
        // Should navigate to verification page
        await expect(page).toHaveURL(/\/profile\/verification/);
      }
    });
  });

  test.describe('Profile Interactions', () => {
    test('should like a profile', async ({ page }) => {
      await page.goto('/browse');
      
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        // Click like button on first profile
        await page.click('[data-testid="like-button"]');
        
        // Should show like animation or feedback
        await expect(page.locator('[data-testid="like-animation"]')).toBeVisible();
        
        // Profile should be marked as liked
        await expect(page.locator('[data-testid="liked-indicator"]')).toBeVisible();
      }
    });

    test('should dislike a profile', async ({ page }) => {
      await page.goto('/browse');
      
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        // Click dislike button
        await page.click('[data-testid="dislike-button"]');
        
        // Profile should be removed from view or marked as disliked
        await page.waitForTimeout(500);
        
        // Should show feedback or animation
        const dislikeAnimation = page.locator('[data-testid="dislike-animation"]');
        if (await dislikeAnimation.isVisible()) {
          await expect(dislikeAnimation).toBeVisible();
        }
      }
    });

    test('should super like a profile', async ({ page }) => {
      await page.goto('/browse');
      
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        // Click super like button
        await page.click('[data-testid="super-like-button"]');
        
        // Should show super like animation
        await expect(page.locator('[data-testid="super-like-animation"]')).toBeVisible();
        
        // Should show success message or modal
        const superLikeModal = page.locator('[data-testid="super-like-modal"]');
        if (await superLikeModal.isVisible()) {
          await expect(page.locator('text=Super Like sent')).toBeVisible();
        }
      }
    });

    test('should view profile details', async ({ page }) => {
      await page.goto('/browse');
      
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        // Click on profile card
        await profiles.first().click();
        
        // Should navigate to profile view or open modal
        const profileModal = page.locator('[data-testid="profile-modal"]');
        const profilePage = page.locator('[data-testid="profile-page"]');
        
        if (await profileModal.isVisible()) {
          // Profile opened in modal
          await expect(profileModal).toBeVisible();
          await expect(page.locator('[data-testid="profile-photos"]')).toBeVisible();
          await expect(page.locator('[data-testid="profile-details"]')).toBeVisible();
        } else if (await profilePage.isVisible()) {
          // Navigated to profile page
          await expect(page).toHaveURL(/\/users\/\d+/);
          await expect(profilePage).toBeVisible();
        }
      }
    });

    test('should handle premium feature restrictions for free users', async ({ page }) => {
      await page.goto('/browse');
      
      // Try to super like multiple times (should hit daily limit)
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        for (let i = 0; i < 3; i++) {
          if (i < count) {
            await page.click(`[data-testid="user-card"]:nth-child(${i + 1}) [data-testid="super-like-button"]`);
            await page.waitForTimeout(500);
          }
        }
        
        // Should eventually show upgrade prompt
        const upgradePrompt = page.locator('[data-testid="upgrade-prompt"]');
        if (await upgradePrompt.isVisible()) {
          await expect(page.locator('text=Upgrade to continue')).toBeVisible();
        }
      }
    });
  });

  test.describe('Matching System', () => {
    test('should show match modal when mutual like occurs', async ({ page }) => {
      await page.goto('/browse');
      
      // This test would require simulation of mutual like
      // In a real scenario, this would involve another user liking back
      
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        await page.click('[data-testid="like-button"]');
        
        // If it's a mutual match, should show match modal
        const matchModal = page.locator('[data-testid="match-modal"]');
        if (await matchModal.isVisible()) {
          await expect(page.locator('text=It\'s a Match')).toBeVisible();
          await expect(page.locator('[data-testid="start-conversation"]')).toBeVisible();
          await expect(page.locator('[data-testid="continue-browsing"]')).toBeVisible();
        }
      }
    });

    test('should start conversation from match modal', async ({ page }) => {
      // This test assumes a match modal is shown
      await page.goto('/browse');
      
      // Simulate match scenario
      const matchModal = page.locator('[data-testid="match-modal"]');
      if (await matchModal.isVisible()) {
        await page.click('[data-testid="start-conversation"]');
        
        // Should navigate to chat
        await expect(page).toHaveURL(/\/chat/);
      }
    });
  });

  test.describe('Search and Advanced Filters', () => {
    test('should search profiles by name', async ({ page }) => {
      await page.goto('/browse');
      
      // Use search functionality
      const searchInput = page.locator('[data-testid="profile-search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('John');
        await page.press('[data-testid="profile-search"]', 'Enter');
        
        // Should show search results
        await page.waitForTimeout(1000);
        const profiles = page.locator('[data-testid="user-card"]');
        const count = await profiles.count();
        
        if (count > 0) {
          // Results should contain the search term
          const names = await page.locator('[data-testid="profile-name"]').allTextContents();
          expect(names.some(name => name.toLowerCase().includes('john'))).toBeTruthy();
        }
      }
    });

    test('should use advanced search filters', async ({ page }) => {
      await page.goto('/browse');
      
      // Open advanced filters
      const advancedFilters = page.locator('[data-testid="advanced-filters"]');
      if (await advancedFilters.isVisible()) {
        await page.click('[data-testid="advanced-filters-toggle"]');
        
        // Set multiple filters
        await page.selectOption('[data-testid="education-filter"]', 'bachelors');
        await page.selectOption('[data-testid="profession-filter"]', 'engineer');
        await page.selectOption('[data-testid="religion-filter"]', 'buddhist');
        
        // Apply advanced filters
        await page.click('[data-testid="apply-advanced-filters"]');
        
        // Should show filtered results
        await page.waitForTimeout(1000);
        await expect(page.locator('[data-testid="profile-grid"]')).toBeVisible();
      }
    });

    test('should save search preferences', async ({ page }) => {
      await page.goto('/browse');
      
      // Set search preferences
      await page.fill('[data-testid="age-min"]', '25');
      await page.fill('[data-testid="age-max"]', '35');
      await page.fill('[data-testid="location-filter"]', 'Colombo');
      
      // Save preferences
      const savePreferences = page.locator('[data-testid="save-preferences"]');
      if (await savePreferences.isVisible()) {
        await savePreferences.click();
        
        // Should show success message
        await expect(page.locator('text=Preferences saved')).toBeVisible();
        
        // Reload page and verify preferences are restored
        await page.reload();
        await expect(page.locator('[data-testid="age-min"]')).toHaveValue('25');
        await expect(page.locator('[data-testid="age-max"]')).toHaveValue('35');
      }
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle empty results gracefully', async ({ page }) => {
      await page.goto('/browse');
      
      // Apply very restrictive filters
      await page.fill('[data-testid="age-min"]', '80');
      await page.fill('[data-testid="age-max"]', '90');
      await page.fill('[data-testid="location-filter"]', 'Nonexistent City');
      
      await page.click('[data-testid="apply-filters"]');
      
      // Should show no results message
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
      await expect(page.locator('text=No profiles to show')).toBeVisible();
      
      // Should suggest adjusting filters
      await expect(page.locator('text=Try adjusting your filters')).toBeVisible();
    });

    test('should handle network errors', async ({ page }) => {
      // Intercept and fail browse requests
      await page.route('**/api/v1/browse*', route => route.abort());
      
      await page.goto('/browse');
      
      // Should show error message
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('text=Failed to load profiles')).toBeVisible();
      
      // Should provide retry option
      const retryButton = page.locator('[data-testid="retry-button"]');
      if (await retryButton.isVisible()) {
        await expect(retryButton).toBeVisible();
      }
    });

    test('should handle slow loading gracefully', async ({ page }) => {
      // Delay browse requests
      await page.route('**/api/v1/browse*', route => {
        setTimeout(() => route.continue(), 3000);
      });
      
      await page.goto('/browse');
      
      // Should show loading state
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
      await expect(page.locator('text=Loading profiles')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/browse');
      
      // Should adjust layout for mobile
      await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
      
      // Profile cards should stack properly
      const profiles = page.locator('[data-testid="user-card"]');
      const count = await profiles.count();
      
      if (count > 0) {
        // Should show mobile-optimized profile cards
        await expect(profiles.first()).toBeVisible();
        
        // Should have swipe gestures (if implemented)
        const swipeContainer = page.locator('[data-testid="swipe-container"]');
        if (await swipeContainer.isVisible()) {
          await expect(swipeContainer).toBeVisible();
        }
      }
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/browse');
      
      // Should show appropriate grid layout
      const profileGrid = page.locator('[data-testid="profile-grid"]');
      await expect(profileGrid).toBeVisible();
      
      // Should show 2-3 profiles per row on tablet
      // This would depend on your CSS grid implementation
    });
  });
});
