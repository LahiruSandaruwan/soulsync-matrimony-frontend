import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('.text-red-500')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('text=Don\'t have an account?');
    await expect(page).toHaveURL('/auth/register');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.click('text=Forgot Password?');
    await expect(page).toHaveURL('/auth/forgot-password');
  });
}); 