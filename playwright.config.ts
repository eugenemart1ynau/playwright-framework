import { defineConfig, devices } from '@playwright/test';
import { getBaseUrl } from './src/config/env';

/**
 * Playwright configuration. We pull baseURL from our env config
 * so it switches automatically based on ENV variable.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'], // Console output
    // Uncomment for Allure reporting (requires @playwright/test-reporter-allure)
    // ['allure-playwright'],
  ],
  
  use: {
    baseURL: getBaseUrl(),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure', // Keep videos of failed tests for debugging
    // We keep this timeout reasonable - if tests need more, they can override
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Global setup/teardown hooks
  // Uncomment these if you want to authenticate once and reuse auth state
  // globalSetup: require.resolve('./src/setup/global-setup.ts'),
  // globalTeardown: require.resolve('./src/setup/global-teardown.ts'),

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment if you want to run on multiple browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // Mobile testing examples
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
});
