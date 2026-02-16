/**
 * Environment configuration. Reads from process.env.ENV with fallback to 'local'.
 * 
 * We keep this centralized so switching environments is just one env var change.
 * Credentials can come from process.env if you set them, otherwise you'll need
 * to handle auth differently per environment.
 */

export type Environment = 'local' | 'test' | 'stage' | 'prod';

const getEnvironment = (): Environment => {
  const env = process.env.ENV?.toLowerCase() || 'local';
  const validEnvs: Environment[] = ['local', 'test', 'stage', 'prod'];
  
  if (validEnvs.includes(env as Environment)) {
    return env as Environment;
  }
  
  // If someone passes an invalid env, default to local and log a warning
  console.warn(`Invalid ENV "${env}", defaulting to "local"`);
  return 'local';
};

export const getBaseUrl = (): string => {
  const env = getEnvironment();
  
  const urls: Record<Environment, string> = {
    local: 'http://localhost:3000',
    test: 'https://test.example.com',
    stage: 'https://stage.example.com',
    prod: 'https://example.com',
  };
  
  // Allow override via BASE_URL env var if needed
  return process.env.BASE_URL || urls[env];
};

export const getCredentials = (): { username: string; password: string } | null => {
  // If credentials are provided via env vars, use them
  // Otherwise return null and let tests handle auth their own way
  if (process.env.TEST_USERNAME && process.env.TEST_PASSWORD) {
    return {
      username: process.env.TEST_USERNAME,
      password: process.env.TEST_PASSWORD,
    };
  }
  
  return null;
};

export const currentEnv = getEnvironment();
