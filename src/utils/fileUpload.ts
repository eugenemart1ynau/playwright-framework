import { Page, Locator } from '@playwright/test';
import { logger } from './logger';

/**
 * File upload helpers. Uploading files in tests can be tricky, so we
 * keep the common patterns here.
 */

/**
 * Upload a file using a file input. The input can be hidden - Playwright handles it.
 * 
 * @param fileInput - The file input locator
 * @param filePath - Path to the file (relative to project root or absolute)
 */
export const uploadFile = async (
  fileInput: Locator,
  filePath: string
): Promise<void> => {
  await fileInput.setInputFiles(filePath);
  logger.debug(`Uploaded file: ${filePath}`);
};

/**
 * Upload multiple files at once. Some forms allow multiple file selection.
 */
export const uploadFiles = async (
  fileInput: Locator,
  filePaths: string[]
): Promise<void> => {
  await fileInput.setInputFiles(filePaths);
  logger.debug(`Uploaded ${filePaths.length} files`);
};

/**
 * Clear file input (remove selected files).
 */
export const clearFileInput = async (fileInput: Locator): Promise<void> => {
  await fileInput.setInputFiles([]);
  logger.debug('Cleared file input');
};

/**
 * Drag and drop a file onto a drop zone. Useful for modern file upload UIs.
 * 
 * Note: For drag and drop file uploads, it's often easier to find a hidden
 * file input and use setInputFiles(). This helper tries that first, then
 * falls back to triggering events. For complex scenarios, you might need
 * to implement a custom solution using page.evaluate().
 */
export const dragAndDropFile = async (
  page: Page,
  filePath: string,
  dropZone: Locator
): Promise<void> => {
  // Many drag-and-drop UIs actually have a hidden file input
  // Try to find it first - this is the most reliable approach
  const hiddenInput = dropZone.locator('input[type="file"]').first();
  const inputExists = await hiddenInput.count() > 0;
  
  if (inputExists) {
    // If there's a file input (hidden or visible), use it
    await uploadFile(hiddenInput, filePath);
    logger.debug(`Dropped file via file input: ${filePath}`);
  } else {
    // If no file input exists, you'll need to implement custom drag-and-drop
    // This is UI-specific, so we'll log a helpful message
    logger.warn(
      `No file input found for drop zone. You may need to implement custom ` +
      `drag-and-drop using page.evaluate() with browser APIs for: ${filePath}`
    );
    throw new Error(
      'Drag and drop not implemented for this UI. Look for a file input or ' +
      'implement custom drag-and-drop using browser APIs.'
    );
  }
};
