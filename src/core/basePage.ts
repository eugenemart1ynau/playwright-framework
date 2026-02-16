import { Page, Locator, expect } from '@playwright/test';
import { logger } from '../utils/logger';

/**
 * Base page class that all page objects extend.
 * 
 * We keep shared navigation and wait logic here so page objects stay focused
 * on their specific interactions. If you find yourself repeating the same
 * wait pattern across pages, consider adding it here.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a relative path. Uses baseURL from config automatically.
   */
  async goto(path = ''): Promise<void> {
    await this.page.goto(path);
    logger.debug(`Navigated to ${path}`);
  }

  /**
   * Wait for network to be idle. Useful after actions that trigger
   * API calls or dynamic content loading.
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for a locator to be visible and enabled.
   * We use this instead of raw waits to make tests more stable.
   */
  async waitForElement(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await expect(locator).toBeEnabled({ timeout });
  }

  /**
   * Check if an element is visible. Returns false instead of throwing.
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get page title. Useful for assertions.
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }
}
