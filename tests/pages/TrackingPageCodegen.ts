import { Page, expect } from "@playwright/test";
import { LegData, JobData, TripData, BookingTrackingState } from "../data/TrackingData";

export class TrackingPageCodegen {
    readonly page: Page;
    state: BookingTrackingState = { bookingId: '' };

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Helper to select dropdown option from VISIBLE dropdown only
     * Uses Playwright locator with hasText filter for accurate matching
     */
    private async selectDropdownOption(value: string, waitTime: number = 600) {
        // Wait for dropdown options to load
        await this.page.waitForTimeout(waitTime);
        
        // Find the option using Playwright locator with text matching
        const optionLocator = this.page.locator(
            '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option'
        ).filter({ hasText: value }).first();
        
        const optionCount = await optionLocator.count();
        
        if (optionCount === 0) {
            // Option not found - get list of available options for error message
            const allOptions = await this.page.locator(
                '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option'
            ).allTextContents();
            
            console.error(`❌ Dropdown selection failed:`);
            console.error(`   Searched for: "${value}"`);
            console.error(`   Found ${allOptions.length} options:`, allOptions);
            throw new Error(`Option "${value}" not found. Available: ${allOptions.join(', ') || 'none'}`);
        }
        
        // Get the actual text of the matched option
        const optionText = await optionLocator.textContent();
        console.log(`✅ Found and clicking option: ${optionText}`);
        
        // Click the option
        await optionLocator.click();
        
        console.log(`✅ Selected: ${optionText}`);
        
        // Wait for dropdown to close and value to be registered
        await this.page.waitForTimeout(600);
    }

    /**
     * Navigate to existing booking by ID
     */
    async navigateToBooking(bookingId: string) {
        this.state.bookingId = bookingId;
        await this.page.goto(`/bookings/${bookingId}`);
        await this.page.waitForLoadState('domcontentloaded');
        console.log(`📍 Navigated to booking: ${bookingId}`);
    }

    /**
     * Accept booking (if it requires acceptance)
     * Clicks Accept button and confirms with Yes
     */
    async acceptBooking() {
        console.log('Attempting to accept booking...');
        
        const acceptButton = this.page.getByRole('button', { name: 'Accept' });
        
        try {
            // Wait for Accept button to be visible (up to 5 seconds)
            await acceptButton.waitFor({ state: 'visible', timeout: 5000 });
            console.log('✅ Accept button found, clicking...');
            await acceptButton.click();
            await this.page.waitForTimeout(500);
            
            // Confirm with Yes button
            const yesButton = this.page.getByRole('button', { name: 'Yes' });
            await yesButton.waitFor({ state: 'visible', timeout: 3000 });
            console.log('✅ Yes button found, clicking...');
            await yesButton.click();
            await this.page.waitForTimeout(1000);
            console.log('✅ Booking accepted successfully');
        } catch (error) {
            console.log('⚠️ Accept button not found - booking may already be accepted or acceptance not required');
        }
    }

    /**
     * UTILITY: Wait for leg status to change from DELETED to PENDING
     * The system needs time to process the state change
     */
    async waitForLegStatusChange(): Promise<void> {
        console.log('⏳ Waiting for leg status to change from DELETED to PENDING...');
        
        // Wait for status cell to change - look for "PENDING" text in the table
        const pendingStatus = this.page.locator('table').getByText('PENDING', { exact: false });
        
        try {
            await pendingStatus.waitFor({ state: 'visible', timeout: 15000 });
            console.log('✅ Leg status changed to PENDING');
            await this.page.waitForTimeout(1000); // Extra wait for UI to fully update
        } catch (e) {
            console.log('⚠️ Timeout waiting for PENDING status, continuing anyway...');
        }
    }

