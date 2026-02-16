import { chromium, FullConfig } from '@playwright/test';
import { saveAuthState } from '../utils/auth';
import { getCredentials } from '../config/env';
import { LoginPage } from '../pages/loginPage';

/**
 * Global setup runs once before all tests.
 * 
 * Use this for:
 * - Setting up test data
 * - Authenticating and saving auth state
 * - Starting mock servers
 * - Any one-time setup tasks
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  // Example: Authenticate once and save state for all tests
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Only authenticate if credentials are provided
    const creds = getCredentials();
    if (creds && baseURL) {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(creds.username, creds.password);

      // Save auth state so tests can reuse it
      await saveAuthState(context, 'playwright/.auth/user.json');
      console.log('✅ Authentication successful - auth state saved');
    } else {
      console.log('⚠️  No credentials provided - skipping authentication');
    }
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
