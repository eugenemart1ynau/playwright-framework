/**
 * Test tags system. Use these to organize and filter tests.
 * 
 * Tag your tests like this:
 * test('my test @smoke', async ({ page }) => { ... })
 * 
 * Then run specific tags:
 * npx playwright test --grep @smoke
 * npx playwright test --grep "@smoke|@regression"
 */

export const TestTags = {
  /**
   * Smoke tests - quick checks that core functionality works.
   * These should be fast and stable.
   */
  SMOKE: '@smoke',

  /**
   * Regression tests - comprehensive tests that cover existing functionality.
   * Run these before releases.
   */
  REGRESSION: '@regression',

  /**
   * Critical tests - must pass for the app to be considered working.
   * These are your most important tests.
   */
  CRITICAL: '@critical',

  /**
   * Integration tests - test multiple components working together.
   */
  INTEGRATION: '@integration',

  /**
   * API tests - tests that hit APIs directly.
   */
  API: '@api',

  /**
   * UI tests - tests that interact with the user interface.
   */
  UI: '@ui',

  /**
   * Slow tests - tests that take a long time to run.
   * Skip these in quick feedback loops.
   */
  SLOW: '@slow',

  /**
   * Flaky tests - tests that are known to be unstable.
   * Mark these so you can skip them when needed.
   */
  FLAKY: '@flaky',

  /**
   * Skip in CI - tests that should only run locally.
   * Useful for tests that require local setup.
   */
  SKIP_CI: '@skip-ci',

  /**
   * Authentication tests - tests related to login/logout/auth.
   */
  AUTH: '@auth',

  /**
   * Visual tests - screenshot comparison tests.
   */
  VISUAL: '@visual',
} as const;

/**
 * Helper to create custom tags. Use this if you need project-specific tags.
 */
export const createTag = (name: string): string => {
  return `@${name.toLowerCase().replace(/\s+/g, '-')}`;
};

/**
 * Common tag combinations for convenience.
 */
export const TagCombinations = {
  /**
   * All critical smoke tests - your must-pass quick checks.
   */
  CRITICAL_SMOKE: `${TestTags.CRITICAL} ${TestTags.SMOKE}`,

  /**
   * Full regression suite - everything except flaky tests.
   */
  FULL_REGRESSION: `${TestTags.REGRESSION} !${TestTags.FLAKY}`,

  /**
   * Fast feedback suite - smoke tests that aren't flaky.
   */
  FAST_FEEDBACK: `${TestTags.SMOKE} !${TestTags.FLAKY} !${TestTags.SLOW}`,
} as const;
