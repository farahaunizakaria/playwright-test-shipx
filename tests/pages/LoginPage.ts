import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage - Page Object Model for authentication
 */
export class LoginPage extends BasePage {
  // Selectors
  private readonly proceedButton: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.proceedButton = page.getByRole('button', { name: 'Proceed' });
    this.emailInput = page.getByRole('textbox', { name: 'Email address' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Log in' });
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.goto('/auth/sign-in');
    await this.waitForPageLoad();
  }

  /**
   * Click the Proceed button
   */
  async clickProceed() {
    await this.click(this.proceedButton);
  }

  /**
   * Enter email address
   * @param email - Email to enter
   */
  async enterEmail(email: string) {
    await this.emailInput.click();
    await this.fill(this.emailInput, email);
  }

  /**
   * Enter password
   * @param password - Password to enter
   */
  async enterPassword(password: string) {
    await this.passwordInput.click();
    await this.fill(this.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLogin() {
    await this.click(this.loginButton);
  }

  /**
   * Select company from dropdown/list after login
   * @param companyName - Name of the company to select
   */
  async selectCompany(companyName: string) {
    // Wait for company selection page/modal to appear
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1500);
    
    console.log(`Attempting to select company: "${companyName}"`);
    
    // The company selection UI shows parent companies and their sub-companies
    // Based on codegen: need to click parent first, then the specific company
    
    try {
      // Extract the base company name (without "Testing" suffix if present)
      // E.g., "Another Base Company Testing" -> look for "Another Base Company" first
      const baseCompanyName = companyName.replace(/\s+Testing$/, '');
      
      // Step 1: Click the parent/base company name to expand options
      await this.page.getByText(baseCompanyName).first().click({ timeout: 10000 });
      await this.page.waitForTimeout(300);
      
      // Step 2: Click the specific company name
      await this.page.getByText(companyName, { exact: true }).click({ timeout: 10000 });
      
      // Wait for navigation after company selection
      await this.page.waitForURL(/filter/, { timeout: 15000 });
      
      console.log(`Successfully selected company: "${companyName}"`);
    } catch (error) {
      console.error(`Failed to select company "${companyName}":`, error);
      throw error;
    }
  }

  /**
   * Select company from environment variable
   */
  async selectCompanyFromEnv() {
    const companyName = process.env.BASE_COMPANY || 'Another Base Company Testing';
    console.log(`BASE_COMPANY from env: "${companyName}"`);
    await this.selectCompany(companyName);
  }

  /**
   * Complete login flow
   * @param email - Email address
   * @param password - Password
   */
  async login(email: string, password: string) {
    await this.navigateToLogin();
    await this.clickProceed();
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLogin();
    await this.waitForPageLoad();
  }

  /**
   * Complete login flow with company selection
   * @param email - Email address
   * @param password - Password
   * @param companyName - Company to select (optional, uses env if not provided)
   */
  async loginWithCompany(email: string, password: string, companyName?: string) {
    await this.login(email, password);
    if (companyName) {
      await this.selectCompany(companyName);
    } else {
      await this.selectCompanyFromEnv();
    }
  }

  /**
   * Login with default test credentials from environment
   */
  async loginWithTestCredentials() {
    const email = process.env.BOT_EMAIL || 'swiftautomatedtestingdonotremove@swiftlogistics.com.my';
    const password = process.env.BOT_PASSWORD || 'pl@ywr!ghtBOT';
    await this.login(email, password);
  }

  /**
   * Login with test credentials and select company from environment
   */
  async loginWithTestCredentialsAndCompany() {
    const email = process.env.BOT_EMAIL || 'swiftautomatedtestingdonotremove@swiftlogistics.com.my';
    const password = process.env.BOT_PASSWORD || 'pl@ywr!ghtBOT';
    await this.loginWithCompany(email, password);
  }
}
