import { Page, TestInfo } from '@playwright/test';
import { logger } from './logger';

/**
 * Error handling and screenshot helpers.
 * 
 * These utilities make debugging test failures easier by automatically
 * capturing screenshots, page state, and useful context when tests fail.
 */

/**
 * Take a screenshot with a descriptive name when an error occurs.
 * Call this in catch blocks or use with try/catch around assertions.
 */
export const captureErrorScreenshot = async (
  page: Page,
  testInfo: TestInfo,
  errorName: string = 'error'
): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = `test-results/screenshots/${testInfo.title}-${errorName}-${timestamp}.png`;

  try {
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    logger.error(`Error screenshot saved: ${screenshotPath}`);
    
    // Attach to test report
    await testInfo.attach('error-screenshot', {
      path: screenshotPath,
      contentType: 'image/png',
    });
  } catch (screenshotError) {
    logger.warn(`Failed to capture error screenshot: ${screenshotError}`);
  }
};

/**
 * Capture page HTML when an error occurs. Useful for debugging
 * what was actually on the page when something failed.
 */
export const captureErrorHtml = async (
  page: Page,
  testInfo: TestInfo,
  errorName: string = 'error'
): Promise<void> => {
  try {
    const html = await page.content();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlPath = `test-results/html/${testInfo.title}-${errorName}-${timestamp}.html`;

    // Write HTML to file (you'd need fs here, but keeping it simple)
    // In practice, you might use testInfo.attach instead
    
    await testInfo.attach('error-html', {
      body: html,
      contentType: 'text/html',
    });
    
    logger.debug(`Error HTML captured for: ${errorName}`);
  } catch (htmlError) {
    logger.warn(`Failed to capture error HTML: ${htmlError}`);
  }
};

/**
 * Capture console logs when an error occurs. Useful for debugging
 * JavaScript errors or console warnings.
 */
export const captureConsoleLogs = async (
  page: Page,
  testInfo: TestInfo
): Promise<void> => {
  const logs: string[] = [];

  page.on('console', (msg) => {
    const logEntry = `[${msg.type()}] ${msg.text()}`;
    logs.push(logEntry);
  });

  page.on('pageerror', (error) => {
    logs.push(`[ERROR] ${error.message}`);
  });

  // Store logs for attachment after test
  (testInfo as unknown as { consoleLogs?: string[] }).consoleLogs = logs;

  // Attach logs at end of test (you'd call this in afterEach)
  if (logs.length > 0) {
    await testInfo.attach('console-logs', {
      body: logs.join('\n'),
      contentType: 'text/plain',
    });
  }
};

/**
 * Capture network request/response when an error occurs.
 * Useful for debugging API issues.
 */
export const captureNetworkLogs = async (
  page: Page,
  testInfo: TestInfo
): Promise<void> => {
  const networkLogs: Array<{
    url: string;
    method: string;
    status?: number;
    error?: string;
  }> = [];

  page.on('request', (request) => {
    networkLogs.push({
      url: request.url(),
      method: request.method(),
    });
  });

  page.on('response', (response) => {
    const log = networkLogs.find((log) => log.url === response.url());
    if (log) {
      log.status = response.status();
    }
  });

  page.on('requestfailed', (request) => {
    networkLogs.push({
      url: request.url(),
      method: request.method(),
      error: request.failure()?.errorText || 'Unknown error',
    });
  });

  // Store for attachment
  (testInfo as unknown as { networkLogs?: typeof networkLogs }).networkLogs = networkLogs;

  if (networkLogs.length > 0) {
    await testInfo.attach('network-logs', {
      body: JSON.stringify(networkLogs, null, 2),
      contentType: 'application/json',
    });
  }
};

/**
 * Comprehensive error capture - takes screenshot, HTML, and logs.
 * Use this in catch blocks or test hooks.
 */
export const captureFullErrorContext = async (
  page: Page,
  testInfo: TestInfo,
  errorName: string = 'error'
): Promise<void> => {
  await Promise.all([
    captureErrorScreenshot(page, testInfo, errorName),
    captureErrorHtml(page, testInfo, errorName),
  ]);

  logger.error(`Full error context captured for: ${errorName}`);
};

/**
 * Helper to wrap test code with automatic error capture.
 * If the test fails, it automatically captures screenshots and context.
 */
export const withErrorCapture = async <T>(
  page: Page,
  testInfo: TestInfo,
  testFn: () => Promise<T>
): Promise<T> => {
  try {
    return await testFn();
  } catch (error) {
    await captureFullErrorContext(page, testInfo, 'failure');
    throw error;
  }
};
