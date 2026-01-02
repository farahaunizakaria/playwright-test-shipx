import { Page, Locator } from '@playwright/test';

/**
 * BasePage class contains common resuable methods and properties
 * follows DRY principle + inheritance
 */
export class BasePage {
  readonly page: Page;
  
  // Static property to store the latest booking ID across test instances
  // Current value: To view/modify, access via BasePage.readLatestBookingId() or set via BasePage.saveLatestBookingId('YOUR_ID')
  private static latestBookingId: string | null = null; 
  //private static latestBookingId: string | null = null = '_SEID260004'

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
   * Static method to save booking ID in memory
   * Can be called without creating an instance
   * @param bookingId - The booking ID to save
   */
  static saveLatestBookingId(bookingId: string): void {
    BasePage.latestBookingId = bookingId;
    console.log(`💾 Saved booking ID: ${bookingId}`);
  }

  /**
   * Static method to read the latest booking ID from memory
   * Can be called without creating an instance
   * @returns The booking ID or null if not set
   */
  static readLatestBookingId(): string | null {
    if (!BasePage.latestBookingId) {
      console.warn('⚠️ No booking ID found in memory');
      return null;
    }
    
    console.log(`📋 Retrieved booking ID: ${BasePage.latestBookingId}`);
    return BasePage.latestBookingId;
  }

  /**
   * Save booking ID to memory
   * @param bookingId - The booking ID to save
   */
  saveLatestBookingId(bookingId: string): void {
    BasePage.saveLatestBookingId(bookingId);
  }

  /**
   * Read the latest booking ID from memory
   * @returns The booking ID or null if not set
   */
  getLatestBookingId(): string | null {
    return BasePage.readLatestBookingId();
  }

  /**
   * Navigate to a booking by ID from memory
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
