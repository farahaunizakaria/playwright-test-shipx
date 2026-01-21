import { Page } from "@playwright/test";
import { DropdownHelper, WaitHelper } from '../helper';

/**
 * JobEditPage - Page Object Model for editing job details within a booking
 */
export class JobEditPage {
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
     * Click the Edit Job icon to enter job edit mode
     * Waits for the edit icon to appear after booking acceptance
     */
    async clickEditJobIcon() {
        console.log('✏️ Clicking Edit Job icon...');
        
        const editJobButton = this.page.getByRole('button', { name: 'edit', exact: true });
        
        // Wait for Edit button to appear (may take a few seconds after acceptance)
        await editJobButton.waitFor({ state: 'visible', timeout: 10000 });
        await editJobButton.click();
        await this.waitHelper.wait(1000);
        
        // Wait for edit form to be ready
        await this.page.waitForLoadState('domcontentloaded');
        console.log('✅ Job edit mode activated');
    }

    /**
     * Update the container size field in job details
     * @param newContainerSize The new container size value (e.g., '20', '40', '45')
     */
    async updateContainerSize(newContainerSize: string) {
        console.log(`📝 Updating Container Size to: ${newContainerSize}`);

        const modal = this.page.getByRole('dialog', { name: 'Edit Job redo' });

        // Click the displayed value "20" to open the dropdown
        await modal.getByText('20', { exact: true }).click();
        await this.waitHelper.wait(500);
        
        await this.dropdownHelper.selectDropdownOption(newContainerSize);
        console.log(`✅ Container Size updated to: ${newContainerSize}`);
    }

    /**
     * Submit the updated job
     * Clicks the Update button
     */
    async updateJob() {
        console.log('💾 Updating job...');
        
        const updateButton = this.page.getByRole('button', { name: 'Update', exact: true });
        await updateButton.waitFor({ state: 'visible', timeout: 5000 });
        await updateButton.click();
        await this.waitHelper.wait(2000);
        
        console.log('✅ Job updated successfully');
    }

    /**
     * Complete edit job workflow: accept booking, click edit job icon, edit container size, and update
     * @param newContainerSize The new container size value
     */
    async editJobDetails(newContainerSize: string) {
        console.log('🔧 Starting job edit workflow...');
        
        // Accept the booking
        await this.acceptBooking();
        
        // Click Edit Job icon
        await this.clickEditJobIcon();
        
        // Update the container size
        await this.updateContainerSize(newContainerSize);
        
        // Update the job
        await this.updateJob();
        
        console.log('✅ Job edit completed successfully');
    }
}
