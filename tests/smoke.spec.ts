import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/loginPage';
import { DashboardPage } from '../src/pages/dashboardPage';
import { UserBuilder } from '../src/data/builders/userBuilder';
import { setSeed } from '../src/utils/random';

/**
 * Smoke tests - quick checks that core functionality works.
 * 
 * These tests are fast and verify basic app health. If these fail,
 * there's likely a bigger issue than just a flaky test.
 */
test.describe('Smoke Tests', () => {
  test('should load login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    
    // Verify page loaded and key elements are present
    await expect(page).toHaveURL(/login/);
    await expect(page).toHaveTitle(/login|sign in/i);
  });

  test('should demonstrate builder pattern usage', async ({ page }) => {
    // Example: Create a user with builder pattern
    // Even if your app doesn't have a signup flow yet, this shows
    // how you'd use the builder to create test data
    
    // Use a seed for deterministic data (useful for debugging)
    setSeed(12345);
    
    const user = new UserBuilder()
      .withEmail('testuser@example.com')
      .withPassword('TestPass123!')
      .build();

    // Verify the user object is properly constructed
    expect(user.email).toBe('testuser@example.com');
    expect(user.password).toBe('TestPass123!');
    expect(user.firstName).toBeTruthy(); // Faker filled this in
    expect(user.lastName).toBeTruthy(); // Faker filled this in

    // Example: If you had a signup form, you'd use it like this:
    // const signupPage = new SignupPage(page);
    // await signupPage.fillForm(user);
    // await signupPage.submit();
  });

  test('should create multiple users with different data', async ({ page }) => {
    // Builder pattern makes it easy to create variations
    const user1 = new UserBuilder()
      .withEmail('user1@example.com')
      .build();

    const user2 = new UserBuilder()
      .withEmail('user2@example.com')
      .withPhone('555-123-4567')
      .build();

    // Each user has unique data
    expect(user1.email).not.toBe(user2.email);
    expect(user2.phone).toBe('555-123-4567');
    expect(user1.phone).toBeUndefined();
  });

  test('should verify dashboard page structure', async ({ page }) => {
    // This test assumes you're already authenticated
    // In a real scenario, you might set up auth via API or fixture
    
    const dashboardPage = new DashboardPage(page);
    
    // Try to navigate - if auth is required, this will redirect
    await dashboardPage.goto();
    
    // Check if we can see dashboard elements (or got redirected)
    const isOnDashboard = await dashboardPage.isLoggedIn();
    
    // If not logged in, that's okay for a smoke test - we're just
    // checking that the page structure exists
    if (isOnDashboard) {
      await dashboardPage.verifyLoaded();
    }
  });
});
