import { APIRequestContext, APIResponse } from '@playwright/test';
import { getBaseUrl } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Simple API client wrapper. Use this for API-level testing or setup/teardown.
 * 
 * We keep this minimal - if you need more complex API interactions, extend
 * this class or use Playwright's request context directly.
 */
export class ApiClient {
  private request: APIRequestContext;
  private baseURL: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseURL = getBaseUrl();
  }

  /**
   * Make a GET request. Returns the response for you to assert on.
   */
  async get(path: string, headers?: Record<string, string>): Promise<APIResponse> {
    const url = `${this.baseURL}${path}`;
    logger.debug(`GET ${url}`);
    return await this.request.get(url, { headers });
  }

  /**
   * Make a POST request. Useful for creating test data or authentication.
   */
  async post(
    path: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<APIResponse> {
    const url = `${this.baseURL}${path}`;
    logger.debug(`POST ${url}`);
    return await this.request.post(url, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  /**
   * Make a DELETE request. Useful for cleanup.
   */
  async delete(path: string, headers?: Record<string, string>): Promise<APIResponse> {
    const url = `${this.baseURL}${path}`;
    logger.debug(`DELETE ${url}`);
    return await this.request.delete(url, { headers });
  }

  /**
   * Make a PUT request. Useful for updating resources.
   */
  async put(
    path: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<APIResponse> {
    const url = `${this.baseURL}${path}`;
    logger.debug(`PUT ${url}`);
    return await this.request.put(url, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  /**
   * Make a PATCH request. Useful for partial updates.
   */
  async patch(
    path: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<APIResponse> {
    const url = `${this.baseURL}${path}`;
    logger.debug(`PATCH ${url}`);
    return await this.request.patch(url, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  /**
   * Check if response status is successful (2xx range).
   * Throws an error with response details if not successful.
   */
  async expectSuccess(response: APIResponse): Promise<void> {
    if (!response.ok()) {
      const body = await response.text().catch(() => 'Unable to read response body');
      throw new Error(
        `API request failed: ${response.status()} ${response.statusText()}\nBody: ${body}`
      );
    }
  }
}