    /**
     * CREATE/UPDATE: Open leg for creation or editing
     * (Trip is created automatically when job is added, so we just open leg for editing)
     * @param legRowIndex 0-based row index (0 = first leg, 1 = second leg, etc.)
     */
    async openLegForEditing(legRowIndex: number = 0) {
        console.log(`🔓 Opening leg row #${legRowIndex} for editing...`);
        
        // First, sync the table to refresh status
        console.log('  • Syncing table to refresh leg status...');
        const syncButton = this.page.getByRole('button', { name: 'sync' });
        if (await syncButton.count() > 0) {
            await syncButton.click();
            await this.page.waitForTimeout(2000);
        }
        
        // Wait for leg status to be ready (PENDING instead of DELETED)
        await this.waitForLegStatusChange();
        
        // Click the first leg row button in the table
        console.log('  • Clicking first leg in table...');
        await this.page.locator('table').getByRole('button').first().click();
        await this.page.waitForTimeout(2000);
        
        // Wait for modal/dialog to appear
        console.log('  • Waiting for modal to appear...');
        try {
            // Wait for either HTML dialog or Ant Design modal
            const modalAppeared = await Promise.race([
                this.page.locator('dialog').first().waitFor({ state: 'visible', timeout: 3000 }),
                this.page.locator('.ant-modal-wrap').first().waitFor({ state: 'visible', timeout: 3000 })
            ]).catch(() => null);
            
            if (modalAppeared) {
                console.log('✅ Modal appeared after leg click');
                await this.page.waitForTimeout(1000);
            } else {
                console.log('⚠️ Modal did not appear - checking page structure...');
                const dialogs = await this.page.locator('dialog').count();
                const antModals = await this.page.locator('.ant-modal-wrap').count();
                const antModalsInner = await this.page.locator('.ant-modal-content').count();
                console.log(`  Dialogs found: ${dialogs}, Ant modals: ${antModals}, Ant modal content: ${antModalsInner}`);
                
                // Check if there's an edit button we need to click
                const editButtons = await this.page.locator('button').filter({ hasText: /edit|Edit/ }).count();
                console.log(`  Edit buttons found: ${editButtons}`);
                
                await this.page.screenshot({ path: 'modal-not-appeared.png' });
            }
        } catch (e) {
            console.log(`⚠️ Error waiting for modal: ${e}`);
        }

        console.log(`✅ Leg row #${legRowIndex} clicked`);
    }

    /**
     * CREATE/UPDATE: Assign driver and vehicle to leg
     * Field IDs used:
     * - form-company-selector: Transporter/Company
     * - driverUuid: Driver (REQUIRED)
     * - vehicleUuid: Vehicle (REQUIRED)
     */
    async assignLegResources(legData: LegData) {
        console.log('Assigning driver and vehicle...');
        
        // The modal is already open (Ant Design modal)
        const modal = this.page.locator('.ant-modal-wrap .ant-modal-content');
        
        // Assign Driver by ID
        if (legData.driver) {
            console.log(`DRIVER ASSIGNMENT: ${legData.driver}`);
            
            // Use ID selector for reliability
            const driverField = modal.locator('#driverUuid');
            
            if (await driverField.count() > 0) {
                console.log(`Clicking driver field (#driverUuid)...`);
                await driverField.click();
                await this.page.waitForTimeout(800);
                
                // Check if dropdown opened
                const dropdownVisible = await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').count();
                console.log(`Dropdown visible: ${dropdownVisible > 0}`);
                
                if (dropdownVisible > 0) {
                    console.log(`Selecting option: "${legData.driver}"`);
                    await this.selectDropdownOption(legData.driver);
                    
                    // Wait for selection to be registered and dropdown to close
                    await this.page.waitForTimeout(800);
                    
                    // Verify the value was set by checking the field
                    const fieldValue = await driverField.getAttribute('value');
                    console.log(`  Step 4: Field value after selection: "${fieldValue}"`);
                    
                    console.log(`Driver assignment complete`);
                } else {
                    console.log(`Dropdown did not open for driver field`);
                }
            } else {
                console.log(`Driver field not found by ID selector`);
            }
        }

        // Wait between assignments to ensure form is ready
        await this.page.waitForTimeout(1000);

        // Assign Vehicle by ID
        if (legData.vehicle) {
            console.log(`VEHICLE ASSIGNMENT: ${legData.vehicle}`);
            
            // Use ID selector for reliability
            const vehicleField = modal.locator('#vehicleUuid');
            
            if (await vehicleField.count() > 0) {
                console.log(`  Step 1: Clicking vehicle field (#vehicleUuid)...`);
                await vehicleField.click();
                await this.page.waitForTimeout(800);
                
                // Check if dropdown opened
                const dropdownVisible = await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').count();
                console.log(`Dropdown visible: ${dropdownVisible > 0}`);
                
                if (dropdownVisible > 0) {
                    console.log(`Selecting option: "${legData.vehicle}"`);
                    await this.selectDropdownOption(legData.vehicle);
                    
                    // Wait for selection to be registered and dropdown to close
                    await this.page.waitForTimeout(800);
                    
                    // Verify the value was set by checking the field
                    const fieldValue = await vehicleField.getAttribute('value');
                    console.log(`  Step 4: Field value after selection: "${fieldValue}"`);
                    
                    console.log(`Vehicle assignment complete`);
                } else {
                    console.log(`Dropdown did not open for vehicle field`);
                }
            } else {
                console.log(`Vehicle field not found by ID selector`);
            }
        }

        console.log('All resources assigned');
    }

