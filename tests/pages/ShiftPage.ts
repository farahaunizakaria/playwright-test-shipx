import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ShiftData interface for creating a shift
 */
interface ShiftData {
  driver: string;
  vehicle: string;
  shiftDate: string;
  remarks: string;
}

interface IncentiveData {
  incentiveType: string;
  amount: number;
}

/**
 * ShiftPage - Handles all shift management operations
 */
export class ShiftPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToShifts() {
    console.log('🚗 Navigating to Shifts page...');
    
    await this.page.getByRole('button', { name: 'Transport down' }).click();
    await this.page.waitForTimeout(500);
    
    await this.page.getByRole('menuitem', { name: 'Incentives right' }).click();
    await this.page.waitForTimeout(500);
    
    await this.page.getByRole('link', { name: 'Shifts' }).click();
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Successfully navigated to Shifts page');
  }

  async searchShifts() {
    console.log('🔍 Searching for shifts...');
    
    const searchButton = this.page.getByRole('button', { name: 'Search' });
    await searchButton.waitFor({ state: 'visible', timeout: 5000 });
    await searchButton.click();
    
    await this.page.waitForTimeout(1500);
    console.log('✅ Shifts list displayed');
  }

  async openShiftCreationModal() {
    console.log('➕ Opening shift creation modal...');
    
    const createButton = this.page.getByRole('button', { name: 'plus', exact: true });
    await createButton.waitFor({ state: 'visible', timeout: 5000 });
    await createButton.click();
    
    await this.page.waitForTimeout(800);
    console.log('✅ Shift creation modal opened');
  }

  async selectDriver(driverName: string) {
    console.log(`👤 Selecting driver: ${driverName}...`);
    
    const driverField = this.page.locator('div').filter({ hasText: /^Search a driver\.\.\.$/ }).nth(4);
    await driverField.waitFor({ state: 'visible', timeout: 5000 });
    await driverField.click();
    await this.page.waitForTimeout(1000);
    
    const driverOption = this.page.locator('div').filter({ hasText: new RegExp(`^${driverName}`) }).first();
    await driverOption.waitFor({ state: 'visible', timeout: 8000 });
    await driverOption.click();
    await this.page.waitForTimeout(600);
    
    console.log(`✅ Driver selected: ${driverName}`);
  }

  async selectVehicle(vehicleCode: string) {
    console.log(`🚙 Selecting vehicle: ${vehicleCode}...`);
    
    const vehicleField = this.page.locator('div').filter({ hasText: /^Search a vehicle\.\.\.$/ }).nth(4);
    await vehicleField.waitFor({ state: 'visible', timeout: 5000 });
    await vehicleField.click();
    await this.page.waitForTimeout(500);
    
    const vehicleOption = this.page.locator('div').filter({ hasText: new RegExp(`^${vehicleCode}`) }).first();
    await vehicleOption.waitFor({ state: 'visible', timeout: 5000 });
    await vehicleOption.click();
    await this.page.waitForTimeout(600);
    
    console.log(`✅ Vehicle selected: ${vehicleCode}`);
  }

  async selectShiftDate(date: string) {
    console.log(`📅 Selecting shift date: ${date}...`);
    
    const datePicker = this.page.locator('.ant-picker.ant-picker-outlined.css-15nz02x.w-full');
    await datePicker.waitFor({ state: 'visible', timeout: 5000 });
    await datePicker.click();
    await this.page.waitForTimeout(600);
    
    const dateOption = this.page.getByText(date, { exact: true }).first();
    await dateOption.waitFor({ state: 'visible', timeout: 5000 });
    await dateOption.click();
    await this.page.waitForTimeout(600);
    
    const okButton = this.page.getByRole('button', { name: 'OK' }).nth(2);
    await okButton.waitFor({ state: 'visible', timeout: 5000 });
    await okButton.click();
    await this.page.waitForTimeout(600);
    
    console.log(`✅ Shift date selected: ${date}`);
  }

  async fillRemarks(remarks: string) {
    console.log(`📝 Filling remarks: ${remarks}...`);
    
    const remarksField = this.page.getByRole('textbox', { name: 'Remarks :' });
    await remarksField.waitFor({ state: 'visible', timeout: 5000 });
    await remarksField.click();
    await remarksField.fill('');
    await this.page.waitForTimeout(300);
    await remarksField.fill(remarks);
    await this.page.waitForTimeout(600);
    
    console.log(`✅ Remarks filled: ${remarks}`);
  }

  async submitShiftForm() {
    console.log('📤 Submitting shift form...');
    
    const submitButton = this.page.getByRole('button', { name: 'OK', exact: true });
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    
    // Wait for React form validation
    for (let i = 0; i < 20; i++) {
      const disabled = await submitButton.evaluate((el: HTMLButtonElement) => el.disabled);
      if (!disabled) break;
      await this.page.waitForTimeout(500);
    }
    
    await submitButton.click();
    await this.page.waitForTimeout(3000);
    
    console.log('✅ Shift form submitted');
  }

  async createShift(shiftData: ShiftData) {
    console.log('🔧 Creating new shift...');
    
    await this.openShiftCreationModal();
    await this.selectDriver(shiftData.driver);
    await this.selectVehicle(shiftData.vehicle);
    await this.selectShiftDate(shiftData.shiftDate);
    await this.fillRemarks(shiftData.remarks);
    await this.submitShiftForm();

    await this.page.waitForTimeout(2000);
    
    const updateButton = this.page.getByRole('button', { name: 'Update Shift' });
    await updateButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Shift created successfully');
  }

  async addIncentive(incentiveData: IncentiveData) {
    console.log(`💰 Adding incentive: ${incentiveData.incentiveType} (${incentiveData.amount})...`);
    
    await this.page.locator('.anticon-plus-circle').first().click();
    await this.page.waitForTimeout(600);
    
    const incentiveField = this.page.locator('div').filter({ hasText: /^Search an incentive type\.\.\.$/ }).nth(4);
    await incentiveField.click();
    await this.page.waitForTimeout(500);
    
    const incentiveOption = this.page.getByText(incentiveData.incentiveType, { exact: true });
    await incentiveOption.click();
    await this.page.waitForTimeout(600);
    
    const amountField = this.page.getByRole('spinbutton', { name: '* Amount' });
    await amountField.click();
    await amountField.fill(incentiveData.amount.toString());
    await this.page.waitForTimeout(600);
    
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.waitForTimeout(1000);
    
    console.log(`✅ Incentive added: ${incentiveData.incentiveType} - Amount: ${incentiveData.amount}`);
  }

  async closeShift() {
    console.log('🔒 Closing shift...');
    
    await this.page.getByRole('button', { name: 'Close Shift' }).click();
    await this.page.waitForTimeout(1200);
    
    console.log('✅ Shift closed');
  }

  async approveShift() {
    console.log('✔️ Approving shift...');
    
    await this.page.locator('.anticon.anticon-check-circle > svg').first().click();
    await this.page.waitForTimeout(600);
    
    await this.page.getByRole('button', { name: 'Yes' }).click();
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Shift approved');
  }

  async cancelShift() {
    console.log('❌ Canceling shift...');
    
    // WORKING: Use span:nth-child(6) from codegen
    await this.page.locator('span:nth-child(6)').click();
    await this.page.waitForTimeout(600);
    
    await this.page.getByRole('button', { name: 'Yes' }).click();
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Shift canceled');
  }
}
