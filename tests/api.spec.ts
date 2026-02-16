import { test, expect } from '@playwright/test';
import { ApiClient } from '../src/core/apiClient';
import { TestTags } from '../src/utils/tags';

/**
 * API testing examples. These show how to test APIs directly
 * without going through the UI. Useful for faster feedback
 * and testing edge cases.
 */
test.describe('API Tests', () => {
  test(`should get user data from API ${TestTags.API}`, async ({ request }) => {
    const apiClient = new ApiClient(request);

    // Make API call
    const response = await apiClient.get('/api/users/1');

    // Verify response
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const user = await response.json();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
  });

  test('should create a new user via API', async ({ request }) => {
    const apiClient = new ApiClient(request);

    const newUser = {
      email: 'newuser@example.com',
      name: 'Test User',
    };

    const response = await apiClient.post('/api/users', newUser);

    // Verify success
    await apiClient.expectSuccess(response);
    expect(response.status()).toBe(201);

    const createdUser = await response.json();
    expect(createdUser.email).toBe(newUser.email);
  });

  test('should handle API errors gracefully', async ({ request }) => {
    const apiClient = new ApiClient(request);

    // Try to get a non-existent user
    const response = await apiClient.get('/api/users/99999');

    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error).toHaveProperty('message');
  });

  test('should update user via API', async ({ request }) => {
    const apiClient = new ApiClient(request);

    const updates = {
      name: 'Updated Name',
    };

    const response = await apiClient.put('/api/users/1', updates);
    await apiClient.expectSuccess(response);

    const updatedUser = await response.json();
    expect(updatedUser.name).toBe(updates.name);
  });

  test('should delete user via API', async ({ request }) => {
    const apiClient = new ApiClient(request);

    const response = await apiClient.delete('/api/users/1');
    await apiClient.expectSuccess(response);
    expect(response.status()).toBe(204);
  });
});