    /**
     * CREATE/UPDATE: Set leg timeline fields interactively
     * Based on codegen: click edit button, then submit button for each time field
     * @param timelineData LegData containing time fields (planStart, start, startOut, end, endOut, planEnd)
     */
    async updateLegTimelineInteractive(timelineData: LegData) {
        console.log('⏰ Updating timeline interactively with real-time values...');
        
        // Helper to click edit and submit buttons for time fields
        const updateTimeField = async (fieldName: string) => {
            try {
                console.log(`  ⏱️ Updating ${fieldName}...`);
                
                // Click edit button
                const editButton = this.page.locator(`#edit-time-button-${fieldName} > svg`);
                await editButton.waitFor({ state: 'visible', timeout: 3000 });
                await editButton.click();
                await this.page.waitForTimeout(600); // Wait for time picker to appear
                
                // Wait for time picker to be fully loaded
                await this.page.waitForTimeout(400);
                
                // Click submit button (this uses current time)
                const submitButton = this.page.locator(`#submit-time-button-${fieldName} > svg`);
                await submitButton.waitFor({ state: 'visible', timeout: 3000 });
                await submitButton.click();
                await this.page.waitForTimeout(800); // Wait for time to be saved and picker to close
                
                console.log(`    ✅ ${fieldName} updated with current time`);
            } catch (error) {
                console.log(`    ⚠️ ${fieldName} field not available or already set: ${error}`);
            }
        };

        // Update timeline fields if they're marked as true in timelineData
        // Process them sequentially with proper waits
        if (timelineData.planStart) {
            await updateTimeField('planStart');
            await this.page.waitForTimeout(500); // Extra wait between fields
        }
        
        if (timelineData.start) {
            await updateTimeField('start');
            await this.page.waitForTimeout(500);
        }
        
        if (timelineData.startOut) {
            await updateTimeField('startOut');
            await this.page.waitForTimeout(500);
        }
        
        if (timelineData.end) {
            await updateTimeField('end');
            await this.page.waitForTimeout(500);
        }
        
        if (timelineData.endOut) {
            await updateTimeField('endOut');
            await this.page.waitForTimeout(500);
        }
        
        if (timelineData.planEnd) {
            await updateTimeField('planEnd');
            await this.page.waitForTimeout(500);
        }

        console.log('✅ All timeline fields updated successfully with real-time values');
    }

