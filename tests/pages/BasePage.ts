import { Page, Locator } from '@playwright/test';

/**
 * BasePage class contains common resuable methods and properties
 * follows DRY principle + inheritance
 */
export class BasePage {
  readonly page: Page;
  
  // Static property to store the latest booking ID across test instances
  // ⚠️ AUTO-UPDATED by test runs - modify the value below to test with a specific booking
  private static latestBookingId: string | null = '_SEID260048'; // Last updated: 2026-01-06 // Last updated: 2026-01-06 // Last updated: 2026-01-06 // Last updated: 2026-01-06 // Last updated: 2026-01-06 // Last updated: 2026-01-05 // Last updated: 2026-01-05 // Last updated: 2026-01-02 // Last updated: 2026-01-02 // Last updated: 2026-01-02 // Last updated: 2026-01-02 // Last updated: 2026-01-02 // Last updated: 2026-01-02 // Last updated: 2026-01-02
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
   * Static method to save booking ID in memory AND update the source file
   * Can be called without creating an instance
   * @param bookingId - The booking ID to save
   */
  static saveLatestBookingId(bookingId: string): void {
    BasePage.latestBookingId = bookingId;
    console.log(`💾 Saved booking ID: ${bookingId}`);
    
    // Auto-update the source file with the new booking ID
    BasePage.updateSourceFile(bookingId);
  }
  
  /**
   * Update BasePage.ts source file with the latest booking ID
   * This allows update-leg.spec.ts to run independently
   */
  private static updateSourceFile(bookingId: string): void {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, 'BasePage.ts');
      
      let content = fs.readFileSync(filePath, 'utf-8');
      const today = new Date().toISOString().split('T')[0];
      
      // Replace the latestBookingId line (matches empty string, null, or any booking ID)
      const pattern = /private static latestBookingId: string \| null = (?:'[^']*'|null|'');/;
      const replacement = `private static latestBookingId: string | null = '${bookingId}'; // Last updated: ${today}`;
      
      content = content.replace(pattern, replacement);
      fs.writeFileSync(filePath, content, 'utf-8');
      
      console.log(`✏️ Auto-updated BasePage.ts with booking ID: ${bookingId}`);
    } catch (error) {
      console.warn(`⚠️ Could not auto-update BasePage.ts:`, error);
    }
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
