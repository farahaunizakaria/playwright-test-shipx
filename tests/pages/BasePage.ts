import { Page, Locator } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';

/**
 * BasePage class contains common resuable methods and properties
 * follows DRY principle + inheritance
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param path - Relative path from baseURL
   */
  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for a specific element to be visible
   * @param locator - The element locator
   */
  async waitForElement(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
  }

  /**
   * Click an element
   * @param locator - The element locator
   */
  async click(locator: Locator) {
    await locator.click();
  }

  /**
   * Fill text into an input field
   * @param locator - The element locator
   * @param text - Text to fill
   */
  async fill(locator: Locator, text: string) {
    await locator.fill(text);
  }

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Take a screenshot
   * @param name - Screenshot filename
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Read the latest booking ID from file
   * @returns The booking ID or null if file doesn't exist
   */
  getLatestBookingId(): string | null {
    const filePath = 'latest-booking-id.txt';
    
    if (!existsSync(filePath)) {
      console.warn('⚠️ latest-booking-id.txt not found');
      return null;
    }

    try {
      const bookingId = readFileSync(filePath, 'utf-8').trim();
      console.log(`📋 Read booking ID from file: ${bookingId}`);
      return bookingId;
    } catch (error) {
      console.error(`❌ Error reading booking ID: ${error}`);
      return null;
    }
  }

  /**
   * Navigate to a booking by ID from the latest-booking-id.txt file
   */
  async navigateToLatestBooking() {
    const bookingId = this.getLatestBookingId();
    
    if (!bookingId) {
      throw new Error('No booking ID available. Run create-booking test first.');
    }

    await this.goto(`/bookings/${bookingId}`);
    await this.waitForPageLoad();
    console.log(`✅ Navigated to booking: ${bookingId}`);
  }
}
