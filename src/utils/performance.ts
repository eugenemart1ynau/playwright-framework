import { Page } from '@playwright/test';
import { logger } from './logger';

/**
 * Performance testing utilities.
 * 
 * These helpers collect performance metrics like page load times,
 * API response times, and resource loading metrics.
 */

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  networkRequests: number;
  totalTransferSize: number;
}

/**
 * Collect performance metrics for the current page.
 * Useful for performance regression testing.
 */
export const collectPerformanceMetrics = async (page: Page): Promise<PerformanceMetrics> => {
  // Get navigation timing
  const timing = await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const perf = (performance as any).getEntriesByType('navigation')[0] as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paint = (performance as any).getEntriesByType('paint') as any[];
    
    return {
      loadTime: perf.loadEventEnd - perf.fetchStart,
      domContentLoaded: perf.domContentLoadedEventEnd - perf.fetchStart,
      firstPaint: paint.find((p: any) => p.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find((p: any) => p.name === 'first-contentful-paint')?.startTime,
    };
  });

  // Get resource metrics
  const resources = await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = (performance as any).getEntriesByType('resource') as any[];
    return {
      count: entries.length,
      totalSize: entries.reduce((sum: number, entry: any) => sum + (entry.transferSize || 0), 0),
    };
  });

  const metrics: PerformanceMetrics = {
    loadTime: timing.loadTime,
    domContentLoaded: timing.domContentLoaded,
    firstPaint: timing.firstPaint,
    firstContentfulPaint: timing.firstContentfulPaint,
    networkRequests: resources.count,
    totalTransferSize: resources.totalSize,
  };

  logger.debug('Performance metrics collected', metrics);
  return metrics;
};

/**
 * Measure API response time for a specific request.
 * Use with network interception to track API performance.
 */
export const measureApiResponseTime = async (
  page: Page,
  urlPattern: string | RegExp
): Promise<number> => {
  return new Promise((resolve) => {
    const startTime = Date.now();

    page.on('response', (response) => {
      const url = response.url();
      const matches =
        typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);

      if (matches) {
        const responseTime = Date.now() - startTime;
        page.removeAllListeners('response');
        resolve(responseTime);
      }
    });
  });
};

/**
 * Assert that page load time is within acceptable threshold.
 * Useful for performance regression testing.
 */
export const assertPageLoadTime = async (
  page: Page,
  maxLoadTime: number
): Promise<void> => {
  const metrics = await collectPerformanceMetrics(page);
  
  if (metrics.loadTime > maxLoadTime) {
    throw new Error(
      `Page load time ${metrics.loadTime}ms exceeds threshold of ${maxLoadTime}ms`
    );
  }
  
  logger.info(`Page load time: ${metrics.loadTime}ms (threshold: ${maxLoadTime}ms)`);
};

/**
 * Get slowest resources on the page.
 * Useful for identifying performance bottlenecks.
 */
export const getSlowestResources = async (
  page: Page,
  limit: number = 5
): Promise<Array<{ name: string; duration: number; size: number }>> => {
  const resources = await page.evaluate((limit) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = (performance as any).getEntriesByType('resource') as any[];
    return entries
      .map((entry: any) => ({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize || 0,
      }))
      .sort((a: any, b: any) => b.duration - a.duration)
      .slice(0, limit);
  }, limit);

  return resources;
};
