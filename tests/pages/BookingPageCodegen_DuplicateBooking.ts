import { Page } from "@playwright/test";
import { WaitHelper } from '../helper';

/**
 * DuplicateBookingPage - Page Object Model for duplicating bookings
 */
export class DuplicateBookingPage {
    readonly page: Page;
    private waitHelper: WaitHelper;

    constructor(page: Page) {
        this.page = page;
        this.waitHelper = new WaitHelper(page);
    }

    /**
     * Accept booking if not already accepted
     */
    async acceptBooking() {
        console.log('✅ Checking if booking needs to be accepted...');
        try {
            const acceptButton = this.page.getByRole('button', { name: 'Accept' });
            const isVisible = await acceptButton.isVisible({ timeout: 3000 });
            
            if (isVisible) {
                console.log('   - Clicking Accept button...');
                await acceptButton.click();
                await this.waitHelper.wait(500);
                
                // Click "Yes" in confirmation dialog
                console.log('   - Confirming acceptance...');
                await this.page.getByRole('button', { name: 'Yes' }).click();
                await this.waitHelper.wait(1500);
                console.log('   - ✅ Booking accepted');
            } else {
                console.log('   - Booking already accepted, skipping...');
            }
        } catch (error) {
            console.log('   - Booking already accepted or button not found');
        }
    }

    /**
     * Click duplicate button
     */
    async clickDuplicateButton() {
        console.log('📋 Clicking Duplicate button...');
        await this.page.getByRole('button', { name: 'copy Duplicate' }).click();
        await this.waitHelper.waitForPageLoad('domcontentloaded');
        await this.waitHelper.wait(1000);
        console.log('   - ✅ Duplicate form opened');
    }

    /**
     * Navigate through duplicate booking steps and submit
     */
    async submitDuplicateBooking() {
        console.log('📤 Submitting duplicate booking...');
        
        // Step 1 -> Step 2
        console.log('   - Moving to Step 2 (Job Details)...');
        await this.page.getByRole('button', { name: 'Next right' }).nth(1).click();
        await this.waitHelper.waitForPageLoad('domcontentloaded');
        await this.waitHelper.wait(1000);
        
        // Step 2 -> Step 3
        console.log('   - Moving to Step 3 (Review)...');
        await this.page.getByRole('button', { name: 'Next right' }).nth(1).click();
        await this.waitHelper.waitForPageLoad('domcontentloaded');
        await this.waitHelper.wait(1000);
        
        // Check override duplicate booking checkbox (first checkbox)
        console.log('   - Checking override duplicate booking...');
        await this.page.getByLabel('', { exact: true }).first().check();
        await this.waitHelper.wait(300);
        
        // Click Submit button
        console.log('   - Clicking Submit...');
        await this.page.getByRole('button', { name: 'Submit' }).click();
        
        // Wait for redirect to booking detail page
        await this.waitHelper.waitForPageLoad('domcontentloaded');
        await this.waitHelper.wait(1000);
        
        console.log('✅ Duplicate booking submitted successfully!');
    }

    /**
     * Complete duplicate booking workflow
     */
    async duplicateBooking() {
        await this.acceptBooking();
        await this.clickDuplicateButton();
        await this.submitDuplicateBooking();
    }

    /**
     * Extract booking ID from URL after submission
     */
    async getBookingIdFromUrl(): Promise<string> {
        await this.waitHelper.wait(1000);
        
        const url = this.page.url();
        const bookingId = url.match(/\/bookings\/([^/?]+)/)?.[1];
        
        if (bookingId && bookingId !== 'new') {
            console.log(`📋 ✅ Extracted booking ID from URL: ${bookingId}`);
            return bookingId;
        }
        
        console.warn('⚠️ Could not extract booking ID from URL:', url);
        return '';
    }
}