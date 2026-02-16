import { expect, Page } from '@playwright/test';
import { logger } from './logger';

/**
 * Custom assertion helpers.
 * 
 * Domain-specific assertions that make tests more readable
 * and provide better error messages.
 */

/**
 * Assert that element contains text (case-insensitive, partial match).
 * More forgiving than exact text matching.
 */
export const assertContainsText = async (
  locator: ReturnType<Page['locator']>,
  expectedText: string
): Promise<void> => {
  const actualText = await locator.textContent();
  const contains = actualText?.toLowerCase().includes(expectedText.toLowerCase());

  if (!contains) {
    throw new Error(
      `Expected element to contain "${expectedText}" but got "${actualText}"`
    );
  }
};

/**
 * Assert that URL matches pattern (with helpful error message).
 */
export const assertUrlMatches = async (
  page: Page,
  pattern: string | RegExp,
  description?: string
): Promise<void> => {
  const url = page.url();
  const matches = typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url);

  if (!matches) {
    const desc = description ? ` (${description})` : '';
    throw new Error(`Expected URL to match pattern${desc}, but got: ${url}`);
  }
};

/**
 * Assert that element is visible and enabled.
 * Common pattern that's worth extracting.
 */
export const assertElementReady = async (
  locator: ReturnType<Page['locator']>,
  timeout = 10000
): Promise<void> => {
  await expect(locator).toBeVisible({ timeout });
  await expect(locator).toBeEnabled({ timeout });
};

/**
 * Assert that form field has value.
 * Useful for form testing.
 */
export const assertFieldValue = async (
  locator: ReturnType<Page['locator']>,
  expectedValue: string
): Promise<void> => {
  const actualValue = await locator.inputValue();
  expect(actualValue).toBe(expectedValue);
};

/**
 * Assert that element count matches expected.
 * Useful for lists, tables, etc.
 */
export const assertElementCount = async (
  locator: ReturnType<Page['locator']>,
  expectedCount: number
): Promise<void> => {
  const count = await locator.count();
  expect(count).toBe(expectedCount);
};

/**
 * Assert that API response is successful.
 * Wrapper around API client expectSuccess for use in tests.
 */
export const assertApiSuccess = async (response: { ok: () => boolean; status: () => number }): Promise<void> => {
  if (!response.ok()) {
    throw new Error(`API request failed with status ${response.status()}`);
  }
};

/**
 * Assert that page loaded within acceptable time.
 * Useful for performance testing.
 */
export const assertPageLoadTime = async (
  page: Page,
  maxLoadTimeMs: number
): Promise<void> => {
  const loadTime = await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const perf = (performance as any).getEntriesByType('navigation')[0] as any;
    return perf.loadEventEnd - perf.fetchStart;
  });

  if (loadTime > maxLoadTimeMs) {
    throw new Error(
      `Page load time ${loadTime}ms exceeds maximum ${maxLoadTimeMs}ms`
    );
  }

  logger.debug(`Page loaded in ${loadTime}ms (max: ${maxLoadTimeMs}ms)`);
};
