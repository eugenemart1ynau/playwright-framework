/**
 * Main entry point for the framework.
 * 
 * Barrel exports - import everything you need from a single place.
 * Makes imports cleaner: import { UserBuilder, LoginPage } from '../src'
 */

// Core
export { BasePage } from './core/basePage';
export { ApiClient } from './core/apiClient';

// Page Objects
export { LoginPage } from './pages/loginPage';
export { DashboardPage } from './pages/dashboardPage';

// Builders
export { UserBuilder } from './data/builders/userBuilder';
export type { User } from './data/builders/userBuilder';
export { AddressBuilder } from './data/builders/addressBuilder';
export type { Address } from './data/builders/addressBuilder';
export { ProductBuilder } from './data/builders/productBuilder';
export type { Product } from './data/builders/productBuilder';
export { OrderBuilder } from './data/builders/orderBuilder';
export type { Order, OrderItem } from './data/builders/orderBuilder';

// Factories
export { TestDataFactory } from './data/factories/testDataFactory';

// Utilities
export { logger } from './utils/logger';
export { setSeed, resetSeed, randomEmail, randomPhone } from './utils/random';
export { TestTags, createTag, TagCombinations } from './utils/tags';
export {
  saveAuthState,
  loadAuthState,
  getAuthToken,
  setAuthToken,
  clearAuthState,
} from './utils/auth';
export {
  mockApiResponse,
  blockUrl,
  waitForApiRequest,
  captureApiRequests,
  slowDownNetwork,
} from './utils/network';
export {
  checkHeadingHierarchy,
  checkImageAltText,
  checkFormLabels,
  runAccessibilityChecks,
  type AccessibilityReport,
} from './utils/accessibility';
export {
  compareScreenshot,
  compareElementScreenshot,
  takeScreenshot,
  hideDynamicElements,
} from './utils/visual';
export {
  captureErrorScreenshot,
  captureErrorHtml,
  captureFullErrorContext,
  withErrorCapture,
} from './utils/errorHelpers';
export {
  waitForElementToDisappear,
  waitForNetworkRequests,
  waitForText,
} from './utils/wait';
export {
  uploadFile,
  uploadFiles,
  clearFileInput,
  dragAndDropFile,
} from './utils/fileUpload';
export {
  collectPerformanceMetrics,
  measureApiResponseTime,
  assertPageLoadTime as assertPerformanceLoadTime,
  getSlowestResources,
  type PerformanceMetrics,
} from './utils/performance';
export {
  retry,
  retryWithBackoff,
  retryUntil,
} from './utils/retry';
export {
  setViewport,
  testViewports,
  getViewportSize,
  isMobileViewport,
  isTabletViewport,
  isDesktopViewport,
  ViewportSizes,
  type ViewportSize,
} from './utils/viewport';
export {
  assertContainsText,
  assertUrlMatches,
  assertElementReady,
  assertFieldValue,
  assertElementCount,
  assertApiSuccess,
  assertPageLoadTime,
} from './utils/assertions';

// Config
export { getBaseUrl, getCredentials, currentEnv, type Environment } from './config/env';

// Fixtures
export { test, expect } from './fixtures/testFixtures';
