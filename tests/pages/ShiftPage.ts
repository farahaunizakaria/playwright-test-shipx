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

  /**
   * Helper to select dropdown option from visible dropdown only
   */
  private async selectDropdownOption(value: string, waitTime: number = 600) {
    await this.page.waitForTimeout(waitTime);
    
    const result = await this.page.evaluate((optionText) => {
      const visibleDropdown = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
      
      if (!visibleDropdown) {
        return {
          success: false,
          searchedFor: optionText,
          available: [],
          count: 0,
          error: 'No visible dropdown found'
        };
      }
      
      // Only get options from the visible dropdown
      const options = Array.from(visibleDropdown.querySelectorAll('.ant-select-item-option'));
      const availableOptions = options.map(o => o.textContent?.trim());
      
      const targetOption = options.find(opt => 
        opt.textContent?.trim().includes(optionText)
      );
      
      if (targetOption) {
        (targetOption as HTMLElement).click();
        return { success: true, found: targetOption.textContent?.trim() };
      } else {
        return { 
          success: false, 
          searchedFor: optionText,
          available: availableOptions,
          count: options.length
        };
      }
    }, value);
    
    if (!result.success) {
      console.error(`❌ Dropdown selection failed:`);
      console.error(`   Searched for: "${result.searchedFor}"`);
      console.error(`   Found ${result.count} options:`, result.available);
      throw new Error(`Option "${result.searchedFor}" not found. Available: ${result.available?.join(', ') || 'none'}`);
    }
    
    console.log(`✅ Selected: ${result.found}`);
  }

  async navigateToShifts() {
    console.log('🚗 Navigating to Shifts page...');
    
    await this.page.getByRole('button', { name: /transport/i }).click();
    await this.page.waitForTimeout(500);
    
    await this.page.getByRole('menuitem', { name: 'Incentives' }).click();
    await this.page.waitForTimeout(500);
    
    await this.page.getByRole('menuitem', { name: 'Shifts' }).click();
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
    
    const createButton = this.page.getByRole('button', { name: 'plus', exact: true }); ////no explicit ID available
    await createButton.waitFor({ state: 'visible', timeout: 5000 });
    await createButton.click();

// In create-shift-button.tsx
// <Tooltip title="Create shift">
//   <Button 
//     id="create-shift-button"  // ← Add this ID
//     shape="circle" 
//     onClick={toggleModal} 
//     icon={<PlusOutlined />} 
//   />
// </Tooltip>
    
    await this.page.waitForTimeout(800);
    
    console.log('✅ Shift creation modal opened');
  }

  async selectDriver(driverName: string) {
    console.log(`👤 Selecting driver: ${driverName}...`);
    
    await this.page.waitForTimeout(1000);
    
    await this.page.locator('#driverUuid').click();
    await this.page.waitForTimeout(300);
    await this.selectDropdownOption(driverName);
  }

  async selectVehicle(vehicleCode: string) {
    console.log(`🚙 Selecting vehicle: ${vehicleCode}...`);
    
    await this.page.locator('#vehicleUuid').click();
    await this.page.waitForTimeout(300);
    await this.selectDropdownOption(vehicleCode);
  }

  async selectShiftDate(date: string) {
    console.log(`📅 Selecting shift date: ${date}...`);
    
    const datePicker = this.page.locator('#start');
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
    
    const updateDialog = this.page.getByRole('dialog').filter({ hasText: /Update Shift/ });
    await updateDialog.waitFor({ state: 'visible', timeout: 15000 });
    
    console.log('✅ Shift created successfully');
  }

  async addIncentive(incentiveData: IncentiveData) {
    console.log(`💰 Adding incentive: ${incentiveData.incentiveType} (${incentiveData.amount})...`);
    
    //await this.page.locator('.anticon-plus-circle').first().click();
    await this.page.locator('button:has(.anticon-plus-circle)').click()
    await this.page.waitForTimeout(600);
    
    // Scope to the modal dialog to avoid ambiguity
    const modal = this.page.getByRole('dialog', { name: 'Create Incentive' });  

    //const incentiveField = this.page.locator('div').filter({ hasText: /^Search an incentive type\.\.\.$/ }).nth(4);
    const incentiveField= modal.locator('#incentive-type-selector');
    await incentiveField.click();
    await this.page.waitForTimeout(500);
    
    const incentiveOption = this.page.getByText(incentiveData.incentiveType, { exact: true });
    await incentiveOption.click();
    await this.page.waitForTimeout(600);
    
    await this.page.locator('#amount').click();
    await this.page.locator('#amount').fill(incentiveData.amount.toString());
    await this.page.waitForTimeout(600);
    
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.waitForTimeout(1000);
    
    console.log(`✅ Incentive added: ${incentiveData.incentiveType} - Amount: ${incentiveData.amount}`);
  }

  async closeShift() {
    console.log('🔒 Closing shift...');
    
    await this.page.getByRole('button', { name: 'Close Shift' }).click(); //no explicit ID available
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
    
    await this.page.locator('span:nth-child(6)').click();
    await this.page.waitForTimeout(600);
    
    await this.page.getByRole('button', { name: 'Yes' }).click();
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Shift canceled');
  }
}
