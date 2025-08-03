import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/login');
    
    await expect(page.locator('h1')).toContainText('Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/register');
    
    await expect(page.locator('h1')).toContainText('Register');
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/login');
    
    // Click on register link
    await page.click('text=Don\'t have an account?');
    await expect(page).toHaveURL(/.*\/auth\/register/);
    
    // Click on login link
    await page.click('text=Already have an account?');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/login');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should show validation errors for empty register form', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/register');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/login');
    
    // Enter invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Check for email validation error
    await expect(page.locator('.error-message')).toContainText('Please enter a valid email');
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/register');
    
    // Enter short password
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'Doe');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    
    // Check for password validation error
    await expect(page.locator('.error-message')).toContainText('Password must be at least 8 characters');
  });

  test('should show validation error for password mismatch', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/register');
    
    // Enter mismatched passwords
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'Doe');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[name="password_confirmation"]', 'password456');
    await page.click('button[type="submit"]');
    
    // Check for password mismatch error
    await expect(page.locator('.error-message')).toContainText('Passwords do not match');
  });

  test('should show forgot password page', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/login');
    
    // Click on forgot password link
    await page.click('text=Forgot Password?');
    await expect(page).toHaveURL(/.*\/auth\/forgot-password/);
    await expect(page.locator('h1')).toContainText('Forgot Password');
  });

  test('should show reset password page', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/reset-password?token=test-token');
    
    await expect(page.locator('h1')).toContainText('Reset Password');
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('input[name="password_confirmation"]')).toBeVisible();
  });

  test('should handle successful login', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/login');
    
    // Mock successful login response
    await page.route('**/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'test-token',
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User'
          }
        })
      });
    });
    
    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should handle successful registration', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/register');
    
    // Mock successful registration response
    await page.route('**/auth/register', route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'User registered successfully'
        })
      });
    });
    
    // Fill registration form
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'Doe');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[name="password_confirmation"]', 'password123');
    await page.fill('input[name="date_of_birth"]', '1990-01-01');
    await page.selectOption('select[name="gender"]', 'male');
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('.success-message')).toContainText('Registration successful');
  });

  test('should handle login error', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/login');
    
    // Mock login error response
    await page.route('**/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Invalid credentials'
        })
      });
    });
    
    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });

  test('should handle registration error', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/register');
    
    // Mock registration error response
    await page.route('**/auth/register', route => {
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Email already exists'
        })
      });
    });
    
    // Fill registration form
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'Doe');
    await page.fill('input[type="email"]', 'existing@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[name="password_confirmation"]', 'password123');
    await page.fill('input[name="date_of_birth"]', '1990-01-01');
    await page.selectOption('select[name="gender"]', 'male');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('.error-message')).toContainText('Email already exists');
  });

  test('should handle forgot password', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/forgot-password');
    
    // Mock forgot password response
    await page.route('**/auth/forgot-password', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Password reset email sent'
        })
      });
    });
    
    // Fill email
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('.success-message')).toContainText('Password reset email sent');
  });

  test('should handle password reset', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/reset-password?token=test-token');
    
    // Mock password reset response
    await page.route('**/auth/reset-password', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Password reset successfully'
        })
      });
    });
    
    // Fill new password
    await page.fill('input[type="password"]', 'newpassword123');
    await page.fill('input[name="password_confirmation"]', 'newpassword123');
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('.success-message')).toContainText('Password reset successfully');
  });
}); 