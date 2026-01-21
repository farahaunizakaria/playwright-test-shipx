import { Page } from "@playwright/test";
import { WaitHelper } from '../helper';

/**
 * CancelBookingPage - Page Object Model for canceling bookings
 */
export class CancelBookingPage {
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
     * Click cancel button
     */
    async clickCancelButton() {
        console.log('❌ Clicking Cancel button...');
        await this.page.getByRole('button', { name: 'Cancel' }).click();
        await this.waitHelper.wait(500);
        console.log('   - ✅ Cancel dialog opened');
    }

    /**
     * Fill cancellation reason and confirm
     * @param reason The reason for cancellation
     */
    async fillCancellationReason(reason: string) {
        console.log(`📝 Filling cancellation reason: ${reason}`);
        
        // Click and fill the "Why" textbox
        const reasonTextbox = this.page.getByRole('textbox', { name: '* Why :' });
        await reasonTextbox.click();
        await reasonTextbox.fill(reason);
        await this.waitHelper.wait(300);
        
        console.log('   - ✅ Reason filled');
    }

    /**
     * Confirm cancellation
     */
    async confirmCancellation() {
        console.log('✅ Confirming cancellation...');
        await this.page.getByRole('button', { name: 'Yes' }).click();
        await this.waitHelper.wait(1500);
        console.log('   - ✅ Booking cancelled successfully');
    }

    /**
     * Complete cancel booking workflow
     * @param reason The reason for cancellation
     */
    async cancelBooking(reason: string) {
        await this.acceptBooking();
        await this.clickCancelButton();
        await this.fillCancellationReason(reason);
        await this.confirmCancellation();
    }
}