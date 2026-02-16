import { Page } from '@playwright/test';
import { BasePage } from '../core/basePage';

/**
 * Login page object. Encapsulates all login-related interactions.
 * 
 * We use role selectors where possible (getByRole) because they're more
 * resilient to CSS changes. Fall back to data-testid if roles aren't specific enough.
 */
export class LoginPage extends BasePage {
  // Locators - we define them as getters so they're evaluated fresh each time
  // This helps avoid stale element issues
  private get emailInput() {
    return this.page.getByRole('textbox', { name: /email/i });
  }

  private get passwordInput() {
    // Password inputs aren't typically found via getByRole('textbox')
    // so we use a more reliable selector
    return this.page.locator('input[type="password"]').or(
      this.page.getByPlaceholder(/password/i)
    );
  }

  private get loginButton() {
    return this.page.getByRole('button', { name: /log in|sign in/i });
  }

  private get errorMessage() {
    return this.page.locator('[data-testid="error-message"]').or(
      this.page.locator('.error, .alert-danger')
    );
  }

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the login page.
   */
  async goto(): Promise<void> {
    await super.goto('/login');
    // Wait for the form to be ready before proceeding
    await this.waitForElement(this.emailInput);
  }

  /**
   * Fill in login credentials and submit.
   * 
   * We keep this as one method because login is usually atomic - you don't
   * typically fill email without password. If you need separate steps, you
   * can add fillEmail() and fillPassword() methods.
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    // Wait for navigation or error to appear
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if an error message is displayed. Useful for negative test cases.
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }

  /**
   * Get the error message text if present.
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() ?? '';
  }

  /**
   * Clear the login form. Useful if you need to reset between attempts.
   */
  async clearForm(): Promise<void> {
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Check if user is already logged in by looking for dashboard elements.
   * Useful to skip login if already authenticated.
   */
  async isAlreadyLoggedIn(): Promise<boolean> {
    // If we see dashboard elements, we're probably already logged in
    const dashboardIndicator = this.page.locator('[data-testid="dashboard"], [href*="dashboard"]');
    return await this.isVisible(dashboardIndicator);
  }
}
