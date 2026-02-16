# Playwright TypeScript Framework

A solid Playwright automation framework built with TypeScript. I put this together to make writing and maintaining E2E tests less painful. It uses the Builder Pattern for test data and follows the Page Object Model, so your tests stay clean and readable.

## What's Inside

- **Builder Pattern** - Create test data without the headache. Faker handles the random stuff, you override what matters.
- **Test Data Factories** - Pre-built builders for users, addresses, products, orders, and more.
- **Page Object Model** - Keep your page interactions organized and reusable.
- **Test Tags** - Organize tests with @smoke, @regression, @critical, etc. Run what you need.
- **Error Helpers** - Automatic screenshots and context capture when tests fail. Debug faster.
- **Authentication Helpers** - Save/load auth state, manage tokens, reuse sessions across tests.
- **Network Interception** - Mock APIs, block URLs, capture network traffic for debugging.
- **Accessibility Testing** - Built-in a11y checks for heading hierarchy, alt text, form labels.
- **Visual Regression** - Screenshot comparison utilities for visual testing.
- **Environment switching** - Flip between local, test, stage, and prod without changing code.
- **TypeScript strict mode** - Catch bugs before they bite you.
- **Faker.js integration** - Realistic test data that actually looks like real data.
- **CI/CD Ready** - GitHub Actions workflow included, ready to go.

## Getting Started

First things first, install the dependencies:

```bash
npm install
npx playwright install
```

That second command downloads the browsers Playwright needs. It'll take a minute the first time.

## Running Tests

```bash
# Run everything
npm test

# UI mode is my favorite - you can see what's happening and step through tests
npm run test:ui

# See the browser while tests run (useful for debugging)
npm run test:headed

# Run specific test files
npm run test:auth
npm run test:smoke

# Run tests by tags (super useful!)
npm run test:smoke        # Run @smoke tests
npm run test:regression   # Run @regression tests
npm run test:critical     # Run @critical tests
npm run test:api          # Run @api tests
npm run test:fast         # Run fast tests (smoke, excluding flaky/slow)

# Debug mode - pauses execution so you can inspect
npm run test:debug
```

## Environments

The framework switches environments based on the `ENV` variable. By default it uses `local`, but you can override:

```bash
ENV=test npm test      # Test environment
ENV=stage npm test    # Staging
ENV=prod npm test     # Production (be careful!)
```

To change the URLs for each environment, edit `src/config/env.ts`. It's pretty straightforward - just update the URLs object with your actual endpoints.

If you need credentials for tests, you can set them via environment variables:

```bash
TEST_USERNAME=user@example.com TEST_PASSWORD=password123 npm test
```

Or if you need a one-off custom URL:

```bash
BASE_URL=http://my-custom-url.com npm test
```

## Using the Builder Pattern

This is probably my favorite part. Instead of creating test data like this:

```typescript
const user = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'SomePassword123!',
  phone: '555-123-4567'
};
```

You can do this:

```typescript
import { UserBuilder } from '../src/data/builders/userBuilder';

// Faker fills in everything automatically
const user = new UserBuilder().build();

// Or override just what you care about
const admin = new UserBuilder()
  .withEmail('admin@example.com')
  .withPassword('SecurePass123!')
  .build();

// Chain as many overrides as you want
const customUser = new UserBuilder()
  .withFirstName('John')
  .withLastName('Doe')
  .withEmail('john.doe@example.com')
  .withPhone('555-123-4567')
  .build();
```

The builder uses Faker under the hood, so you get realistic data without thinking about it. But when you need something specific, just override it.

### Test Data Factories

We've got builders for more than just users. Use the factory for quick access to common test data:

```typescript
import { TestDataFactory } from '../src/data/factories/testDataFactory';

// Quick admin user
const admin = TestDataFactory.createAdminUser();

// US address
const address = TestDataFactory.createUSAddress();

// In-stock product
const product = TestDataFactory.createInStockProduct();

// Simple order
const order = TestDataFactory.createSimpleOrder();

// Or use builders directly for more control
import { AddressBuilder, ProductBuilder, OrderBuilder } from '../src/data/builders';

const customAddress = new AddressBuilder()
  .withStreet('123 Main St')
  .withCity('Seattle')
  .withState('WA')
  .buildUS();
```

### Seeding for Reproducible Tests

Sometimes tests are flaky and you need to debug them. That's where seeding comes in handy. Set a seed and Faker will generate the same "random" data every time:

```typescript
import { setSeed } from '../src/utils/random';
import { UserBuilder } from '../src/data/builders/userBuilder';

test('debugging a flaky test', () => {
  setSeed(12345); // Same seed = same data every run
  
  const user1 = new UserBuilder().build();
  const user2 = new UserBuilder().build();
  
  // These will have identical random data because of the seed
  // Makes it way easier to reproduce issues
});
```

**When to seed:**
- Debugging flaky tests
- Need reproducible test data for a specific scenario
- Testing edge cases where you need consistent data

