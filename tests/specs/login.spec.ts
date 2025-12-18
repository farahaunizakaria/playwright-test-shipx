import { test, expect } from '../fixtures/fixtures';

//TEST 1: LOGIN AUTH
test.describe('Login ', () => {
  
  test('should login successfully with valid credentials', async ({ loginPage, page }) => {
    // Navigate to login page
    await loginPage.navigateToLogin();

    // Verify we're on the login page
    await expect(page).toHaveURL(/sign-in/);

    // Perform login
    await loginPage.loginWithTestCredentials();

    // Verify successful login - update URL pattern based on actual redirect
    await expect(page).toHaveURL(/filter/);
    
    // Add additional verification for successful login
    // Example: Check for user profile, dashboard elements, etc.
  });

  test('should complete login flow step by step', async ({ loginPage, page }) => {
    await loginPage.navigateToLogin();

    // Click proceed button
    await loginPage.clickProceed();

    // Verify email and password fields are visible
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();

    // Enter credentials from .env file
    await loginPage.enterEmail(process.env.BOT_EMAIL!);
    await loginPage.enterPassword(process.env.BOT_PASSWORD!);

    // Click login
    await loginPage.clickLogin();

    // Wait for navigation after login
    await page.waitForLoadState('networkidle');

    // Automatically select company from environment variable
    await loginPage.selectCompanyFromEnv();

    // Verify successful login with correct company
    await expect(page).toHaveURL(/filter/);
    
    // Test exits immediately after company selection ✅
  });

  test('should show error with invalid credentials', async ({ loginPage, page }) => {
    await loginPage.navigateToLogin();
    await loginPage.clickProceed();

    // Try to login with invalid credentials
    await loginPage.enterEmail('invalid@example.com');
    await loginPage.enterPassword('wrongpassword');
    await loginPage.clickLogin();

    // Verify error message is displayed
    await expect(page.getByText(/wrong email or password/i)).toBeVisible();
  });

  test('should show validation error for empty email', async ({ loginPage, page }) => {
    await loginPage.navigateToLogin();
    await loginPage.clickProceed();

    // Try to login without email
    await loginPage.enterPassword('somepassword');
    await loginPage.clickLogin();

    // Verify validation error
    await expect(page.getByText(/please enter an email address/i)).toBeVisible();
  });

  test('should show validation error for empty password', async ({ loginPage, page }) => {
    await loginPage.navigateToLogin();
    await loginPage.clickProceed();

    // Try to login without password
    await loginPage.enterEmail('test@example.com');
    await loginPage.clickLogin();

    // Verify validation error
    await expect(page.getByText(/password.*required/i)).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ loginPage, page }) => {
    await loginPage.navigateToLogin();
    
    // Click proceed button to get to the login form
    await loginPage.clickProceed();
    
    // Click forgot password link
    const forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    await forgotPasswordLink.click();

    // Verify navigation to forgot password page
    await expect(page).toHaveURL(/forgot-password|reset-password/i);
  });

});
