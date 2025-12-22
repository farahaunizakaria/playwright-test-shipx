import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ShiftPage } from '../pages/ShiftPage';

test.describe('Shift Management Tests', () => {
  let loginPage: LoginPage;
  let shiftPage: ShiftPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    shiftPage = new ShiftPage(page);

    // Login before each test with test credentials and company selection
    await loginPage.loginWithTestCredentialsAndCompany();
    await page.waitForTimeout(1000);
    
    // Navigate to shifts page before each test (ensures consistent starting state)
    await shiftPage.navigateToShifts();
    await shiftPage.searchShifts();
  });

  test('should create a new shift with incentive and approve it', async ({ page }) => {
    console.log('📌 Test: Create Shift with Incentive and Approve');

    // Create a new shift
    const shiftData = {
      driver: 'Alexandre - Alexandre',
      vehicle: 'TRN3202C - TRN3202C',
      shiftDate: '22',
      remarks: 'Automated Testing 22/12',
    };

    await shiftPage.createShift(shiftData);

    // Add incentive
    const incentiveData = {
      incentiveType: 'INC0100 - JOB INCENTIVE',
      amount: 50,
    };

    await shiftPage.addIncentive(incentiveData);
    
    // Close shift before approval
    await shiftPage.closeShift();

    // Approve the shift
    await shiftPage.approveShift();

    console.log('✅ Test passed: Shift created, incentive added, and shift approved');
  });

  test('should create shift, add incentive, close, and cancel shift', async ({ page }) => {
    console.log('📌 Test: Create Shift and Cancel');

    // Create a new shift - using Alek/TRN3202E with date 21 (from codegen)
    const shiftData = {
      driver: 'Alek - Alek',
      vehicle: 'TRN3202E - TRN3202E',
      shiftDate: '21',
      remarks: 'Automated Testing Cancel 21/12',
    };

    await shiftPage.createShift(shiftData);

    // Add incentive
    const incentiveData = {
      incentiveType: 'INC0100 - JOB INCENTIVE',
      amount: 15,
    };

    await shiftPage.addIncentive(incentiveData);
    
    // Close shift before cancellation
    await shiftPage.closeShift();

    // Cancel the shift
    await shiftPage.cancelShift();

    console.log('✅ Test passed: Shift created and canceled');
  });

});