**When NOT to seed:**
- Most normal tests (let Faker be random - variety is good)
- Tests where you want different data each run

## Page Objects

Page objects keep your test code clean. Instead of scattering selectors and interactions throughout your tests, you put them in one place.

Here's how you'd use them:

```typescript
import { LoginPage } from '../src/pages/loginPage';
import { DashboardPage } from '../src/pages/dashboardPage';

test('user can log in', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await dashboardPage.verifyLoaded();
});
```

All the messy selector logic lives in the page object, not in your test. Makes tests way easier to read.

### Creating Your Own Page Objects

When you need a new page object, create a file in `src/pages/`:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from '../core/basePage';

export class MyPage extends BasePage {
  // Use getters for locators - they're evaluated fresh each time
  // Helps avoid stale element issues
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

Then use it in your tests:

```typescript
import { MyPage } from '../src/pages/myPage';

test('does something', async ({ page }) => {
  const myPage = new MyPage(page);
  await myPage.goto();
  await myPage.clickMyButton();
});
```

The `BasePage` class gives you some handy helpers like `waitForElement()` and `waitForNetworkIdle()`. Check it out if you need shared functionality.

## Writing Tests

Here's a typical test structure:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/loginPage';
import { UserBuilder } from '../src/data/builders/userBuilder';

test.describe('Authentication', () => {
  test('user can log in with valid credentials', async ({ page }) => {
    // Arrange - set up your test data
    const loginPage = new LoginPage(page);
    const user = new UserBuilder().build();

    // Act - do the thing you're testing
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Assert - verify it worked
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

The Arrange-Act-Assert pattern keeps tests clear. You can skip the comments if the test is obvious, but they help when things get complex.

### Using Test Fixtures (Optional)

If you want even cleaner test code, you can use the extended fixtures. They give you page objects pre-instantiated:

```typescript
import { test, expect } from '../src/fixtures/testFixtures';

test('login flow', async ({ loginPage, dashboardPage }) => {
  // No need to instantiate - fixtures handle it
  await loginPage.goto();
  await loginPage.login('user@example.com', 'pass');
  await dashboardPage.verifyLoaded();
});
```

I don't always use fixtures, but they're nice when you're using the same page objects across multiple tests in a file.

**Bonus:** The fixtures automatically capture screenshots and error context when tests fail. No extra code needed - it just works.

## Test Tags

Tag your tests to organize and filter them easily:

```typescript
import { TestTags } from '../src/utils/tags';

test(`critical login test ${TestTags.SMOKE} ${TestTags.CRITICAL}`, async ({ page }) => {
  // This test will run when you use: npm run test:smoke or npm run test:critical
});
```

Available tags:
- `@smoke` - Quick checks that core functionality works
- `@regression` - Comprehensive tests covering existing functionality
- `@critical` - Must-pass tests for the app to be considered working
- `@api` - API tests (direct API calls, not UI)
- `@ui` - UI tests
- `@slow` - Tests that take a long time
- `@flaky` - Known unstable tests (skip when needed)
- `@skip-ci` - Tests that should only run locally

Run specific tags:
```bash
npm run test:smoke        # Run smoke tests
npm run test:critical     # Run critical tests
npm run test:fast         # Run fast tests (smoke, excluding flaky/slow)
npx playwright test --grep "@smoke|@regression"  # Custom combinations
```

## Error Handling

When tests fail, the framework automatically captures:
- Full-page screenshots
- Page HTML
- Console logs
- Network requests/responses

This happens automatically if you use the extended fixtures. No extra code needed.

For manual error capture:
```typescript
import { captureErrorScreenshot, captureFullErrorContext } from '../src/utils/errorHelpers';

try {
  // your test code
} catch (error) {
  await captureFullErrorContext(page, testInfo, 'my-error');
  throw error;
}
```

## Authentication Helpers

Save time by authenticating once and reusing auth state:

```typescript
import { saveAuthState, getAuthToken, setAuthToken } from '../src/utils/auth';

// Save auth state after logging in
await saveAuthState(context, 'playwright/.auth/user.json');

// Get token for API calls
const token = await getAuthToken(page);

// Set token to bypass login UI
await setAuthToken(page, 'your-token-here');
```

Then use it in Playwright config:
```typescript
use: {
  storageState: 'playwright/.auth/user.json', // Reuse auth
}
```

## Network Interception

Mock APIs or block requests:

```typescript
import { mockApiResponse, blockUrl, waitForApiRequest } from '../src/utils/network';

// Mock an API response
await mockApiResponse(page, '/api/users', {
  status: 200,
  body: { id: 1, name: 'Test User' }
});

// Block analytics or ads
await blockUrl(page, '**/analytics.js');

// Wait for specific API call
await waitForApiRequest(page, '/api/users');
```

## Accessibility Testing

Quick a11y checks:

```typescript
import { runAccessibilityChecks } from '../src/utils/accessibility';

const report = await runAccessibilityChecks(page);
// Returns: { headingHierarchy, imagesWithoutAlt, inputsWithoutLabels }
```

## Visual Regression

Screenshot comparison:

```typescript
import { compareScreenshot, compareElementScreenshot } from '../src/utils/visual';

// Full page comparison
await compareScreenshot(page, 'login-page', 0.1);

// Element-level comparison
await compareElementScreenshot(page, '.header', 'header-element', 0.1);
```

## API Testing

Test APIs directly without UI:

```typescript
import { ApiClient } from '../src/core/apiClient';

test('API test', async ({ request }) => {
  const api = new ApiClient(request);
  
  const response = await api.get('/api/users/1');
  await api.expectSuccess(response);
  
  const user = await response.json();
  expect(user.id).toBe(1);
});
```

See `tests/api.spec.ts` for more examples.

## Project Structure

Here's how things are organized:

```
.
├── src/
│   ├── config/
│   │   └── env.ts              # Environment URLs and config
│   ├── core/
│   │   ├── basePage.ts         # Base class all page objects extend
│   │   └── apiClient.ts        # API client wrapper
│   ├── data/
│   │   ├── builders/           # Builder pattern implementations
│   │   │   ├── userBuilder.ts
│   │   │   ├── addressBuilder.ts
│   │   │   ├── productBuilder.ts
│   │   │   └── orderBuilder.ts
│   │   ├── factories/
│   │   │   └── testDataFactory.ts  # Convenient factory methods
│   │   └── models/             # TypeScript interfaces
│   ├── fixtures/
│   │   └── testFixtures.ts     # Extended Playwright fixtures
│   ├── pages/                  # Page objects
│   │   ├── loginPage.ts
│   │   └── dashboardPage.ts
│   ├── setup/                  # Global setup/teardown
│   │   ├── global-setup.ts
│   │   └── global-teardown.ts
│   └── utils/                  # Utility helpers
│       ├── accessibility.ts    # A11y testing
│       ├── auth.ts             # Auth helpers
│       ├── errorHelpers.ts     # Error capture
│       ├── fileUpload.ts       # File upload helpers
│       ├── logger.ts           # Logging
│       ├── network.ts          # Network interception
│       ├── random.ts           # Faker helpers
│       ├── tags.ts             # Test tags
│       ├── visual.ts           # Visual regression
│       └── wait.ts             # Wait utilities
├── tests/
│   ├── api.spec.ts            # API test examples
│   ├── auth.spec.ts           # Auth test examples
│   └── smoke.spec.ts          # Smoke test examples
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI
├── playwright.config.ts       # Playwright config
├── tsconfig.json              # TypeScript config
└── package.json
```

Pretty standard structure. Page objects in `pages/`, builders in `data/builders/`, utilities in `utils/`, tests in `tests/`. If you need to add something new, follow the pattern.

## Best Practices (Things I Learned the Hard Way)

1. **Use role selectors** - `getByRole()` is way more resilient than CSS selectors. If the design changes but the role stays the same, your test still works.

2. **Wait explicitly** - Don't use arbitrary `waitForTimeout()`. Use `waitForElement()` or `waitForNetworkIdle()`. Your tests will be faster and more reliable.

3. **One test, one thing** - Keep tests focused. If a test fails, you should know exactly what broke.

4. **Use builders** - Don't hardcode test data. Use builders so you can easily create variations.

5. **Keep logic in page objects** - Your tests should read like a story. The implementation details belong in page objects.

6. **Environment config** - Put all environment-specific stuff in `env.ts`. Don't scatter URLs and credentials around your code.

## Troubleshooting

### Tests are flaky

This usually means you're not waiting for things properly. Check:
- Are you using `waitForTimeout()`? Stop that. Use proper waits.
- After clicking something that triggers an API call, use `waitForNetworkIdle()`.
- If you're debugging, try seeding Faker to get reproducible data.

### Can't find elements

- Open DevTools and verify your selectors actually work.
- Use Playwright's codegen: `npx playwright codegen` - it'll help you find the right selectors.
- If the element is in an iframe, you're out of luck (Playwright doesn't support iframes well).

### Environment not switching

- Double-check your `ENV` variable is set correctly.
- Make sure `src/config/env.ts` has the right URLs.
- You can always override with `BASE_URL` if needed.

## CI/CD

The framework includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Runs tests on push/PR
- Uploads test artifacts (reports, screenshots)
- Ready to use out of the box

Just push to GitHub and it runs. Configure your test credentials as GitHub Secrets if needed.

## Global Setup/Teardown

For one-time setup (like authenticating once for all tests), use global setup:

```typescript
// src/setup/global-setup.ts
// Uncomment in playwright.config.ts to enable
```

This authenticates once and saves auth state, so all tests can reuse it without logging in every time.

## Adding New Stuff

When you add features:
- Follow the existing code style (check other files for examples).
- Add page objects for new pages.
- Use builders for test data.
- Tag your tests appropriately.
- Update this README if you add something that others should know about.

## License

MIT - use it however you want.

---

If you run into issues or have questions, feel free to open an issue. I built this to make testing easier, so if something's confusing or could be better, let me know.
