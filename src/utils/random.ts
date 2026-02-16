import { faker } from '@faker-js/faker';

/**
 * Faker helpers and seeding utilities.
 * 
 * Seeding is useful when you want deterministic test data - same seed
 * produces the same random values. Use this when debugging flaky tests
 * or when you need reproducible data.
 */

/**
 * Set a seed for faker. Call this at the start of a test to get
 * deterministic random data. Useful for debugging flaky tests.
 * 
 * @example
 * setSeed(12345);
 * const user = new UserBuilder().build(); // Same data every time
 */
export const setSeed = (seed: number): void => {
  faker.seed(seed);
};

/**
 * Reset faker to use random seed (current timestamp).
 * Call this if you want truly random data after using setSeed.
 */
export const resetSeed = (): void => {
  faker.seed();
};

/**
 * Generate a random email. We use this helper so if email format
 * requirements change, we only update one place.
 */
export const randomEmail = (): string => {
  return faker.internet.email();
};

/**
 * Generate a random phone number in a consistent format.
 */
export const randomPhone = (): string => {
  return faker.phone.number('###-###-####');
};
