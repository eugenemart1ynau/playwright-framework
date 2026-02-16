import { logger } from './logger';

/**
 * Retry utilities for custom retry logic.
 * 
 * Sometimes you need more control than Playwright's built-in retries.
 * These helpers let you retry specific operations with custom logic.
 */

/**
 * Retry a function until it succeeds or max attempts reached.
 * 
 * @param fn - Function to retry
 * @param options - Retry options
 * @returns Result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, onRetry } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        if (onRetry) {
          onRetry(attempt, lastError);
        } else {
          logger.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`, lastError.message);
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Retry with exponential backoff.
 * Useful when you want to wait longer between each retry.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    multiplier?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    multiplier = 2,
  } = options;

  let delay = initialDelayMs;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        logger.warn(
          `Attempt ${attempt} failed, retrying in ${delay}ms (exponential backoff)...`,
          lastError.message
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * multiplier, maxDelayMs);
      }
    }
  }

  throw lastError || new Error('Retry with backoff failed');
}

/**
 * Retry until condition is met or timeout.
 * Useful for waiting for async conditions.
 */
export async function retryUntil<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  options: {
    timeoutMs?: number;
    intervalMs?: number;
  } = {}
): Promise<T> {
  const { timeoutMs = 10000, intervalMs = 500 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const result = await fn();
    if (condition(result)) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Condition not met within ${timeoutMs}ms`);
}
