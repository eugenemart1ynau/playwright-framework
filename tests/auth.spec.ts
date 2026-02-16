import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/loginPage';
import { DashboardPage } from '../src/pages/dashboardPage';
import { getCredentials } from '../src/config/env';

/**
 * Authentication tests. These verify the login flow works correctly.
 * 
 * We use credentials from environment variables if available, otherwise
 * you'll need to adjust these tests for your specific auth setup.
 */
test.describe('Authentication', () => {
  // Clean up after each test - logout if we're logged in
  test.afterEach(async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    if (await dashboardPage.isLoggedIn()) {
      try {
        await dashboardPage.logout();
      } catch {
        // If logout fails, that's okay - test might have already logged out
      }
    }
  });
  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();

    // Get credentials from env or use defaults
    const creds = getCredentials();
    if (!creds) {
      test.skip();
      return;
    }

    await loginPage.login(creds.username, creds.password);

    // Verify we're on the dashboard
    await dashboardPage.verifyLoaded();
    expect(await dashboardPage.isLoggedIn()).toBe(true);
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // Check that error message appears
    const hasError = await loginPage.hasErrorMessage();
    expect(hasError).toBe(true);

    // Verify we're still on login page (didn't navigate)
    await expect(page).toHaveURL(/login/);
  });

  test('should handle empty credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    
    // Try to login with empty fields
    await loginPage.login('', '');

    // Should either show validation error or stay on login page
    const hasError = await loginPage.hasErrorMessage();
    await expect(page).toHaveURL(/login/);
  });
});
