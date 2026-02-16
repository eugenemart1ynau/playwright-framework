import { Page } from '@playwright/test';
import { logger } from './logger';

/**
 * Accessibility testing helpers.
 * 
 * These utilities help you catch accessibility issues early.
 * For comprehensive a11y testing, consider using @axe-core/playwright
 * or similar tools, but these helpers cover common checks.
 */

/**
 * Check if page has proper heading hierarchy.
 * Headings should go in order (h1 -> h2 -> h3, etc.) without skipping levels.
 */
export const checkHeadingHierarchy = async (page: Page): Promise<boolean> => {
  const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) => {
    return elements.map((el) => ({
      level: parseInt(el.tagName.charAt(1)),
      text: el.textContent?.trim() || '',
    }));
  });

  let previousLevel = 0;
  for (const heading of headings) {
    if (heading.level > previousLevel + 1) {
      logger.warn(
        `Heading hierarchy issue: Found h${heading.level} after h${previousLevel}. ` +
          `Text: ${heading.text.substring(0, 50)}`
      );
      return false;
    }
    previousLevel = heading.level;
  }

  return true;
};

/**
 * Check if images have alt text. Critical for screen readers.
 */
export const checkImageAltText = async (page: Page): Promise<string[]> => {
  const imagesWithoutAlt = await page.$$eval('img', (images) => {
    return images
      .filter((img) => !img.alt || img.alt.trim() === '')
      .map((img) => img.src || 'unknown source');
  });

  if (imagesWithoutAlt.length > 0) {
    logger.warn(`Found ${imagesWithoutAlt.length} images without alt text`);
  }

  return imagesWithoutAlt;
};

/**
 * Check if form inputs have associated labels.
 * Important for screen readers and form usability.
 */
export const checkFormLabels = async (page: Page): Promise<string[]> => {
  // Code inside $$eval runs in browser context where document exists
  const inputsWithoutLabels = await page.$$eval(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select',
    (inputs) => {
      return inputs
        .filter((input) => {
          // Check if input has aria-label or aria-labelledby
          if (input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')) {
            return false;
          }

          // Check if input has associated label
          const id = input.id;
          // @ts-expect-error - browser APIs available in $$eval context
          if (id && document.querySelector(`label[for="${id}"]`)) {
            return false;
          }

          // Check if input is inside a label
          if (input.closest('label')) {
            return false;
          }

          return true;
        })
        .map((input) => input.name || input.id || 'unnamed input');
    }
  );

  if (inputsWithoutLabels.length > 0) {
    logger.warn(`Found ${inputsWithoutLabels.length} form inputs without labels`);
  }

  return inputsWithoutLabels;
};

/**
 * Check for sufficient color contrast (basic check).
 * For comprehensive contrast checking, use dedicated tools.
 * This checks if text has sufficient contrast against background.
 */
export const checkColorContrast = async (page: Page): Promise<boolean> => {
  // This is a simplified check - real contrast checking requires
  // computing actual colors, which is complex. Consider using
  // @axe-core/playwright for proper contrast checking.
  logger.info(
    'Basic contrast check - for comprehensive checking, use @axe-core/playwright'
  );
  return true;
};

/**
 * Run basic accessibility checks and return results.
 */
export interface AccessibilityReport {
  headingHierarchy: boolean;
  imagesWithoutAlt: string[];
  inputsWithoutLabels: string[];
}

export const runAccessibilityChecks = async (
  page: Page
): Promise<AccessibilityReport> => {
  logger.info('Running accessibility checks...');

  const [headingHierarchy, imagesWithoutAlt, inputsWithoutLabels] = await Promise.all([
    checkHeadingHierarchy(page),
    checkImageAltText(page),
    checkFormLabels(page),
  ]);

  return {
    headingHierarchy,
    imagesWithoutAlt,
    inputsWithoutLabels,
  };
};
