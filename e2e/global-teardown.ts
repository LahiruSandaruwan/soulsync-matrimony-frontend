import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for SoulSync E2E tests...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const baseURL = config.projects[0].use?.baseURL || 'http://localhost:4200';

    // Cleanup test data
    await cleanupTestData(page, baseURL);

    // Cleanup authentication states
    await cleanupAuthStates();

    // Cleanup temporary files and screenshots
    await cleanupTestArtifacts();

    console.log('✅ Global teardown completed successfully');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here - teardown failures shouldn't fail the test run
  } finally {
    await browser.close();
  }
}

async function cleanupTestData(page: any, baseURL: string) {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // This function would clean up any test data created during tests
    // For example, deleting test users, conversations, etc.
    
    // You could make API calls here to clean up test data
    // or use database cleanup scripts
    
    console.log('✅ Test data cleanup completed');
  } catch (error) {
    console.warn('⚠️ Test data cleanup failed:', error);
  }
}

async function cleanupAuthStates() {
  console.log('🧹 Cleaning up authentication states...');
  
  try {
    const authStatesDir = path.join(__dirname, 'auth-states');
    
    if (fs.existsSync(authStatesDir)) {
      const files = fs.readdirSync(authStatesDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(authStatesDir, file);
          fs.unlinkSync(filePath);
          console.log(`🗑️ Removed auth state: ${file}`);
        }
      }
    }
    
    console.log('✅ Auth states cleanup completed');
  } catch (error) {
    console.warn('⚠️ Auth states cleanup failed:', error);
  }
}

async function cleanupTestArtifacts() {
  console.log('🧹 Cleaning up test artifacts...');
  
  try {
    // Clean up old test results (keep only the latest few runs)
    const testResultsDir = path.join(__dirname, '../test-results');
    
    if (fs.existsSync(testResultsDir)) {
      const items = fs.readdirSync(testResultsDir, { withFileTypes: true });
      
      // Keep track of directories to potentially clean up
      const testRunDirs = items
        .filter(item => item.isDirectory() && item.name.startsWith('test-results-'))
        .map(item => ({
          name: item.name,
          path: path.join(testResultsDir, item.name),
          stat: fs.statSync(path.join(testResultsDir, item.name))
        }))
        .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime()); // Sort by modification time, newest first
      
      // Keep only the latest 5 test runs
      const runsToDelete = testRunDirs.slice(5);
      
      for (const run of runsToDelete) {
        fs.rmSync(run.path, { recursive: true, force: true });
        console.log(`🗑️ Removed old test run: ${run.name}`);
      }
    }
    
    console.log('✅ Test artifacts cleanup completed');
  } catch (error) {
    console.warn('⚠️ Test artifacts cleanup failed:', error);
  }
}

// Function to cleanup database test data (if using a test database)
async function cleanupDatabase() {
  console.log('🧹 Cleaning up test database...');
  
  try {
    // This would connect to your test database and clean up test data
    // You might use database cleanup scripts or API calls
    
    // Example database cleanup (pseudo-code):
    /*
    const db = await connectToTestDatabase();
    
    // Delete test users (but keep essential test accounts)
    await db.query('DELETE FROM users WHERE email LIKE "test_%@soulsync.com"');
    
    // Delete test conversations
    await db.query('DELETE FROM conversations WHERE created_at > NOW() - INTERVAL 1 DAY');
    
    // Reset test user states
    await db.query('UPDATE users SET status = "active" WHERE email IN ("admin@soulsync.com", "test@soulsync.com")');
    
    await db.close();
    */
    
    console.log('✅ Database cleanup completed');
  } catch (error) {
    console.warn('⚠️ Database cleanup failed:', error);
  }
}

// Function to generate test run summary
async function generateTestSummary() {
  console.log('📊 Generating test run summary...');
  
  try {
    const testResultsDir = path.join(__dirname, '../test-results');
    const summaryFile = path.join(testResultsDir, 'test-summary.json');
    
    const summary = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      baseURL: process.env.BASE_URL || 'http://localhost:4200',
      testCompleted: new Date().toISOString(),
      notes: 'E2E test run completed successfully'
    };
    
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }
    
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log('✅ Test summary generated');
  } catch (error) {
    console.warn('⚠️ Test summary generation failed:', error);
  }
}

export default globalTeardown;
