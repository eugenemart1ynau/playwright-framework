# Playwright TypeScript Framework

Production-ready Playwright automation framework with Builder Pattern and Page Object Model.

## Features

- ✅ **Builder Design Pattern** for flexible test data creation
- ✅ **Faker.js** integration for realistic random data
- ✅ **Page Object Model** for maintainable test code
- ✅ **Environment configuration** (local, test, stage, prod)
- ✅ **TypeScript strict mode** with full type safety
- ✅ **Clean, human-readable code** with practical comments

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in UI mode (recommended for development)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test file
npm run test:auth
npm run test:smoke

# Debug tests
npm run test:debug
```

## Environment Configuration

The framework supports multiple environments via the `ENV` environment variable.

### Setting Environment

```bash
# Local (default)
ENV=local npm test

# Test environment
ENV=test npm test

# Stage environment
ENV=stage npm test

# Production (use with caution!)
ENV=prod npm test
```

### Environment URLs

Edit `src/config/env.ts` to configure base URLs for each environment:

```typescript
const urls: Record<Environment, string> = {
  local: 'http://localhost:3000',
  test: 'https://test.example.com',
  stage: 'https://stage.example.com',
  prod: 'https://example.com',
};
```

### Credentials

Set credentials via environment variables (optional):

```bash
TEST_USERNAME=user@example.com TEST_PASSWORD=password123 npm test
```

Or override `BASE_URL` if needed:

```bash
BASE_URL=http://custom-url.com npm test
```

## Builder Pattern Usage

The Builder Pattern makes creating test data clean and flexible.

### Basic Usage

```typescript
import { UserBuilder } from '../src/data/builders/userBuilder';

// Create a user with all defaults (faker generates everything)
const user = new UserBuilder().build();

// Override specific fields
const admin = new UserBuilder()
  .withEmail('admin@example.com')
  .withPassword('SecurePass123!')
  .build();

// Chain multiple overrides
const customUser = new UserBuilder()
  .withFirstName('John')
  .withLastName('Doe')
  .withEmail('john.doe@example.com')
  .withPhone('555-123-4567')
  .build();
```

### Deterministic Data with Seeding

When debugging flaky tests, use faker seeding to get the same random data every time:

```typescript
import { setSeed } from '../src/utils/random';
import { UserBuilder } from '../src/data/builders/userBuilder';

test('reproducible test data', () => {
  setSeed(12345); // Same seed = same random values
  
  const user1 = new UserBuilder().build();
  const user2 = new UserBuilder().build();
  
  // user1 and user2 will have the same random data
  // because they use the same seed
});

test('different test, different data', () => {
  // No seed = truly random data
  const user = new UserBuilder().build();
});
```

**When to use seeding:**
- Debugging flaky tests
- Need reproducible test data
- Testing edge cases with specific data patterns

**When NOT to use seeding:**
- Most normal tests (let faker be random)
- Tests that need variety in data

## Page Object Model

Page objects encapsulate page-specific interactions.

### Using Page Objects

```typescript
import { LoginPage } from '../src/pages/loginPage';
import { DashboardPage } from '../src/pages/dashboardPage';

test('login flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await dashboardPage.verifyLoaded();
});
```

### Creating New Page Objects

1. Create a new file in `src/pages/`:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from '../core/basePage';

export class MyPage extends BasePage {
  private get myButton() {
    return this.page.getByRole('button', { name: /my button/i });
  }

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto('/my-page');
  }

  async clickMyButton(): Promise<void> {
    await this.myButton.click();
  }
}
```

2. Use it in tests:

```typescript
import { MyPage } from '../src/pages/myPage';

test('my test', async ({ page }) => {
  const myPage = new MyPage(page);
  await myPage.goto();
  await myPage.clickMyButton();
});
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/loginPage';
import { UserBuilder } from '../src/data/builders/userBuilder';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const user = new UserBuilder().build();

    // Act
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Assert
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

### Using Test Fixtures (Optional)

For cleaner test code, use the extended fixtures:

```typescript
import { test, expect } from '../src/fixtures/testFixtures';

test('using fixtures', async ({ loginPage, dashboardPage }) => {
  // Fixtures are already instantiated
  await loginPage.goto();
  await loginPage.login('user@example.com', 'pass');
  await dashboardPage.verifyLoaded();
});
```

## Project Structure

```
.
├── src/
│   ├── config/
│   │   └── env.ts              # Environment configuration
│   ├── core/
│   │   ├── basePage.ts         # Base page class
│   │   └── apiClient.ts        # API client wrapper
│   ├── data/
│   │   ├── builders/
│   │   │   └── userBuilder.ts  # Builder pattern implementation
│   │   └── models/
│   │       └── user.ts         # Data models
│   ├── fixtures/
│   │   └── testFixtures.ts     # Extended Playwright fixtures
│   ├── pages/
│   │   ├── loginPage.ts        # Page objects
│   │   └── dashboardPage.ts
│   └── utils/
│       ├── logger.ts           # Logging utility
│       └── random.ts           # Faker helpers
├── tests/
│   ├── auth.spec.ts            # Example auth tests
│   └── smoke.spec.ts           # Example smoke tests
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

## Best Practices

1. **Use role selectors** - Prefer `getByRole()` over CSS selectors for better resilience
2. **Wait explicitly** - Use `waitForElement()` instead of arbitrary `waitForTimeout()`
3. **Keep tests focused** - One test = one scenario
4. **Use builders** - Create test data with builders, not hardcoded values
5. **Page objects** - Keep page-specific logic in page objects, not tests
6. **Environment config** - Use env.ts for all environment-specific values

## Troubleshooting

### Tests are flaky

- Check if you're using proper waits (avoid `waitForTimeout`)
- Use `waitForNetworkIdle()` after actions that trigger API calls
- Consider using faker seeding to reproduce issues

### Can't find elements

- Verify selectors in browser DevTools
- Use Playwright's `codegen` tool: `npx playwright codegen`
- Check if element is in an iframe (not supported)

### Environment not switching

- Verify `ENV` variable is set correctly
- Check `src/config/env.ts` has correct URLs
- Use `BASE_URL` env var to override

## Contributing

When adding new features:

1. Follow existing code style and comment patterns
2. Add page objects for new pages
3. Use builders for test data creation
4. Update this README if adding new patterns

## License

MIT
