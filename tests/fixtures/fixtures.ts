import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * Define custom fixtures that extend Playwright's base test
 * This allows us to:
 * 1. Automatically initialize page objects
 * 2. Reuse authenticated sessions across tests
 * 3. Set up common test prerequisites
 */

type MyFixtures = {
  loginPage: LoginPage;
  authenticatedPage: Page; // Page that's already logged in
};

/**
 * Extend base test with custom fixtures
 */
export const test = base.extend<MyFixtures>({
  // LoginPage fixture - automatically create LoginPage instance
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.loginWithTestCredentialsAndCompany(); // This now includes company selection from .env
    
    // Wait for successful login and company selection
    await page.waitForURL(/filter/, { timeout: 15000 });
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
