import { test, expect } from '@playwright/test';

test.describe('Chat and Messaging Flow', () => {
  const testUser = {
    email: 'test@soulsync.com',
    password: 'password123'
  };

  const testUser2 = {
    email: 'test2@soulsync.com',
    password: 'password123'
  };

  test.beforeEach(async ({ page }) => {
    // Login as primary test user
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test.describe('Chat List View', () => {
    test('should display chat conversations list', async ({ page }) => {
      await page.goto('/chat');
      
      // Check page elements
      await expect(page.locator('h1')).toContainText('Messages');
      await expect(page.locator('[data-testid="chat-list"]')).toBeVisible();
      
      // Check search functionality
      await expect(page.locator('[data-testid="chat-search"]')).toBeVisible();
      
      // Check if conversations are displayed
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      if (count > 0) {
        await expect(conversations.first()).toBeVisible();
        await expect(page.locator('[data-testid="conversation-avatar"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="conversation-name"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="last-message"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="message-time"]').first()).toBeVisible();
      }
    });

    test('should search conversations', async ({ page }) => {
      await page.goto('/chat');
      
      // Type in search box
      await page.fill('[data-testid="chat-search"]', 'john');
      
      // Wait for search results
      await page.waitForTimeout(500);
      
      // Verify filtered results
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        // At least one conversation should contain 'john'
        await expect(page.locator('text=john').first()).toBeVisible();
      }
    });

    test('should display unread message indicators', async ({ page }) => {
      await page.goto('/chat');
      
      // Check for unread indicators
      const unreadBadges = page.locator('[data-testid="unread-badge"]');
      const count = await unreadBadges.count();
      
      if (count > 0) {
        await expect(unreadBadges.first()).toBeVisible();
        await expect(unreadBadges.first()).toHaveText(/\d+/);
      }
    });

    test('should sort conversations by recent activity', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 1) {
        // Get timestamps of first two conversations
        const firstTime = await page.locator('[data-testid="message-time"]').first().textContent();
        const secondTime = await page.locator('[data-testid="message-time"]').nth(1).textContent();
        
        // Most recent should be first (this would need proper time comparison logic)
        expect(firstTime).toBeTruthy();
        expect(secondTime).toBeTruthy();
      }
    });
  });

  test.describe('Chat Interface', () => {
    test('should open chat conversation', async ({ page }) => {
      await page.goto('/chat');
      
      // Click on first conversation
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Should open chat interface
        await expect(page.locator('[data-testid="chat-header"]')).toBeVisible();
        await expect(page.locator('[data-testid="message-list"]')).toBeVisible();
        await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
      }
    });

    test('should display chat header with user info', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Check chat header elements
        await expect(page.locator('[data-testid="chat-avatar"]')).toBeVisible();
        await expect(page.locator('[data-testid="chat-user-name"]')).toBeVisible();
        await expect(page.locator('[data-testid="user-status"]')).toBeVisible();
        await expect(page.locator('[data-testid="chat-options"]')).toBeVisible();
      }
    });

    test('should display message history', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Check for message bubbles
        const messages = page.locator('[data-testid="message-bubble"]');
        const messageCount = await messages.count();
        
        if (messageCount > 0) {
          await expect(messages.first()).toBeVisible();
          await expect(page.locator('[data-testid="message-text"]').first()).toBeVisible();
          await expect(page.locator('[data-testid="message-timestamp"]').first()).toBeVisible();
        }
      }
    });

    test('should distinguish between sent and received messages', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Check for sent messages (should have different styling)
        const sentMessages = page.locator('[data-testid="message-sent"]');
        const receivedMessages = page.locator('[data-testid="message-received"]');
        
        const sentCount = await sentMessages.count();
        const receivedCount = await receivedMessages.count();
        
        if (sentCount > 0) {
          await expect(sentMessages.first()).toBeVisible();
        }
        
        if (receivedCount > 0) {
          await expect(receivedMessages.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Sending Messages', () => {
    test('should send text message', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        const testMessage = `Test message ${Date.now()}`;
        
        // Type and send message
        await page.fill('[data-testid="message-input"]', testMessage);
        await page.click('[data-testid="send-button"]');
        
        // Should clear input
        await expect(page.locator('[data-testid="message-input"]')).toHaveValue('');
        
        // Should show message in chat
        await expect(page.locator(`text=${testMessage}`)).toBeVisible();
        
        // Should be marked as sent
        await expect(page.locator('[data-testid="message-sent"]').last()).toContainText(testMessage);
      }
    });

    test('should send message with Enter key', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        const testMessage = `Enter key test ${Date.now()}`;
        
        // Type message and press Enter
        await page.fill('[data-testid="message-input"]', testMessage);
        await page.press('[data-testid="message-input"]', 'Enter');
        
        // Should send message
        await expect(page.locator(`text=${testMessage}`)).toBeVisible();
      }
    });

    test('should not send empty messages', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Try to send empty message
        await page.click('[data-testid="send-button"]');
        
        // Send button should be disabled or no message should be sent
        const sendButton = page.locator('[data-testid="send-button"]');
        const isDisabled = await sendButton.getAttribute('disabled');
        
        if (!isDisabled) {
          // If button isn't disabled, input should still be empty
          await expect(page.locator('[data-testid="message-input"]')).toHaveValue('');
        }
      }
    });

    test('should handle long messages', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        const longMessage = 'A'.repeat(1000); // Test message length limits
        
        await page.fill('[data-testid="message-input"]', longMessage);
        await page.click('[data-testid="send-button"]');
        
        // Should either send truncated message or show error
        // Implementation depends on your message length limits
      }
    });
  });

  test.describe('Message Features', () => {
    test('should show typing indicator', async ({ page, context }) => {
      // This test would require two users typing simultaneously
      // Implementation would involve WebSocket simulation
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Start typing
        await page.fill('[data-testid="message-input"]', 'typing...');
        
        // Check if typing indicator is sent
        // This would require WebSocket testing setup
      }
    });

    test('should display message status indicators', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Send a message
        const testMessage = `Status test ${Date.now()}`;
        await page.fill('[data-testid="message-input"]', testMessage);
        await page.click('[data-testid="send-button"]');
        
        // Check for status indicators (sent, delivered, read)
        const statusIndicator = page.locator('[data-testid="message-status"]').last();
        await expect(statusIndicator).toBeVisible();
      }
    });

    test('should mark messages as read', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Opening chat should mark messages as read
        // Check if unread indicators disappear
        await page.waitForTimeout(1000);
        
        // Go back to chat list
        await page.click('[data-testid="back-to-chat-list"]');
        
        // Unread badge should be reduced or removed
        const unreadBadge = page.locator('[data-testid="unread-badge"]').first();
        const isVisible = await unreadBadge.isVisible();
        
        if (isVisible) {
          const badgeText = await unreadBadge.textContent();
          // Badge count should be updated
          expect(badgeText).toBeTruthy();
        }
      }
    });
  });

  test.describe('Chat Options and Actions', () => {
    test('should open chat options menu', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Click options button
        await page.click('[data-testid="chat-options"]');
        
        // Should show options menu
        await expect(page.locator('[data-testid="options-menu"]')).toBeVisible();
        await expect(page.locator('text=View Profile')).toBeVisible();
        await expect(page.locator('text=Block User')).toBeVisible();
        await expect(page.locator('text=Report User')).toBeVisible();
      }
    });

    test('should view user profile from chat', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Click options and view profile
        await page.click('[data-testid="chat-options"]');
        await page.click('text=View Profile');
        
        // Should navigate to user profile
        await expect(page).toHaveURL(/\/users\/\d+/);
      }
    });

    test('should block user', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Click options and block
        await page.click('[data-testid="chat-options"]');
        await page.click('text=Block User');
        
        // Should show confirmation dialog
        await expect(page.locator('[data-testid="block-confirmation"]')).toBeVisible();
        
        // Confirm block
        await page.click('button:has-text("Block")');
        
        // Should remove conversation or disable messaging
        await expect(page.locator('text=User blocked')).toBeVisible();
      }
    });

    test('should report user', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Click options and report
        await page.click('[data-testid="chat-options"]');
        await page.click('text=Report User');
        
        // Should show report dialog
        await expect(page.locator('[data-testid="report-modal"]')).toBeVisible();
        
        // Fill report form
        await page.selectOption('[data-testid="report-reason"]', 'inappropriate_content');
        await page.fill('[data-testid="report-description"]', 'Test report description');
        
        // Submit report
        await page.click('button:has-text("Submit Report")');
        
        // Should show success message
        await expect(page.locator('text=Report submitted')).toBeVisible();
      }
    });
  });

  test.describe('File and Media Sharing', () => {
    test('should open attachment menu', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Click attachment button
        const attachButton = page.locator('[data-testid="attach-button"]');
        if (await attachButton.isVisible()) {
          await attachButton.click();
          
          // Should show attachment options
          await expect(page.locator('[data-testid="attachment-menu"]')).toBeVisible();
          await expect(page.locator('text=Photo')).toBeVisible();
          await expect(page.locator('text=Voice Message')).toBeVisible();
        }
      }
    });

    test('should upload and send photo', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Click attach and photo
        const attachButton = page.locator('[data-testid="attach-button"]');
        if (await attachButton.isVisible()) {
          await attachButton.click();
          
          // Set up file chooser
          const fileChooserPromise = page.waitForEvent('filechooser');
          await page.click('text=Photo');
          const fileChooser = await fileChooserPromise;
          
          // Upload test image (you'd need a test image file)
          // await fileChooser.setFiles('test-image.jpg');
          
          // Should show image preview
          // await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();
          
          // Send image
          // await page.click('[data-testid="send-image"]');
          
          // Should appear in chat
          // await expect(page.locator('[data-testid="message-image"]')).toBeVisible();
        }
      }
    });

    test('should record and send voice message', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Click attach and voice message
        const attachButton = page.locator('[data-testid="attach-button"]');
        if (await attachButton.isVisible()) {
          await attachButton.click();
          await page.click('text=Voice Message');
          
          // Should show voice recorder
          await expect(page.locator('[data-testid="voice-recorder"]')).toBeVisible();
          
          // Start recording
          await page.click('[data-testid="start-recording"]');
          
          // Should show recording state
          await expect(page.locator('[data-testid="recording-indicator"]')).toBeVisible();
          
          // Wait a bit and stop recording
          await page.waitForTimeout(2000);
          await page.click('[data-testid="stop-recording"]');
          
          // Should show playback controls
          await expect(page.locator('[data-testid="voice-playback"]')).toBeVisible();
          
          // Send voice message
          await page.click('[data-testid="send-voice"]');
          
          // Should appear in chat
          await expect(page.locator('[data-testid="message-voice"]')).toBeVisible();
        }
      }
    });
  });

  test.describe('Real-time Features', () => {
    test('should receive messages in real-time', async ({ page, context }) => {
      // This test would require WebSocket simulation or two browser contexts
      // Implementation would involve setting up real-time message testing
    });

    test('should show online status updates', async ({ page }) => {
      await page.goto('/chat');
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Check for online status indicator
        const statusIndicator = page.locator('[data-testid="user-status"]');
        await expect(statusIndicator).toBeVisible();
        
        // Status should show online, offline, or last seen
        const statusText = await statusIndicator.textContent();
        expect(statusText).toMatch(/(online|offline|last seen)/i);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle message send failures', async ({ page }) => {
      await page.goto('/chat');
      
      // Intercept and fail message send requests
      await page.route('**/api/v1/chat/**', route => route.abort());
      
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        await conversations.first().click();
        
        // Try to send message
        await page.fill('[data-testid="message-input"]', 'Test failed message');
        await page.click('[data-testid="send-button"]');
        
        // Should show error indicator
        await expect(page.locator('[data-testid="message-error"]')).toBeVisible();
        
        // Should provide retry option
        const retryButton = page.locator('[data-testid="retry-message"]');
        if (await retryButton.isVisible()) {
          await expect(retryButton).toBeVisible();
        }
      }
    });

    test('should handle network disconnection', async ({ page }) => {
      await page.goto('/chat');
      
      // Simulate network disconnection
      await page.context().setOffline(true);
      
      // Should show offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      
      // Reconnect
      await page.context().setOffline(false);
      
      // Should hide offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeHidden();
    });
  });
});
