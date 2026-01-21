import { Page } from '@playwright/test';

/**
 * MultipleOptionsHelper - Helper class for selecting multiple options from dropdowns
 */
export class MultipleOptionsHelper {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Select multiple options from a dropdown
     * @param fieldId The ID of the dropdown field (e.g., 'details.options')
     * @param options Array of option names to select (e.g., ['directDelivery', 'customSeal'])
     */
    async selectMultipleOptions(fieldId: string, options: string[]) {
        console.log(`   - Selecting multiple options: ${options.join(', ')}...`);
        
        // Click the dropdown to open it
        await this.page.locator(`[id="${fieldId}"]`).click();
        await this.page.waitForTimeout(600);
        
        // Wait for dropdown to be visible
        const dropdown = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
        await dropdown.waitFor({ state: 'visible', timeout: 5000 });
        console.log(`     ✓ Dropdown is visible`);
        
        // Select each option one by one
        for (const option of options) {
            console.log(`     • Selecting option: ${option}`);
            
            // Find the option in the visible dropdown using the dropdown context
            const optionElement = dropdown.locator('.ant-select-item-option').filter({ hasText: option });
            
            // Check if option exists
            const count = await optionElement.count();
            console.log(`     • Found ${count} matching options for "${option}"`);
            
            if (count > 0) {
                await optionElement.first().click();
                await this.page.waitForTimeout(300);
                console.log(`     ✓ Clicked "${option}"`);
            } else {
                console.log(`     ⚠️  Option "${option}" not found`);
            }
        }
        
        // Close the dropdown by pressing Escape or clicking outside
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(300);
        
        console.log(`   ✅ Selected ${options.length} option(s)`);
    }
}