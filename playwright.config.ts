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
  reporter: 'html',
  
  use: {
    baseURL: getBaseUrl(),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // We keep this timeout reasonable - if tests need more, they can override
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

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
  ],
});
