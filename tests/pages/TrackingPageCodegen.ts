import { Page, expect } from "@playwright/test";
import { LegData, JobData, TripData, BookingTrackingState } from "../data/TrackingData";
import { DropdownHelper, WaitHelper, ModalHelper } from '../helper';
import { BasePage } from "./BasePage";

export class TrackingPageCodegen extends BasePage {
    state: BookingTrackingState = { bookingId: '' };
    private dropdownHelper: DropdownHelper;
    private waitHelper: WaitHelper;
    private modalHelper: ModalHelper;

    constructor(page: Page) {
        super(page);
        this.dropdownHelper = new DropdownHelper(page);
        this.waitHelper = new WaitHelper(page);
        this.modalHelper = new ModalHelper(page);
    }

    // /**
    //  * HELPER to select dropdown option from VISIBLE dropdown only
    //  * Uses Playwright locator with hasText filter for accurate matching
    //  */
    // private async selectDropdownOption(value: string, waitTime: number = 600) {
    //     // Wait for dropdown options to load
    //     await this.page.waitForTimeout(waitTime);
        
    //     // Find the option using Playwright locator with text matching
    //     const optionLocator = this.page.locator(
    //         '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option'
    //     ).filter({ hasText: value }).first();
        
    //     const optionCount = await optionLocator.count();
        
    //     if (optionCount === 0) {
    //         // Option not found - get list of available options for error message
    //         const allOptions = await this.page.locator(
    //             '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option'
    //         ).allTextContents();
            
    //         console.error(`❌ Dropdown selection failed:`);
    //         console.error(`   Searched for: "${value}"`);
    //         console.error(`   Found ${allOptions.length} options:`, allOptions);
    //         throw new Error(`Option "${value}" not found. Available: ${allOptions.join(', ') || 'none'}`);
    //     }
        
    //     // Get the actual text of the matched option
    //     const optionText = await optionLocator.textContent();
    //     console.log(`✅ Found and clicking option: ${optionText}`);
        
    //     // Click the option
    //     await optionLocator.click();
        
    //     console.log(`✅ Selected: ${optionText}`);
        
    //     // Wait for dropdown to close and value to be registered
    //     await this.page.waitForTimeout(600);
    // }

