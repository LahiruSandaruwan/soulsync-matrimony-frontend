import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - in real tests, you'd log in properly
    await page.goto('/dashboard');
  });

  test('should display dashboard elements', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('.stats-card')).toBeVisible();
    await expect(page.locator('.quick-actions')).toBeVisible();
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.click('text=Profile');
    await expect(page).toHaveURL('/profile');
  });

  test('should navigate to matches page', async ({ page }) => {
    await page.click('text=Matches');
    await expect(page).toHaveURL('/matches');
  });

  test('should navigate to chat page', async ({ page }) => {
    await page.click('text=Messages');
    await expect(page).toHaveURL('/chat');
  });
}); 