import { Page } from "@playwright/test";
import { BookingData } from "../data/BookingData";

/**
 * BookingPageCodegen - Page Object Model based on actual Playwright Codegen
 * 
 * Restructured from working codegen with:
 * - Real, tested selectors from actual booking form
 * - Clear step-by-step flow
 * - Simplified without unnecessary retry logic
 * - Proper waits between interactions
 */
export class BookingPageCodegen {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Helper to select dropdown option from VISIBLE dropdown only
     * Scopes to the currently open dropdown to avoid selecting from hidden ones
     */
    private async selectDropdownOption(value: string, waitTime: number = 600) {
        // Wait for dropdown options to load
        await this.page.waitForTimeout(waitTime);
        
        const result = await this.page.evaluate((optionText) => {
            // Find the visible dropdown (not hidden)
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

    /**
     * Create a new booking using proven selectors from actual codegen
     */
    async createBooking(data: BookingData) {
        console.log('📋 Starting booking creation...');
        
        // Click "New Booking" button
        console.log('1️⃣ Clicking "New Booking"...');
        await this.page.getByRole('link', { name: 'plus New Booking' }).click();
        await this.page.waitForLoadState('domcontentloaded');
        
        // ========== STEP 1: BOOKING DETAILS ==========
        console.log('2️⃣ Step 1: Booking Details');
        
        // Billing Customer
        console.log('   - Billing Customer...');
        await this.page.locator('.ant-select-selection-search').first().click();
        await this.page.waitForTimeout(600);
        await this.selectDropdownOption(data.billingCustomer);
        
        // Booking Type
        console.log('   - Booking Type...');
        await this.page.locator('div').filter({ hasText: /^Select booking type\.\.\.$/}).nth(3).click();
        await this.page.waitForTimeout(600);
        await this.selectDropdownOption(data.bookingType);
        
        // Department
        console.log('   - Department...');
        await this.page.locator('div:nth-child(2) > div > .ant-col.ant-col-18 > .ant-form-item-control > .ant-form-item-children > .ant-select > .ant-select-selector > .ant-select-selection-wrap > .ant-select-selection-search').first().click();
        await this.page.waitForTimeout(600);
        await this.selectDropdownOption(data.department);
        
        // Shipper Ref
        console.log('   - Shipper Ref...');
        await this.page.locator('[id="details.shipperRef"]').click();
        await this.page.locator('[id="details.shipperRef"]').fill(data.shipperRef);
        
        // Customer Ref
        console.log('   - Customer Ref...');
        await this.page.locator('[id="details.customerRef"]').click();
        await this.page.locator('[id="details.customerRef"]').fill(data.customerRef);
        
        // Remarks
        console.log('   - Remarks...');
        await this.page.getByRole('textbox', { name: 'Remarks:' }).click();
        await this.page.getByRole('textbox', { name: 'Remarks:' }).fill(data.remarks);
        
        // Load Type
        console.log('   - Load Type...');
        await this.page.locator('div:nth-child(7) > .ant-col.ant-col-18 > .ant-form-item-control > .ant-form-item-children > .ant-select > .ant-select-selector > .ant-select-selection-wrap > .ant-select-selection-search').click();
        await this.page.waitForTimeout(600);
        await this.selectDropdownOption(data.loadType);
        
        // Customer SO
        console.log('   - Customer SO...');
        await this.page.locator('[id="details.customerSo"]').click();
        await this.page.locator('[id="details.customerSo"]').fill(data.customerSo);
        
        // References
        console.log('   - References...');
        await this.page.locator('[id="details.references"]').click();
        await this.page.locator('[id="details.references"]').fill(data.references);
        
        // Quotation
        console.log('   - Quotation...');
        await this.page.locator('div:nth-child(10) > .ant-col.ant-col-18 > .ant-form-item-control > .ant-form-item-children > .ant-select > .ant-select-selector > .ant-select-selection-wrap > .ant-select-selection-search').click();
        await this.page.waitForTimeout(600);
        await this.selectDropdownOption(data.quotation);
        
        // Navigate to Step 2
        console.log('   ✅ Step 1 complete, moving to Step 2...');
        await this.page.getByRole('button', { name: 'Next right' }).nth(1).click();
        await this.page.waitForLoadState('domcontentloaded');
        
        // ========== STEP 2: JOB DETAILS ==========
        console.log('3️⃣ Step 2: Job Details');
        
        // Job Type
        console.log('   - Job Type...');
        await this.page.locator('.ant-col.ant-form-item-control-wrapper.ant-col-xs-24 > .ant-form-item-control > .ant-form-item-children > .ant-select > .ant-select-selector > .ant-select-selection-wrap > .ant-select-selection-search').first().click();
        await this.page.waitForTimeout(300);
        await this.page.locator('div').filter({ hasText: /^DOMESTIC$/ }).nth(2).click();
        
        // Measurement Type (click "None" first)
        console.log('   - Measurement Type...');
        await this.page.getByText('None').click();
        await this.page.waitForTimeout(300);
        await this.page.getByText(data.measurementType, { exact: true }).click();
        
        // Quantity
        console.log('   - Quantity...');
        await this.page.getByRole('textbox', { name: 'Enter text' }).click();
        await this.page.getByRole('textbox', { name: 'Enter text' }).fill(data.quantity);
        
        // UOM
        console.log('   - UOM...');
        await this.page.locator('#details-uom').click();
        await this.page.waitForTimeout(600);
        await this.selectDropdownOption(data.uom);
        
        // From Company
        console.log('   - From Company...');
        await this.page.locator('.ant-select.ant-select-outlined.ant-select-in-form-item > .ant-select-selector > .ant-select-selection-wrap > .ant-select-selection-search').first().click();
        await this.selectDropdownOption(data.fromCompany, 1500);
        await this.page.waitForTimeout(500); // Wait for dropdown to close
        
        // To Company
        console.log('   - To Company...');
        await this.page.locator('div:nth-child(2) > div > .ant-row > .ant-col.ant-col-18 > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector > .ant-select-selection-wrap > .ant-select-selection-search').first().click();
        await this.selectDropdownOption(data.toCompany, 1500);
        await this.page.waitForTimeout(500); // Wait for dropdown to close and form to update
        
        // Navigate to Step 3
        console.log('   ✅ Step 2 complete, moving to Step 3...');
        await this.page.getByRole('button', { name: 'Next right' }).nth(1).click();
        await this.page.waitForLoadState('domcontentloaded');
        
        // ========== STEP 3: REVIEW & SUBMIT ==========
        console.log('4️⃣ Step 3: Review & Submit');
        
        // Accept Terms Checkbox
        console.log('   - Accepting terms...');
        await this.page.getByLabel('', { exact: true }).check();
        
        // Submit
        console.log('   - Submitting booking...');
        await this.page.getByRole('button', { name: 'Submit' }).click();
        
        // Wait for success
        await this.page.waitForLoadState('domcontentloaded');
        
        console.log('✅ BOOKING CREATED SUCCESSFULLY!');
    }
}
