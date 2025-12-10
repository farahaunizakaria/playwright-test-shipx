import { Page, Locator } from '@playwright/test';

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
}
