import { Page } from "@playwright/test";
import { DropdownHelper, WaitHelper } from '../helper';

/**
 * BookingEditPage - Page Object Model for editing booking details
 */
export class BookingEditPage {
    readonly page: Page;
    private dropdownHelper: DropdownHelper;
    private waitHelper: WaitHelper;

    constructor(page: Page) {
        this.page = page;
        this.dropdownHelper = new DropdownHelper(page);
        this.waitHelper = new WaitHelper(page);
    }

    /**
     * Accept booking after submission (if it requires acceptance)
     * Clicks Accept button and confirms with Yes
     */
    async acceptBooking() {
        console.log('🔄 Attempting to accept booking...');
        
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
     * Click the Edit button to enter edit mode
     * Waits for the edit button to appear after booking acceptance
     */
    async clickEditButton() {
        console.log('✏️ Clicking Edit button...');
        
        const editButton = this.page.getByRole('button', { name: 'edit Edit' });
        
        // Wait for Edit button to appear (may take a few seconds after acceptance)
        await editButton.waitFor({ state: 'visible', timeout: 10000 });
        await editButton.click();
        await this.waitHelper.wait(1000);
        
        // Wait for edit form to be ready
        await this.page.waitForLoadState('domcontentloaded');
        console.log('✅ Edit mode activated');
    }

    /**
     * Edit the delivery hour field
     * @param newDeliveryHour The new delivery hour value (e.g., 'OFFICE HRS', '24 HRS')
     */
    async editDeliveryHour(newDeliveryHour: string) {
        console.log(`📝 Editing Delivery Hour to: ${newDeliveryHour}`);
        
        // Click the existing delivery hour field
        await this.page.getByText('HRS').click();
        await this.waitHelper.wait(500);
        
        // Select the new value from dropdown
        await this.dropdownHelper.selectDropdownOption(newDeliveryHour);
        console.log(`✅ Delivery Hour updated to: ${newDeliveryHour}`);
    }

    /**
     * Submit the updated booking
     * Clicks the Update Booking button
     */
    async updateBooking() {
        console.log('💾 Updating booking...');
        
        const updateButton = this.page.getByRole('button', { name: 'Update Booking' }).nth(1);
        await updateButton.waitFor({ state: 'visible', timeout: 5000 });
        await updateButton.click();
        await this.waitHelper.wait(2000);
        
        console.log('✅ Booking updated successfully');
    }

    /**
     * Complete edit workflow: accept, edit delivery hour, and update
     * @param newDeliveryHour The new delivery hour value
     */
    async editBookingDeliveryHour(newDeliveryHour: string) {
        console.log('🔧 Starting booking edit workflow...');
        
        // Accept the booking
        await this.acceptBooking();
        
        // Click Edit button
        await this.clickEditButton();
        
        // Edit the delivery hour
        await this.editDeliveryHour(newDeliveryHour);
        
        // Update the booking
        await this.updateBooking();
        
        console.log('✅ Booking edit completed successfully');
    }
}