    /**
     * Navigate to existing booking by ID
     */
    async navigateToBooking(bookingId: string) {
        this.state.bookingId = bookingId;
        await this.page.goto(`/bookings/${bookingId}`);
        await this.waitHelper.waitForPageLoad('domcontentloaded');
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
            await this.waitHelper.wait(500);
            
            // Confirm with Yes button
            const yesButton = this.page.getByRole('button', { name: 'Yes' });
            await yesButton.waitFor({ state: 'visible', timeout: 3000 });
            console.log('✅ Yes button found, clicking...');
            await yesButton.click();
            await this.waitHelper.wait(1000);
            console.log('✅ Booking accepted successfully');
        } catch (error) {
            console.log('⚠️ Accept button not found - booking may already be accepted or acceptance not required');
        }
    }

    /**
     * Sync booking to trigger leg status change from DELETED to PENDING
     * Uses retry mechanism with force clicks for reliability
     */
    async syncBooking() {
        console.log('🔄 Syncing booking...');
        
        // Reload and stabilize page first
        await this.page.reload();
        await this.waitHelper.waitForPageLoad('networkidle');
        await this.waitHelper.wait(2000);
        console.log('✅ Page reloaded and stable');
        
        // Find sync button using icon selector
        const syncButton = this.page.locator('button:has(span.anticon-sync)').first();
        await syncButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.waitHelper.wait(1000);
        
        // Retry clicking with force if needed
        for (let i = 0; i < 3; i++) {
            try {
                await syncButton.click({ force: true, timeout: 3000 });
                console.log(`✅ Sync button clicked (attempt ${i + 1})`);
                break;
            } catch (e) {
                if (i === 2) {
                    await this.page.screenshot({ path: 'sync-button-not-clickable.png', fullPage: true });
                    throw new Error('Sync button could not be clicked after 3 attempts');
                }
                console.log(`⚠️ Sync click attempt ${i + 1} failed, retrying...`);
                await this.waitHelper.wait(1000);
            }
        }
        
        await this.waitHelper.wait(3000);
        console.log('⏳ Waiting for sync to complete...');
    }

    /**
     * Wait for leg status to show PENDING (format: "1-PENDING", "2-PENDING" etc.)
     * Takes screenshot on failure for debugging
     */
    async waitForPendingStatus() {
        console.log('👀 Checking for PENDING status...');
        const pendingStatus = this.page.locator('table').getByText(/-PENDING/, { exact: false });
        
        try {
            await pendingStatus.waitFor({ state: 'visible', timeout: 20000 });
            console.log('✅ PENDING status found - leg is ready!');
            await this.waitHelper.wait(1000);
        } catch (e) {
            console.log('❌ PENDING status not found after sync!');
            await this.page.screenshot({ path: 'pending-status-not-found.png', fullPage: true });
            
            const tableContent = await this.page.locator('table').textContent();
            console.log('Table content:', tableContent?.substring(0, 500));
            
            throw new Error('Leg status did not change to PENDING after sync. Check screenshot.');
        }
    }

    /**
     * UTILITY: Wait for leg status to change from DELETED to PENDING
     * The system needs time to process the state change
     */
    async waitForLegStatusChange(): Promise<void> {
        console.log('⏳ Waiting for leg status to change from DELETED to PENDING...');
        
        const pendingStatus = this.page.locator('table').getByText('PENDING', { exact: false });
        await pendingStatus.waitFor({ state: 'visible', timeout: 15000 });
        console.log('✅ Leg status changed to PENDING');
        await this.waitHelper.wait(1000);
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
            await this.waitHelper.wait(2000);
        }
        
        // Wait for leg status to be ready (PENDING instead of DELETED)
        await this.waitForLegStatusChange();
        
        // Click the first leg row button in the table
        console.log('  • Clicking first leg in table...');
        //await this.page.locator('table').getByRole('button').first().click();
        await this.page.locator('#job-trip-legs-row-0 button[type="link"]').first().click();
        await this.waitHelper.wait(2000);
        
        // Wait for modal to appear
        await this.modalHelper.waitForModal('.ant-modal-wrap');
        console.log(`✅ Leg modal opened`);
        await this.waitHelper.wait(1000);
    }

    /**
     * CREATE/UPDATE: Assign driver and vehicle to leg
     */
    async assignLegResources(legData: LegData) {
        console.log('Assigning driver and vehicle...');
        
        const modal = this.page.locator('[role="dialog"]');
        
        // Assign Driver
        if (legData.driver) {
            console.log(`DRIVER ASSIGNMENT: ${legData.driver}`);
            
            //await modal.locator('#driver-leg-form-selector').click();
            await modal.locator('#driverUuid').click();
            await this.waitHelper.wait(300);
            await this.dropdownHelper.selectDropdownOption(legData.driver);
            console.log(`Driver assignment complete`);
        }

        await this.waitHelper.wait(500);

        // Assign Vehicle
        if (legData.vehicle) {
            console.log(`VEHICLE ASSIGNMENT: ${legData.vehicle}`);
            
            await modal.locator('#vehicleUuid').click();
            //await modal.locator('#vehicle-leg-form-selector').click();
            await this.waitHelper.wait(300);
            await this.dropdownHelper.selectDropdownOption(legData.vehicle);
            console.log(`Vehicle assignment complete`);
        }

        console.log('All resources assigned');
    }

    /**
     * CREATE/UPDATE: Set leg timeline fields interactively
     * @param timelineData LegData containing time fields (planStart, start, startOut, end, endOut, planEnd)
     */
    async updateLegTimelineInteractive(timelineData: LegData) {
        const modal = this.page.locator('.ant-modal-wrap .ant-modal-content').last();
        
        const updateTimeField = async (fieldName: string) => {
            const editButton = modal.locator(`#edit-time-button-${fieldName}`);
            const submitButton = modal.locator(`#submit-time-button-${fieldName}`);
            
            // Check if submit button already visible (field in edit mode)
            const submitVisible = await submitButton.isVisible({ timeout: 500 }).catch(() => false);
            
            if (submitVisible) {
                await submitButton.click({ force: true });
                await this.waitHelper.wait(1000);
                return;
            }
            
            // Click edit button to enter edit mode
            await editButton.scrollIntoViewIfNeeded().catch(() => {});
            await editButton.click({ force: true });
            await this.waitHelper.wait(200);
            await editButton.click({ force: true });
            await this.waitHelper.wait(200);
            await editButton.click({ force: true });
            await this.waitHelper.wait(1000);
            
            // Click submit
            await submitButton.scrollIntoViewIfNeeded().catch(() => {});
            await submitButton.click({ force: true });
            await this.waitHelper.wait(1000);
        };

        // Update fields in timeline order
        if (timelineData.planStart) await updateTimeField('planStart');
        if (timelineData.start) await updateTimeField('start');
        if (timelineData.startOut) await updateTimeField('startOut');
        if (timelineData.planEnd) await updateTimeField('planEnd');
        if (timelineData.end) await updateTimeField('end');
        if (timelineData.endOut) await updateTimeField('endOut');
        
        await this.waitHelper.wait(1000);
    }

    /**
     * Submit leg after assigning driver/vehicle (first submit button inside modal)
     */
    async submitLegDriverVehicle() {
        console.log('📤 Submitting driver and vehicle assignment...');
        
        const modal = this.page.locator('.ant-modal-wrap .ant-modal-content');
        const submitButton = modal.locator('#edit-leg-form-submit-button');
        await submitButton.waitFor({ state: 'visible', timeout: 5000 });
        await submitButton.click();
        await this.waitHelper.wait(1000);
        console.log('✅ Driver/Vehicle submitted');
    }

    /**
     * Sync a modal by clicking its sync button (uses icon selector)
     */
    async syncModal(modalLocator: ReturnType<Page['locator']>, description: string = 'modal'): Promise<boolean> {
        return await this.modalHelper.syncModal(modalLocator, description);
    }

    /**
     * Open Trip modal by clicking first leg in table
     */
    async openTripModal() {
        const firstLegButton = this.page.locator('table').getByRole('button').first();
        await firstLegButton.waitFor({ state: 'visible', timeout: 5000 });
        await firstLegButton.click();
        await this.waitHelper.wait(1500);
        
        const tripModal = this.page.locator('.ant-modal-wrap').filter({ hasText: 'Trip (' });
        await tripModal.waitFor({ state: 'visible', timeout: 5000 });
        console.log('✅ Trip modal opened');
        
        return tripModal;
    }

    /**
     * Open Update Leg modal from within Trip modal
     */
    async openUpdateLegModal(tripModal: ReturnType<Page['locator']>) {
        const legButton = tripModal.locator('table').getByRole('button').first();
        await legButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.waitHelper.wait(1000);
        await legButton.click({ force: true });
        await this.waitHelper.wait(1500);
        
        const updateLegModal = this.page.locator('.ant-modal-wrap').filter({ hasText: 'Update Leg' });
        await updateLegModal.waitFor({ state: 'visible', timeout: 5000 });
        console.log('✅ Update Leg modal opened');
        
        return updateLegModal;
    }

    /**
     * Close Update Leg modal (keeps Trip modal open)
     */
    async closeUpdateLegModal() {
        await this.modalHelper.closeModal('Update Leg');
    }

    /**
     * Close leg dialog after submission or viewing
     */
    async closeLegDialog() {
        console.log('🚪 Closing leg dialog...');
        
        const closeButton = this.page.getByLabel('Update Leg').getByRole('button', { name: 'Close', exact: true }).first();
        await closeButton.waitFor({ state: 'visible', timeout: 5000 });
        await closeButton.click();
        await this.waitHelper.wait(300);
        console.log('✅ Leg dialog closed');
    }
}
