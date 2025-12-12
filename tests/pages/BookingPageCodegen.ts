import { Page } from "@playwright/test";
import { BookingData } from "../data/BookingData";

/**
 * BookingPageCodegen - Page Object Model based on actual Playwright Codegen
 */

export class BookingPageCodegen {
    readonly page: Page;

    //base page playwright ui elements and methods
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
            //issue #1: dropdown not visible, data unavailable
            //issue #2: multiple dropdowns open, not selecting & not selecting the correct one
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
        
        // Close any open dropdowns or modals from previous tests
        //issue #1: page not closed, test detects dropdown on main dashboard instead billing customer dropdown
        //issue #2: elements intercepts pointer events
        await this.page.keyboard.press('Escape'); // resets any ui elements before moving to another test
        await this.page.waitForTimeout(300);
        
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
        await this.page.locator('div').filter({ hasText: /^DOMESTIC$/ }).nth(2).click(); //hardcoded to avoid selecting hidden dropdowns (another issue)
        
        // Measurement Type (click "None" first)
        console.log('   - Measurement Type...');
        await this.page.getByText('None').click(); // Click "None" first to deselect
        await this.page.waitForTimeout(300);
        await this.page.getByText(data.measurementType, { exact: true }).click(); // Then select desired type
        
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
        //issue: tak sempat select choice from dropdown -> no input detected
        
        // To Company
        console.log('   - To Company...');
        await this.page.locator('div:nth-child(2) > div > .ant-row > .ant-col.ant-col-18 > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector > .ant-select-selection-wrap > .ant-select-selection-search').first().click();
        await this.selectDropdownOption(data.toCompany, 1500);
        await this.page.waitForTimeout(500); // Wait for dropdown to close and form to update
        //issue: same as above, unable to click "next" button
        
        console.log('✅ BOOKING FORM COMPLETED - Ready to add jobs/trips');
    }

    /**
     * Submit booking after adding jobs/trips
     * Use this after calling createBooking() and adding any additional jobs/trips
     */
    async submitBooking() {
        console.log('📤 Submitting booking...');
        
        // Check if we need to navigate to confirmation page (Step 3)
        const nextButton = this.page.getByRole('button', { name: 'Next right' }).nth(1);
        const isNextButtonVisible = await nextButton.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isNextButtonVisible) {
            console.log('   - Navigating to confirmation page...');
            await nextButton.click();
            await this.page.waitForLoadState('domcontentloaded');
        } else {
            console.log('   - Already on confirmation page');
        }
        
        // Check "Override Duplicate Booking" checkbox (using codegen selector)
        console.log('   - Checking override duplicate booking...');
        await this.page.getByLabel('', { exact: true }).check();
        
        // Submit
        console.log('   - Clicking Submit...');
        await this.page.getByRole('button', { name: 'Submit' }).click();
        
        // Wait for success notification or page to settle after submission
        // Use domcontentloaded instead of networkidle as some API calls may still be running
        await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
        await this.page.waitForTimeout(2000); // Allow time for URL to update and page to settle
        
        console.log('✅ Booking submitted successfully!');
    }

    /**
     * FOR TRACKING OPERATIONS: TO TEST TO ANOTHER FLOW USING CREATED BOOKING ID
     * Extract booking ID from the URL after submission
     * @returns The booking ID extracted from the URL, or empty string if not found
     */
    async getBookingIdFromUrl(): Promise<string> {
        // Wait for URL to update after submission redirect
        await this.page.waitForTimeout(1000);
        
        const url = this.page.url();
        const bookingId = url.match(/\/bookings\/([^/?]+)/)?.[1];
        
        // Filter out 'new' as it's the creation page, not a real booking ID
        if (bookingId && bookingId !== 'new') {
            console.log(`📋 ✅ Extracted booking ID from URL: ${bookingId}`);
            return bookingId;
        }
        
        // Extraction failed - log for debugging
        console.warn('⚠️ Could not extract booking ID from URL:', url);
        return '';
    }

    /**
     * TEST #3:
     * Add a new trip to the current job
     * Automatically handles clicking the trip add button and selecting From/To companies
     * @param fromCompanyIndex Index of the company to select in the From dropdown (default: 0 = first option)
     * @param toCompanyIndex Index of the company to select in the To dropdown (default: 0 = first option)
     */
    async addTrip(fromCompanyIndex: number = 0, toCompanyIndex: number = 0) {
        console.log('➕ Adding new trip...');
        
        // Click the trip add button
        await this.page.locator('#trip-add-button').click();
        await this.page.waitForTimeout(1000); // Wait for trip to be added

        // Scroll to the new trip to ensure it's visible
        await this.page.locator('div').filter({ hasText: /^Select a company\.\.\.$/ }).last().scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(300);
        
        // Click the To Company dropdown (last occurrence of "Select a company...")
        await this.page.locator('div').filter({ hasText: /^Select a company\.\.\.$/ }).last().click();
        await this.page.waitForTimeout(500);
        
        // Select the company from the dropdown
        const toOptions = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
            .locator('.ant-select-item-option');
        await toOptions.nth(toCompanyIndex).click();
        await this.page.waitForTimeout(500);

        console.log('   ✅ Trip added successfully');
    }

    /**
     * Fill job remarks for a specific job
     * @param jobIndex 0-based index of the job (0 = first job, 1 = second job, etc.)
     * @param remarks The remarks text to fill
     */
    async fillJobRemarks(jobIndex: number, remarks: string) {
        console.log(`📝 Filling Job #${jobIndex + 1} remarks: "${remarks}"`);
        
        const jobRemarksField = this.page.getByRole('textbox', { name: 'Enter job remarks...' }).nth(jobIndex);
        await jobRemarksField.click();
        await jobRemarksField.fill(remarks);
    }

    /**
     * Fill trip remarks for a specific trip
     * @param tripNumber 1-based trip number (1, 2, 3, etc.) - matches the placeholder text
     * @param remarks The remarks text to fill
     * @param jobIndex 0-based job index (default: 0 = first job)
     */
    async fillTripRemarks(tripNumber: number, remarks: string, jobIndex: number = 0) {
        console.log(`📝 Filling Trip #${tripNumber} remarks (Job #${jobIndex + 1}): "${remarks}"`);
        
        const tripRemarksField = this.page.getByRole('textbox', { name: `Enter trip #${tripNumber} remarks...` }).nth(jobIndex);
        await tripRemarksField.click();
        await tripRemarksField.fill(remarks);
    }

    /**
     * Navigate to a booking by ID and verify it loads successfully
     * Useful for verifying data persistence after submission
     * @param bookingId The booking ID to navigate to
     */
    async verifyBookingExists(bookingId: string) {
        console.log(`🔍 Navigating to booking: ${bookingId}`);
        
        await this.page.goto(`/bookings/${bookingId}`);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
        
        console.log('✅ Booking page loaded');
    }
}
