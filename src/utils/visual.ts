import { Page, expect } from '@playwright/test';
import { logger } from './logger';

/**
 * Visual regression testing helpers.
 * 
 * These utilities help with screenshot comparison for visual testing.
 * For production use, consider @playwright/test's built-in screenshot
 * comparison or tools like Percy, but these helpers provide a starting point.
 */

/**
 * Take a full page screenshot and compare it to a baseline.
 * 
 * @param page - The Playwright page object
 * @param name - Unique name for this screenshot (used as filename)
 * @param threshold - Pixel difference threshold (0-1, default 0.2)
 * 
 * @example
 * await compareScreenshot(page, 'login-page', 0.1);
 */
export const compareScreenshot = async (
  page: Page,
  name: string,
  threshold: number = 0.2
): Promise<void> => {
  // Playwright's built-in screenshot comparison
  await expect(page).toHaveScreenshot(`${name}.png`, {
    threshold,
    maxDiffPixels: 100,
  });
  logger.debug(`Screenshot comparison passed: ${name}`);
};

/**
 * Take a screenshot of a specific element.
 * Useful for component-level visual testing.
 */
export const compareElementScreenshot = async (
  page: Page,
  locator: string,
  name: string,
  threshold: number = 0.2
): Promise<void> => {
  const element = page.locator(locator);
  await expect(element).toHaveScreenshot(`${name}.png`, {
    threshold,
    maxDiffPixels: 100,
  });
  logger.debug(`Element screenshot comparison passed: ${name}`);
};

/**
 * Take a screenshot and save it without comparison.
 * Useful for creating baseline images or debugging.
 */
export const takeScreenshot = async (
  page: Page,
  name: string,
  fullPage: boolean = true
): Promise<void> => {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage,
  });
  logger.debug(`Screenshot saved: ${name}`);
};

/**
 * Hide dynamic elements before taking a screenshot.
 * Useful when you have timestamps, random data, or other dynamic
 * content that changes but shouldn't affect visual comparison.
 */
export const hideDynamicElements = async (
  page: Page,
  selectors: string[]
): Promise<void> => {
  await page.addStyleTag({
    content: selectors.map((selector) => `${selector} { visibility: hidden !important; }`).join('\n'),
  });
  logger.debug(`Hidden ${selectors.length} dynamic elements`);
};
