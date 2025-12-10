import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
//import { BookingPage } from '../pages/BookingPage_ref';
//import { InvoicePage } from '../pages/InvoicePage';

/**
 * Define custom fixtures that extend Playwright's base test
 * This allows us to:
 * 1. Automatically initialize page objects
 * 2. Reuse authenticated sessions across tests
 * 3. Set up common test prerequisites
 */

type MyFixtures = {
  loginPage: LoginPage;
  //bookingPage: BookingPage;
  //invoicePage: InvoicePage;
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

  // BookingPage fixture - automatically create BookingPage instance
  // bookingPage: async ({ page }, use) => {
  //   const bookingPage = new BookingPage(page);
  //   await use(bookingPage);
  // },

  // InvoicePage fixture - automatically create InvoicePage instance
  // invoicePage: async ({ page }, use) => {
  //   const invoicePage = new InvoicePage(page);
  //   await use(invoicePage);
  // },

  /**
   * Fixture that provides an already authenticated page
   * Use this fixture for ALL tests that require user to be logged in
   * 
   * Usage with any page object:
   * test('create booking', async ({ authenticatedPage }) => {
   *   const bookingPage = new BookingPage(authenticatedPage);
   *   await bookingPage.navigateToBookings();
   *   await bookingPage.clickCreateBooking();
   * });
   */
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
