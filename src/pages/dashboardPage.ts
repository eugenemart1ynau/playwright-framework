import { Page, expect } from '@playwright/test';
import { BasePage } from '../core/basePage';

/**
 * Dashboard page object. Represents the main page users see after logging in.
 * 
 * This is where you'd add methods for dashboard-specific interactions like
 * navigating to sections, checking widgets, etc.
 */
export class DashboardPage extends BasePage {
  private get welcomeMessage() {
    return this.page.getByRole('heading', { name: /welcome|dashboard/i });
  }

  private get userMenu() {
    return this.page.getByRole('button', { name: /user|account|profile/i });
  }

  private get logoutButton() {
    return this.page.getByRole('button', { name: /log out|sign out/i });
  }

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate directly to dashboard (useful if you're already authenticated).
   */
  async goto(): Promise<void> {
    await super.goto('/dashboard');
    await this.waitForElement(this.welcomeMessage);
  }

  /**
   * Verify that the dashboard loaded successfully.
   * We check for the welcome message as a reliable indicator.
   */
  async verifyLoaded(): Promise<void> {
    await expect(this.welcomeMessage).toBeVisible();
    // Also check that we're on the right URL
    await expect(this.page).toHaveURL(/dashboard/);
  }

  /**
   * Logout from the dashboard.
   */
  async logout(): Promise<void> {
    // If there's a user menu, click it first
    if (await this.isVisible(this.userMenu)) {
      await this.userMenu.click();
      // Small wait for menu to appear
      await this.page.waitForTimeout(300);
    }
    
    await this.logoutButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if user is logged in by verifying dashboard elements are present.
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.isVisible(this.welcomeMessage);
  }
}
