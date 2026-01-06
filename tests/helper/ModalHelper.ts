import { Page, Locator } from '@playwright/test';

/**
 * ModalHelper - Reusable methods for interacting with modals/dialogs
 * 
 * Handles common modal operations like opening, closing, and syncing
 */
export class ModalHelper {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Wait for modal to be visible
     * 
     * @param modalIdentifier - Text that identifies the modal (e.g., modal title)
     * @param timeout - Timeout in milliseconds (default: 5000)
     * @returns The modal locator
     */
    async waitForModal(modalIdentifier?: string, timeout: number = 5000): Promise<Locator> {
        let modal: Locator;
        
        if (modalIdentifier) {
            modal = this.page.locator('.ant-modal-wrap').filter({ hasText: modalIdentifier });
        } else {
            modal = this.page.locator('.ant-modal-wrap').first();
        }
        
        await modal.waitFor({ state: 'visible', timeout });
        await this.page.waitForTimeout(500);
        return modal;
    }

    /**
     * Close modal by clicking the close button (X icon)
     * 
     * @param modalLabel - Aria label of the modal (for getByLabel)
     */
    async closeModal(modalLabel: string): Promise<void> {
        console.log(`🚪 Closing ${modalLabel} modal...`);
        const closeButton = this.page.getByLabel(modalLabel).getByRole('button', { name: 'Close', exact: true });
        await closeButton.waitFor({ state: 'visible', timeout: 5000 });
        await closeButton.click();
        await this.page.waitForTimeout(1000);
        console.log(`✅ ${modalLabel} modal closed`);
    }

    /**
     * Sync a modal by clicking its sync button
     * 
     * @param modalLocator - The modal locator to sync
     * @param description - Description for logging (default: 'modal')
     * @returns true if sync button found and clicked, false otherwise
     */
    async syncModal(modalLocator: Locator, description: string = 'modal'): Promise<boolean> {
        const syncButton = modalLocator.locator('button:has(span.anticon-sync)');
        const isVisible = await syncButton.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isVisible) {
            await syncButton.click({ force: true });
            await this.page.waitForTimeout(2000);
            console.log(`✅ ${description} synced`);
            return true;
        }
        
        console.log(`⚠️ Sync button not found in ${description}`);
        return false;
    }

    /**
     * Submit a modal form by clicking the submit/OK button
     * 
     * @param buttonIdentifier - Button text, name, or CSS selector (if starts with # or .)
     * @param waitForValidation - Whether to wait for form validation (default: false)
     * @param maxValidationWait - Max time to wait for validation in ms (default: 10000)
     */
    async submitModal(
        buttonIdentifier: string = 'Submit',
        waitForValidation: boolean = false,
        maxValidationWait: number = 10000
    ): Promise<void> {
        console.log(`📤 Submitting modal with button: ${buttonIdentifier}...`);
        
        // Check if it's a CSS selector (starts with # or .)
        const submitButton = buttonIdentifier.startsWith('#') || buttonIdentifier.startsWith('.')
            ? this.page.locator(buttonIdentifier)
            : this.page.getByRole('button', { name: buttonIdentifier, exact: true });
            
        await submitButton.waitFor({ state: 'visible', timeout: 5000 });
        
        if (waitForValidation) {
            // Wait for button to become enabled (form validation complete)
            const startTime = Date.now();
            while (Date.now() - startTime < maxValidationWait) {
                const disabled = await submitButton.evaluate((el: HTMLButtonElement) => el.disabled);
                if (!disabled) break;
                await this.page.waitForTimeout(500);
            }
        }
        
        await submitButton.click();
        await this.page.waitForTimeout(2000);
        console.log(`✅ Modal submitted`);
    }

    /**
     * Check if modal is currently visible
     * 
     * @param modalIdentifier - Optional text to identify specific modal
     * @returns true if modal is visible
     */
    async isModalVisible(modalIdentifier?: string): Promise<boolean> {
        let modal: Locator;
        
        if (modalIdentifier) {
            modal = this.page.locator('.ant-modal-wrap').filter({ hasText: modalIdentifier });
        } else {
            modal = this.page.locator('.ant-modal-wrap');
        }
        
        return await modal.isVisible({ timeout: 1000 }).catch(() => false);
    }

    /**
     * Get modal dialog content locator
     * 
     * @param modalIdentifier - Optional text to identify specific modal
     * @returns Modal content locator
     */
    async getModalContent(modalIdentifier?: string): Promise<Locator> {
        if (modalIdentifier) {
            return this.page.locator('[role="dialog"]').filter({ hasText: modalIdentifier });
        }
        return this.page.locator('[role="dialog"]').first();
    }
}
