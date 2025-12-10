import { Page, expect } from "@playwright/test";
import { LegData, JobData, TripData, BookingTrackingState } from "../data/TrackingData";

/**
 * TrackingPageCodegen - Page Object Model for booking tracking operations
 * 
 * Supports CRUD operations on bookings:
 * - CREATE: Add jobs, trips, legs
 * - READ: Verify leg/job status
 * - UPDATE: Edit leg assignments and timeline
 * - DELETE/CANCEL: Discard unsaved changes
 */
export class TrackingPageCodegen {
    readonly page: Page;
    state: BookingTrackingState = { bookingId: '' };

    constructor(page: Page) {
        this.page = page;
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
     * CREATE: Add new job to booking
     */
    async addJob(jobData: JobData) {
        console.log('➕ Adding new job...');
        
        // Click "Add New Job" button
        await this.page.getByRole('button', { name: 'plus' }).nth(1).click();
        await this.page.waitForTimeout(500);

        // Select Job Type (DOMESTIC)
        await this.page.locator('.ant-select-selection-search').first().click();
        await this.page.waitForTimeout(300);
        await this.page.keyboard.type(jobData.jobType.substring(0, 5));
        await this.page.locator('.ant-select-item-option').first().click();
        
        // Select Measurement Type
        await this.page.getByText('None').click();
        await this.page.waitForTimeout(200);
        await this.page.keyboard.type(jobData.measurementType.substring(0, 3));
        await this.page.locator('.ant-select-item-option').first().click();
        
        // Fill Quantity
        await this.page.getByRole('textbox', { name: 'Enter text' }).click();
        await this.page.getByRole('textbox', { name: 'Enter text' }).fill(jobData.quantity);
        
        // Select UOM
        await this.page.locator('#details-uom').click();
        await this.page.waitForTimeout(300);
        await this.page.keyboard.type(jobData.uom.substring(0, 3));
        await this.page.locator('.ant-select-item-option').first().click();
        
        // Fill remarks if provided
        if (jobData.remarks) {
            await this.page.getByRole('textbox', { name: 'Enter job remarks...' }).click();
            await this.page.getByRole('textbox', { name: 'Enter job remarks...' }).fill(jobData.remarks);
        }

        console.log('✅ Job added');
    }

    /**
     * CREATE: Add trip to job
     */
    async addTrip(tripData: TripData, jobIndex: number = 0) {
        console.log(`➕ Adding trip to job #${jobIndex + 1}...`);
        
        // Click "Add New Trip" button for specific job
        await this.page.getByLabel('Add New Job').getByRole('button', { name: 'plus', exact: true }).click();
        await this.page.waitForTimeout(500);

        // Select From Company
        await this.page.locator('.ant-select.ant-select-outlined.ant-select-in-form-item > .ant-select-selector > .ant-select-selection-wrap > .ant-select-selection-search').first().click();
        await this.page.waitForTimeout(300);
        await this.page.keyboard.type(tripData.fromCompany.substring(0, 5));
        await this.page.locator('.ant-select-item-option').first().click();
        
        // Select To Company
        await this.page.locator('div:nth-child(2) > div > .ant-row > .ant-col.ant-col-18 > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector > .ant-select-selection-wrap > .ant-select-selection-search').first().click();
        await this.page.waitForTimeout(300);
        await this.page.keyboard.type(tripData.toCompany.substring(0, 5));
        await this.page.locator('.ant-select-item-option').first().click();
        
        // Fill remarks if provided
        if (tripData.remarks) {
            await this.page.getByRole('textbox', { name: /Enter trip #\d+ remarks\.\.\./ }).click();
            await this.page.getByRole('textbox', { name: /Enter trip #\d+ remarks\.\.\./ }).fill(tripData.remarks);
        }

        console.log('✅ Trip added');
    }

    /**
     * CREATE: Open and create leg
     * (Trip is created automatically when job is added, so we just open leg for editing)
     */
    async openLegForCreation(legNumber: number = 1) {
        console.log(`🔓 Opening leg #${legNumber} for creation...`);
        
        // Click on the leg to open edit dialog
        const legSelector = `#job-trip-legs-row-${legNumber - 1}`;
        await this.page.locator(legSelector).getByRole('button').first().click();
        await this.page.waitForLoadState('domcontentloaded');

        console.log(`✅ Leg #${legNumber} opened`);
    }

    /**
     * CREATE/UPDATE: Assign driver and vehicle to leg
     */
    async assignLegResources(legData: LegData) {
        console.log('👤 Assigning driver and vehicle...');
        
        // Assign Driver
        if (legData.driver) {
            await this.page.getByRole('combobox', { name: '* Driver :' }).click();
            await this.page.waitForTimeout(200);
            await this.page.getByRole('combobox', { name: '* Driver :' }).fill(legData.driver.substring(0, 5));
            await this.page.waitForTimeout(300);
            await this.page.locator('.ant-select-item-option').first().click();
        }

        // Assign Vehicle
        if (legData.vehicle) {
            await this.page.locator('div').filter({ hasText: /^Search a vehicle\.\.\./ }).first().click();
            await this.page.waitForTimeout(200);
            await this.page.getByRole('combobox', { name: '* Vehicle :' }).fill(legData.vehicle.substring(0, 3));
            await this.page.waitForTimeout(300);
            await this.page.locator('.ant-select-item-option').first().click();
        }

        // Fill remarks if provided
        if (legData.remarks) {
            await this.page.getByRole('textbox', { name: 'Enter remarks...' }).click();
            await this.page.getByRole('textbox', { name: 'Enter remarks...' }).fill(legData.remarks);
        }

        console.log('✅ Driver and vehicle assigned');
    }

    /**
     * CREATE/UPDATE: Set leg timeline fields
     */
    async updateLegTimeline(timelineData: LegData) {
        console.log('⏰ Updating timeline...');
        
        // Helper to set time field
        const setTimeField = async (buttonId: string, value?: string) => {
            if (!value) return;
            
            await this.page.locator(`#${buttonId} > svg`).click();
            await this.page.waitForTimeout(200);
            
            // If it's a time input (HH:mm format)
            if (value.includes(':')) {
                const [hours, minutes] = value.split(':');
                await this.page.getByRole('textbox', { name: '0000' }).fill(hours + minutes);
            } else {
                await this.page.getByRole('textbox', { name: '0000' }).fill(value);
            }
        };

        // Set timeline fields
        if (timelineData.planStart) await setTimeField('submit-time-button-planStart', timelineData.planStart);
        if (timelineData.start) await setTimeField('submit-time-button-start', timelineData.start);
        if (timelineData.startOut) await setTimeField('submit-time-button-startOut', timelineData.startOut);
        if (timelineData.planEnd) await setTimeField('submit-time-button-planEnd', timelineData.planEnd);
        if (timelineData.end) await setTimeField('submit-time-button-end', timelineData.end);
        if (timelineData.endOut) await setTimeField('submit-time-button-endOut', timelineData.endOut);

        console.log('✅ Timeline updated');
    }

    /**
     * CREATE/UPDATE: Submit leg after filling data
     */
    async submitLeg() {
        console.log('📤 Submitting leg...');
        
        await this.page.getByRole('button', { name: 'Submit check' }).click();
        await this.page.waitForTimeout(500);

        console.log('✅ Leg submitted');
    }

    /**
     * READ: Verify leg status
     */
    async verifyLegStatus(legNumber: number, expectedStatus: string) {
        console.log(`🔍 Verifying leg #${legNumber} status: ${expectedStatus}`);
        
        const legSelector = `#job-trip-legs-row-${legNumber - 1}`;
        const legRow = this.page.locator(legSelector);
        
        // Status should be visible in the row
        await expect(legRow).toContainText(expectedStatus, { timeout: 5000 });

        console.log(`✅ Leg #${legNumber} status confirmed: ${expectedStatus}`);
    }

    /**
     * UPDATE: Edit leg after submission
     */
    async editLeg(legNumber: number) {
        console.log(`✏️ Opening leg #${legNumber} for editing...`);
        
        const legSelector = `#job-trip-legs-row-${legNumber - 1}`;
        await this.page.locator(legSelector).getByRole('button').first().click();
        await this.page.waitForLoadState('domcontentloaded');

        console.log(`✅ Leg #${legNumber} opened for editing`);
    }

    /**
     * DELETE/CANCEL: Close dialog without saving
     */
    async cancelLegEdit() {
        console.log('❌ Cancelling leg edit without saving...');
        
        // Click close button on dialog
        await this.page.getByLabel('Update Leg').getByRole('button', { name: 'Close' }).click();
        await this.page.waitForTimeout(300);
        
        // Close confirmation dialog if present
        await this.page.getByRole('button', { name: 'Close', exact: true }).click({ force: true });

        console.log('✅ Edit cancelled, changes discarded');
    }

    /**
     * READ: Verify job status cascade
     */
    async verifyJobStatus(jobNumber: number, expectedStatus: string) {
        console.log(`🔍 Verifying job #${jobNumber} status: ${expectedStatus}`);
        
        // Job status is typically shown in job header or summary
        const jobSection = this.page.locator(`[id="job-${jobNumber - 1}"]`);
        
        await expect(jobSection).toContainText(expectedStatus, { timeout: 5000 });

        console.log(`✅ Job #${jobNumber} status confirmed: ${expectedStatus}`);
    }

    /**
     * VALIDATION: Attempt submit without required fields
     */
    async attemptSubmitWithoutDriver() {
        console.log('⚠️ Attempting submit without driver...');
        
        // Try to submit
        await this.page.getByRole('button', { name: 'Submit check' }).click();
        await this.page.waitForTimeout(300);

        // Check for error message
        const errorExists = await this.page.locator('text=/driver|required/i').isVisible({ timeout: 2000 }).catch(() => false);
        return errorExists;
    }

    /**
     * VALIDATION: Attempt submit without vehicle
     */
    async attemptSubmitWithoutVehicle() {
        console.log('⚠️ Attempting submit without vehicle...');
        
        // Try to submit
        await this.page.getByRole('button', { name: 'Submit check' }).click();
        await this.page.waitForTimeout(300);

        // Check for error message
        const errorExists = await this.page.locator('text=/vehicle|required/i').isVisible({ timeout: 2000 }).catch(() => false);
        return errorExists;
    }

    /**
     * VALIDATION: Verify invalid time range error
     */
    async attemptInvalidTimeRange(startTime: string, endTime: string) {
        console.log(`⚠️ Attempting invalid time range: ${startTime} to ${endTime}...`);
        
        // Set start time
        await this.page.locator('#submit-time-button-start > svg').click();
        await this.page.getByRole('textbox', { name: '0000' }).fill(startTime);
        
        // Set end time before start
        await this.page.locator('#submit-time-button-end > svg').click();
        await this.page.getByRole('textbox', { name: '0000' }).fill(endTime);
        
        // Try to submit
        await this.page.getByRole('button', { name: 'Submit check' }).click();
        await this.page.waitForTimeout(300);

        // Check for error
        const errorExists = await this.page.locator('text=/end.*before|time.*order/i').isVisible({ timeout: 2000 }).catch(() => false);
        return errorExists;
    }
}
