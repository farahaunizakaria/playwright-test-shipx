import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ShiftPage } from '../pages/ShiftPage';

const INCENTIVE_TYPE = 'INC0100 - JOB INCENTIVE';

test.describe('Shift Management Tests (Independent)', () => {
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
      shiftDate: '05',
      remarks: 'Automated Testing 06/1',
    };

    await shiftPage.createShift(shiftData);
    await shiftPage.addIncentive({ incentiveType: INCENTIVE_TYPE, amount: 50 });
    await shiftPage.closeShift();
    await shiftPage.approveShift();

    console.log('✅ Test passed: Shift created, incentive added, and shift approved');
  });

  test('should create shift, add incentive, close, and cancel shift', async ({ page }) => {
    console.log('📌 Test: Create Shift and Cancel');

    const shiftData = {
      driver: 'Alek - Alek',
      vehicle: 'TRN3202E - TRN3202E',
      shiftDate: '05',
      remarks: 'Automated Testing Cancel 06/1',
    };

    await shiftPage.createShift(shiftData);
    await shiftPage.addIncentive({ incentiveType: INCENTIVE_TYPE, amount: 15 });
    await shiftPage.closeShift();
    await shiftPage.cancelShift();

    console.log('✅ Test passed: Shift created and canceled');
  });

});
