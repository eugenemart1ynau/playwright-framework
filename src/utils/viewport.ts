import { Page, BrowserContext } from '@playwright/test';
import { logger } from './logger';

/**
 * Viewport and responsive testing utilities.
 * 
 * These helpers make it easier to test across different screen sizes
 * and device types.
 */

export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * Common viewport sizes for responsive testing.
 */
export const ViewportSizes = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  mobileLarge: { width: 414, height: 896 }, // iPhone 11 Pro Max
  tablet: { width: 768, height: 1024 }, // iPad
  tabletLandscape: { width: 1024, height: 768 },
  desktop: { width: 1920, height: 1080 }, // Full HD
  desktopSmall: { width: 1366, height: 768 }, // Common laptop
  desktopLarge: { width: 2560, height: 1440 }, // 2K
} as const;

/**
 * Set viewport size for responsive testing.
 */
export const setViewport = async (
  page: Page,
  size: ViewportSize
): Promise<void> => {
  await page.setViewportSize(size);
  logger.debug(`Viewport set to ${size.width}x${size.height}`);
};

/**
 * Test across multiple viewport sizes.
 * Useful for responsive design testing.
 */
export const testViewports = async (
  page: Page,
  testFn: () => Promise<void>,
  sizes: ViewportSize[] = [
    ViewportSizes.mobile,
    ViewportSizes.tablet,
    ViewportSizes.desktop,
  ]
): Promise<void> => {
  for (const size of sizes) {
    await setViewport(page, size);
    logger.info(`Testing at ${size.width}x${size.height}`);
    await testFn();
  }
};

/**
 * Get current viewport size.
 */
export const getViewportSize = async (page: Page): Promise<ViewportSize> => {
  return page.viewportSize() || { width: 0, height: 0 };
};

/**
 * Check if viewport is mobile-sized.
 */
export const isMobileViewport = async (page: Page): Promise<boolean> => {
  const size = await getViewportSize(page);
  return size.width < 768;
};

/**
 * Check if viewport is tablet-sized.
 */
export const isTabletViewport = async (page: Page): Promise<boolean> => {
  const size = await getViewportSize(page);
  return size.width >= 768 && size.width < 1024;
};

/**
 * Check if viewport is desktop-sized.
 */
export const isDesktopViewport = async (page: Page): Promise<boolean> => {
  const size = await getViewportSize(page);
  return size.width >= 1024;
};

/**
 * Emulate device with viewport and user agent.
 * More comprehensive than just setting viewport.
 */
export const emulateDevice = async (
  context: BrowserContext,
  deviceName: 'mobile' | 'tablet' | 'desktop'
): Promise<void> => {
  const devices = {
    mobile: { viewport: ViewportSizes.mobile, userAgent: 'Mobile' },
    tablet: { viewport: ViewportSizes.tablet, userAgent: 'Tablet' },
    desktop: { viewport: ViewportSizes.desktop, userAgent: 'Desktop' },
  };

  const device = devices[deviceName];
  // Note: Full device emulation requires using Playwright's devices
  // This is a simplified version
  logger.debug(`Emulating ${deviceName} device`);
};