    /**
     * Submit leg after assigning driver/vehicle (first submit button inside modal)
     */
    async submitLegDriverVehicle() {
        console.log('📤 Submitting driver and vehicle assignment...');
        
        try {
            // Look for submit button inside modal (after driver/vehicle assignment)
            const modal = this.page.locator('.ant-modal-wrap .ant-modal-content');
            const submitButton = modal.getByRole('button').filter({ hasText: /submit/i }).first();
            const isVisible = await submitButton.isVisible({ timeout: 2000 }).catch(() => false);
            
            if (isVisible) {
                const text = await submitButton.textContent();
                await submitButton.click();
                await this.page.waitForTimeout(1000); // Wait for driver/vehicle to save
                console.log(`✅ Driver/Vehicle submitted (${text})`);
                return;
            }

            console.log('⚠️ Driver/Vehicle submit button not found');
            
        } catch (e) {
            console.log(`⚠️ Error submitting driver/vehicle: ${e}`);
            throw e;
        }
    }

    /**
     * Submit leg final (top-right submit button after all timeline updates)
     */
    async submitLegFinal() {
        console.log('📤 Submitting leg (final - top right)...');
        
        try {
            // Look for the top-right submit button in modal footer/header
            const modal = this.page.locator('.ant-modal-wrap .ant-modal-content');
            
            // Try to find in modal header (top right area)
            let submitButton = modal.locator('.ant-modal-header').getByRole('button').filter({ hasText: /submit/i }).first();
            let isVisible = await submitButton.isVisible({ timeout: 1500 }).catch(() => false);
            
            if (isVisible) {
                await submitButton.click();
                await this.page.waitForTimeout(1000);
                console.log('✅ Leg final submitted (header button)');
                return;
            }

            // Try to find in modal footer
            submitButton = modal.locator('.ant-modal-footer').getByRole('button').filter({ hasText: /submit/i }).first();
            isVisible = await submitButton.isVisible({ timeout: 1500 }).catch(() => false);
            
            if (isVisible) {
                await submitButton.click();
                await this.page.waitForTimeout(1000);
                console.log('✅ Leg final submitted (footer button)');
                return;
            }

            // Fallback: find any submit button in modal
            submitButton = modal.getByRole('button').filter({ hasText: /submit/i }).first();
            isVisible = await submitButton.isVisible({ timeout: 1500 }).catch(() => false);
            
            if (isVisible) {
                const text = await submitButton.textContent();
                await submitButton.click();
                await this.page.waitForTimeout(1000);
                console.log(`✅ Leg final submitted (${text})`);
                return;
            }

            console.log('⚠️ Final submit button not found');
            await this.page.screenshot({ path: 'final-submit-button-not-visible.png' });
            
        } catch (e) {
            console.log(`⚠️ Error on final submit: ${e}`);
            throw e;
        }
    }

    /**
     * CREATE/UPDATE: Submit leg (legacy - kept for compatibility)
     */
    async submitLeg() {
        console.log('📤 Submitting leg...');
        
        try {
            // Default to driver/vehicle submit
            await this.submitLegDriverVehicle();
            
        } catch (e) {
            console.log(`⚠️ Error submitting leg: ${e}`);
            throw e;
        }
    }

    /**
     * Close leg dialog after submission or viewing
     */
    async closeLegDialog() {
        console.log('🚪 Closing leg dialog...');
        
        try {
            // First try: Close the Update Leg dialog
            const closeButton = this.page.getByLabel('Update Leg').getByRole('button', { name: 'Close', exact: true }).first();
            const isVisible = await closeButton.isVisible({ timeout: 2000 }).catch(() => false);
            
            if (isVisible) {
                await closeButton.click();
                await this.page.waitForTimeout(300);
                console.log('✅ Leg dialog closed (method 1)');
                return;
            }
        } catch (e) {
            console.log('⚠️ Method 1 failed, trying alternative...');
        }
        
        try {
            // Second try: Close any remaining dialogs
            const confirmClose = this.page.getByRole('button', { name: 'Close', exact: true }).first();
            const isVisible = await confirmClose.isVisible({ timeout: 2000 }).catch(() => false);
            
            if (isVisible) {
                await confirmClose.click();
                await this.page.waitForTimeout(300);
                console.log('✅ Leg dialog closed (method 2)');
                return;
            }
        } catch (e) {
            console.log('⚠️ Method 2 failed');
        }
        
        console.log('✅ Leg dialog close attempted');
    }
}
