import { Page, Locator } from '@playwright/test';

/**
 * Additional wait utilities. Sometimes you need more than what BasePage provides.
 * 
 * These helpers cover common scenarios that come up in real tests.
 */

/**
 * Wait for an element to disappear. Useful when waiting for loading spinners
 * or error messages to clear.
 */
export const waitForElementToDisappear = async (
  locator: Locator,
  timeout = 10000
): Promise<void> => {
  await locator.waitFor({ state: 'hidden', timeout });
};

/**
 * Wait for a specific number of network requests to complete.
 * Useful when you know exactly how many API calls should happen.
 */
export const waitForNetworkRequests = async (
  page: Page,
  count: number,
  timeout = 30000
): Promise<void> => {
  let requestCount = 0;
  const promise = new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      page.removeAllListeners('request');
      reject(new Error(`Timeout waiting for ${count} network requests. Got ${requestCount}`));
    }, timeout);

    page.on('request', () => {
      requestCount++;
      if (requestCount >= count) {
        clearTimeout(timeoutId);
        page.removeAllListeners('request');
        resolve();
      }
    });
  });

  await promise;
};

/**
 * Wait for text content to appear in an element.
 * More specific than just waiting for visibility.
 */
export const waitForText = async (
  locator: Locator,
  text: string | RegExp,
  timeout = 10000
): Promise<void> => {
  await locator.waitFor({ state: 'visible', timeout });
  // Give it a moment for text to update
  await locator.page().waitForTimeout(100);
  
  const content = await locator.textContent();
  if (typeof text === 'string') {
    if (!content?.includes(text)) {
      throw new Error(`Expected text "${text}" not found in element`);
    }
  } else {
    if (!content?.match(text)) {
      throw new Error(`Expected text pattern not found in element`);
    }
  }
};
