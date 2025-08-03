import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('token', 'test-token');
    });
    
    await page.goto('http://localhost:4200/dashboard');
  });

  test('should display user dashboard', async ({ page }) => {
    // Mock dashboard data
    await page.route('**/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          profile_completion: 85
        })
      });
    });

    await page.route('**/profile/matches', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Alice Johnson',
            photo: 'alice.jpg',
            compatibility: 85,
            matched_at: new Date().toISOString()
          }
        ])
      });
    });

    await page.route('**/profile/views', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            viewer: 'Bob Wilson',
            photo: 'bob.jpg',
            viewed_at: new Date().toISOString()
          }
        ])
      });
    });

    await page.route('**/matches/suggestions', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Carol Davis',
            photo: 'carol.jpg',
            compatibility: 78,
            age: 28,
            location: 'New York'
          }
        ])
      });
    });

    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('.stats-section')).toBeVisible();
    await expect(page.locator('.recent-matches')).toBeVisible();
    await expect(page.locator('.recent-views')).toBeVisible();
    await expect(page.locator('.suggestions')).toBeVisible();
  });

  test('should display user statistics', async ({ page }) => {
    // Mock stats data
    await page.route('**/profile/stats', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profile_completion: 85,
          total_matches: 25,
          total_views: 150,
          total_likes: 45,
          total_messages: 120
        })
      });
    });

    await expect(page.locator('.stats-card')).toHaveCount(5);
    await expect(page.locator('.stats-card').nth(0)).toContainText('85%');
    await expect(page.locator('.stats-card').nth(1)).toContainText('25');
    await expect(page.locator('.stats-card').nth(2)).toContainText('150');
  });

  test('should display recent matches', async ({ page }) => {
    // Mock matches data
    await page.route('**/profile/matches', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Alice Johnson',
            photo: 'alice.jpg',
            compatibility: 85,
            matched_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Bob Wilson',
            photo: 'bob.jpg',
            compatibility: 78,
            matched_at: new Date().toISOString()
          }
        ])
      });
    });

    await expect(page.locator('.match-item')).toHaveCount(2);
    await expect(page.locator('.match-item').nth(0)).toContainText('Alice Johnson');
    await expect(page.locator('.match-item').nth(1)).toContainText('Bob Wilson');
  });

  test('should display recent profile views', async ({ page }) => {
    // Mock views data
    await page.route('**/profile/views', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            viewer: 'Alice Johnson',
            photo: 'alice.jpg',
            viewed_at: new Date().toISOString()
          },
          {
            id: 2,
            viewer: 'Bob Wilson',
            photo: 'bob.jpg',
            viewed_at: new Date().toISOString()
          }
        ])
      });
    });

    await expect(page.locator('.view-item')).toHaveCount(2);
    await expect(page.locator('.view-item').nth(0)).toContainText('Alice Johnson');
    await expect(page.locator('.view-item').nth(1)).toContainText('Bob Wilson');
  });

  test('should display match suggestions', async ({ page }) => {
    // Mock suggestions data
    await page.route('**/matches/suggestions', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Carol Davis',
            photo: 'carol.jpg',
            compatibility: 78,
            age: 28,
            location: 'New York'
          },
          {
            id: 2,
            name: 'David Brown',
            photo: 'david.jpg',
            compatibility: 82,
            age: 30,
            location: 'Los Angeles'
          }
        ])
      });
    });

    await expect(page.locator('.suggestion-item')).toHaveCount(2);
    await expect(page.locator('.suggestion-item').nth(0)).toContainText('Carol Davis');
    await expect(page.locator('.suggestion-item').nth(1)).toContainText('David Brown');
  });

  test('should handle view profile action', async ({ page }) => {
    // Mock matches data
    await page.route('**/profile/matches', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Alice Johnson',
            photo: 'alice.jpg',
            compatibility: 85,
            matched_at: new Date().toISOString()
          }
        ])
      });
    });

    // Click view profile button
    await page.click('.match-item .view-profile-btn');
    
    // Should navigate to profile page
    await expect(page).toHaveURL(/.*\/profile\/1/);
  });

  test('should handle send message action', async ({ page }) => {
    // Mock matches data
    await page.route('**/profile/matches', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Alice Johnson',
            photo: 'alice.jpg',
            compatibility: 85,
            matched_at: new Date().toISOString()
          }
        ])
      });
    });

    // Click send message button
    await page.click('.match-item .send-message-btn');
    
    // Should navigate to chat page
    await expect(page).toHaveURL(/.*\/chat\/1/);
  });

  test('should handle like profile action', async ({ page }) => {
    // Mock suggestions data
    await page.route('**/matches/suggestions', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Carol Davis',
            photo: 'carol.jpg',
            compatibility: 78,
            age: 28,
            location: 'New York'
          }
        ])
      });
    });

    // Mock like response
    await page.route('**/matches/1/like', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Profile liked successfully'
        })
      });
    });

    // Click like button
    await page.click('.suggestion-item .like-btn');
    
    // Should show success message
    await expect(page.locator('.success-message')).toContainText('Profile liked successfully');
  });

  test('should handle refresh data', async ({ page }) => {
    // Mock dashboard data
    await page.route('**/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          profile_completion: 85
        })
      });
    });

    // Click refresh button
    await page.click('.refresh-btn');
    
    // Should reload data
    await expect(page.locator('.loading-spinner')).toBeVisible();
  });

  test('should handle quick actions', async ({ page }) => {
    // Mock dashboard data
    await page.route('**/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          profile_completion: 85
        })
      });
    });

    // Test edit profile quick action
    await page.click('.quick-action[data-action="edit-profile"]');
    await expect(page).toHaveURL(/.*\/profile\/edit/);

    // Go back to dashboard
    await page.goto('http://localhost:4200/dashboard');

    // Test view matches quick action
    await page.click('.quick-action[data-action="view-matches"]');
    await expect(page).toHaveURL(/.*\/matches/);

    // Go back to dashboard
    await page.goto('http://localhost:4200/dashboard');

    // Test start chat quick action
    await page.click('.quick-action[data-action="start-chat"]');
    await expect(page).toHaveURL(/.*\/chat/);
  });

  test('should handle loading state', async ({ page }) => {
    // Mock slow response
    await page.route('**/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          profile_completion: 85
        })
      }, { delay: 2000 });
    });

    await expect(page.locator('.loading-spinner')).toBeVisible();
  });

  test('should handle error state', async ({ page }) => {
    // Mock error response
    await page.route('**/profile', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Internal server error'
        })
      });
    });

    await expect(page.locator('.error-message')).toContainText('Internal server error');
  });

  test('should handle empty states', async ({ page }) => {
    // Mock empty data
    await page.route('**/profile/matches', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.route('**/profile/views', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.route('**/matches/suggestions', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state')).toContainText('No matches yet');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Mock dashboard data
    await page.route('**/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          profile_completion: 85
        })
      });
    });

    await expect(page.locator('.dashboard-container')).toBeVisible();
    await expect(page.locator('.stats-section')).toBeVisible();
    await expect(page.locator('.recent-matches')).toBeVisible();
  });
}); 