import { Page, Route } from '@playwright/test';
import { logger } from './logger';

/**
 * Network interception and mocking utilities.
 * 
 * These helpers make it easier to mock API responses, block requests,
 * or inspect network traffic during tests.
 */

export interface MockResponse {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Mock a specific API endpoint. Useful for testing error scenarios
 * or when you don't want to hit real APIs.
 */
export const mockApiResponse = async (
  page: Page,
  urlPattern: string | RegExp,
  mockResponse: MockResponse
): Promise<void> => {
  await page.route(urlPattern, (route: Route) => {
    logger.debug(`Mocking response for: ${route.request().url()}`);
    route.fulfill({
      status: mockResponse.status || 200,
      body: JSON.stringify(mockResponse.body || {}),
      headers: {
        'Content-Type': 'application/json',
        ...mockResponse.headers,
      },
    });
  });
};

/**
 * Block a specific URL pattern. Useful for blocking analytics,
 * ads, or other external resources you don't need in tests.
 */
export const blockUrl = async (
  page: Page,
  urlPattern: string | RegExp
): Promise<void> => {
  await page.route(urlPattern, (route) => {
    logger.debug(`Blocking request to: ${route.request().url()}`);
    route.abort();
  });
};

/**
 * Wait for a specific API request to complete.
 * Useful when you need to verify an API was called.
 */
export const waitForApiRequest = async (
  page: Page,
  urlPattern: string | RegExp,
  timeout = 30000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      page.removeAllListeners('request');
      reject(new Error(`Timeout waiting for API request: ${urlPattern}`));
    }, timeout);

    page.on('request', (request) => {
      const url = request.url();
      const matches =
        typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);

      if (matches) {
        clearTimeout(timeoutId);
        page.removeAllListeners('request');
        resolve();
      }
    });
  });
};

/**
 * Capture all network requests for a specific pattern.
 * Useful for debugging or verifying API calls.
 */
export const captureApiRequests = async (
  page: Page,
  urlPattern: string | RegExp
): Promise<Array<{ url: string; method: string; postData?: string }>> => {
  const requests: Array<{ url: string; method: string; postData?: string }> = [];

  page.on('request', (request) => {
    const url = request.url();
    const matches =
      typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);

    if (matches) {
      requests.push({
        url,
        method: request.method(),
        postData: request.postData() || undefined,
      });
    }
  });

  return requests;
};

/**
 * Slow down network requests. Useful for testing loading states
 * or simulating slow connections.
 */
export const slowDownNetwork = async (
  page: Page,
  delayMs: number = 1000
): Promise<void> => {
  await page.route('**/*', (route) => {
    setTimeout(() => {
      route.continue();
    }, delayMs);
  });
  logger.debug(`Slowed down network by ${delayMs}ms`);
};
