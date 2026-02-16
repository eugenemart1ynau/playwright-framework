import { Page, BrowserContext } from '@playwright/test';
import { logger } from './logger';

/**
 * Authentication helpers. These make it easier to handle auth state
 * across tests - save tokens, restore sessions, etc.
 */

/**
 * Save authentication state (cookies, localStorage) to a file.
 * Useful for reusing auth across tests without logging in every time.
 */
export const saveAuthState = async (
  context: BrowserContext,
  filePath: string = 'playwright/.auth/user.json'
): Promise<void> => {
  await context.storageState({ path: filePath });
  logger.info(`Saved auth state to ${filePath}`);
};

/**
 * Load authentication state from a file.
 * Use this in your Playwright config or test setup to restore a session.
 */
export const loadAuthState = async (
  context: BrowserContext,
  filePath: string = 'playwright/.auth/user.json'
): Promise<void> => {
  // This is typically done via storageState in Playwright config
  // But we provide this helper for programmatic use
  logger.info(`Loading auth state from ${filePath}`);
};

/**
 * Get authentication token from localStorage or cookies.
 * Useful when you need the raw token for API calls.
 */
export const getAuthToken = async (page: Page): Promise<string | null> => {
  // Try localStorage first (common for JWT tokens)
  // Code inside evaluate() runs in browser context where localStorage exists
  const token = await page.evaluate(() => {
    // @ts-expect-error - browser APIs available in evaluate context
    const storage = window.localStorage || window.sessionStorage;
    return (
      storage?.getItem('token') ||
      storage?.getItem('authToken') ||
      storage?.getItem('accessToken') ||
      // @ts-expect-error - browser APIs available in evaluate context
      window.sessionStorage?.getItem('token')
    );
  });

  if (token) {
    return token;
  }

  // Fall back to cookies
  const cookies = await page.context().cookies();
  const authCookie = cookies.find(
    (cookie) =>
      cookie.name.includes('token') ||
      cookie.name.includes('auth') ||
      cookie.name.includes('session')
  );

  return authCookie?.value || null;
};

/**
 * Set authentication token in localStorage.
 * Useful for bypassing login UI when you already have a token.
 */
export const setAuthToken = async (
  page: Page,
  token: string,
  key: string = 'token'
): Promise<void> => {
  await page.evaluate(
    ({ token, key }) => {
      // @ts-expect-error - browser APIs available in evaluate context
      window.localStorage.setItem(key, token);
    },
    { token, key }
  );
  logger.debug(`Set auth token in localStorage: ${key}`);
};

/**
 * Clear all authentication state (cookies, localStorage, sessionStorage).
 * Useful for logout or test cleanup.
 */
export const clearAuthState = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    // @ts-expect-error - browser APIs available in evaluate context
    window.localStorage?.clear();
    // @ts-expect-error - browser APIs available in evaluate context
    window.sessionStorage?.clear();
  });

  await page.context().clearCookies();
  logger.debug('Cleared all auth state');
};
