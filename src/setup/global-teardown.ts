import { FullConfig } from '@playwright/test';
import { logger } from '../utils/logger';

/**
 * Global teardown runs once after all tests complete.
 * 
 * Use this for:
 * - Cleaning up test data
 * - Stopping mock servers
 * - Generating reports
 * - Any cleanup tasks
 */
async function globalTeardown(config: FullConfig) {
  logger.info('Running global teardown...');

  // Example: Clean up test data or generate reports
  // Add your cleanup logic here

  logger.info('✅ Global teardown complete');
}

export default globalTeardown;
