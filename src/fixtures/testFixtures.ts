import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashboardPage';
import { ApiClient } from '../core/apiClient';

/**
 * Extended test fixtures. This gives us typed access to page objects
 * and API client in tests without manual instantiation.
 * 
 * Usage: import { test } from '../src/fixtures/testFixtures' instead of '@playwright/test'
 */
type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  apiClient: ApiClient;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
});

export { expect } from '@playwright/test';
