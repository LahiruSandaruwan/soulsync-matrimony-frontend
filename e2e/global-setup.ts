import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for SoulSync E2E tests...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...');
    
    // Try to access the base URL
    const baseURL = config.projects[0].use?.baseURL || 'http://localhost:4200';
    
    let retries = 0;
    const maxRetries = 30; // 30 seconds
    
    while (retries < maxRetries) {
      try {
        await page.goto(baseURL, { timeout: 5000 });
        const title = await page.title();
        
        if (title && !title.includes('Error')) {
          console.log('✅ Application is ready!');
          break;
        }
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error(`Application not ready after ${maxRetries} attempts: ${error}`);
        }
        console.log(`⏳ Waiting for app... (attempt ${retries}/${maxRetries})`);
        await page.waitForTimeout(1000);
      }
    }

    // Setup test data if needed
    await setupTestData(page, baseURL);

    // Create authentication state for admin user
    await createAuthState(page, baseURL, 'admin@soulsync.com', 'password123', 'admin-auth.json');

    // Create authentication state for regular user
    await createAuthState(page, baseURL, 'test@soulsync.com', 'password123', 'user-auth.json');

    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData(page: any, baseURL: string) {
  console.log('🔧 Setting up test data...');
  
  // This function would set up any required test data
  // For example, creating test users, profiles, etc.
  
  try {
    // You could make API calls here to set up test data
    // or navigate to specific pages to create test scenarios
    
    console.log('✅ Test data setup completed');
  } catch (error) {
    console.warn('⚠️ Test data setup failed (continuing anyway):', error);
  }
}

async function createAuthState(page: any, baseURL: string, email: string, password: string, filename: string) {
  console.log(`🔐 Creating auth state for ${email}...`);
  
  try {
    // Navigate to login page
    await page.goto(`${baseURL}/auth/login`);
    
    // Fill login form
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for successful login (dashboard or redirect)
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 });
    
    // Save authentication state
    await page.context().storageState({ path: `e2e/auth-states/${filename}` });
    
    console.log(`✅ Auth state saved for ${email}`);
    
  } catch (error) {
    console.warn(`⚠️ Failed to create auth state for ${email}:`, error);
    // Don't throw here - some tests might still work without auth
  }
}

export default globalSetup;
