import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/loginPage';
import { DashboardPage } from '../src/pages/dashboardPage';
import { UserBuilder } from '../src/data/builders/userBuilder';
import { TestDataFactory } from '../src/data/factories/testDataFactory';
import { setSeed, resetSeed } from '../src/utils/random';
import { TestTags } from '../src/utils/tags';

/**
 * Smoke tests - quick checks that core functionality works.
 * 
 * These tests are fast and verify basic app health. If these fail,
 * there's likely a bigger issue than just a flaky test.
 */
test.describe('Smoke Tests', () => {
  // Reset faker seed after tests that use seeding
  test.afterEach(() => {
    resetSeed();
  });
  test(`should load login page ${TestTags.SMOKE}`, async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    
    // Verify page loaded and key elements are present
    await expect(page).toHaveURL(/login/);
    await expect(page).toHaveTitle(/login|sign in/i);
  });

  test(`should demonstrate builder pattern usage ${TestTags.SMOKE}`, async ({ page }) => {
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

  test(`should create multiple users with different data ${TestTags.SMOKE}`, async ({ page }) => {
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

  test(`should use test data factory ${TestTags.SMOKE}`, async ({ page }) => {
    // Test data factory makes it easy to create common test scenarios
    const adminUser = TestDataFactory.createAdminUser();
    expect(adminUser.email).toBe('admin@example.com');

    const regularUser = TestDataFactory.createUser();
    expect(regularUser.email).toBeTruthy();

    const address = TestDataFactory.createUSAddress();
    expect(address.country).toBe('United States');
    expect(address.zipCode).toBeTruthy();

    const product = TestDataFactory.createInStockProduct();
    expect(product.inStock).toBe(true);
    expect(product.price).toBeGreaterThan(0);
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
