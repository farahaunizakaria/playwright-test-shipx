# Playwright Test Suite - ShipX Staging

This test suite uses Page Object Model (POM) pattern with **storage state** for optimized authentication.

## 🚀 Optimized Authentication

Login happens **once** before all tests run, then the session is reused across all tests for faster execution.

### How It Works

1. **Setup runs once** (`tests/setup/auth.setup.ts`)
   - Logs in and saves session to `playwright/.auth/user.json`
2. **All tests reuse session** (via `storageState` in `playwright.config.ts`)
   - No need to log in for each test
   - Much faster test execution

## Structure

```
tests/
├── setup/
│   └── auth.setup.ts        # One-time login setup
├── fixtures/
│   └── fixtures.ts          # Custom fixtures for page objects
├── pages/
│   ├── BasePage.ts          # Base class with common methods
│   ├── LoginPage.ts         # Login functionality
│   ├── BookingPage.ts       # Booking operations
│   └── InvoicePage.ts       # Invoice operations
├── login.spec.ts            # Login/authentication tests
├── booking.spec.ts          # Booking feature tests (example)
└── invoice.spec.ts          # Invoice feature tests (example)
```

## Usage Pattern

All feature tests are automatically authenticated - just use `page`:

```typescript
import { test, expect } from './fixtures/fixtures';
import { BookingPage } from './pages/BookingPage';

test.describe('Booking Tests', () => {
  test('should create booking', async ({ page }) => {
    // ✅ User is already logged in via storageState
    const bookingPage = new BookingPage(page);
    await bookingPage.navigateToBookings();
    await bookingPage.clickCreateBooking();
    // ... test logic
  });
});
```

## Adding New Feature Tests

### Step 1: Create Page Object (if needed)
```typescript
// tests/pages/TransportPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TransportPage extends BasePage {
  private readonly createButton: Locator;

  constructor(page: Page) {
    super(page);
    this.createButton = page.getByRole('button', { name: /create/i });
  }

  async navigateToTransport() {
    await this.goto('/transport');
  }

  async clickCreate() {
    await this.click(this.createButton);
  }
}
```

### Step 2: Create Test File
```typescript
// tests/transport.spec.ts
import { test, expect } from './fixtures/fixtures';
import { TransportPage } from './pages/TransportPage';

test.describe('Transport Tests', () => {
  test('should create transport', async ({ page }) => {
    // ✅ User is already logged in via storageState
    const transportPage = new TransportPage(page);
    await transportPage.navigateToTransport();
    await transportPage.clickCreate();
    // ... test logic
  });
});
```

That's it! No fixtures to add, no login logic needed.

## Environment Variables

Create `.env` file in project root:

```env
BOT_EMAIL=your-test-email@example.com
BOT_PASSWORD=your-test-password
BASE_COMPANY=Your Company Name
```

## Running Tests

```bash
yarn test              # Run all tests (setup runs automatically first)
yarn test:ui           # Run with UI mode
yarn test:headed       # Run in headed mode (see browser)
yarn test:debug        # Debug mode
yarn codegen           # Generate code/selectors
```

## Benefits of Storage State Approach

1. ✅ **Login once** - Setup runs once before all tests
2. ✅ **Faster execution** - No repeated login for each test
3. ✅ **Simpler code** - No fixture complexity, just use `page`
4. ✅ **Scalable** - Add unlimited tests without performance impact
5. ✅ **Isolated tests** - Each test still gets fresh page, just reuses auth

## Best Practices

1. ✅ Use `yarn codegen` to capture accurate selectors
2. ✅ Follow POM pattern - keep page logic in page objects
3. ✅ Keep tests focused - one test should test one thing
4. ✅ Use meaningful test names
5. ✅ Always verify expected outcomes with assertions
