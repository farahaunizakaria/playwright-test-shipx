import { Page } from '@playwright/test';

/**
 * DropdownHelper - Reusable methods for interacting with Ant Design dropdowns
 * 
 * This helper eliminates code duplication across page objects by providing
 * a centralized way to handle dropdown interactions.
 */
export class DropdownHelper {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Select an option from a visible Ant Design dropdown
     * 
     * @param value - The text to search for in the dropdown options (partial match supported)
     * @param waitTime - Time to wait before attempting selection (default: 600ms)
     * @throws Error if option not found with list of available options
     * 
     * @example
     * ```typescript
     * const dropdownHelper = new DropdownHelper(page);
     * await page.locator('#my-selector').click();
     * await dropdownHelper.selectDropdownOption('Option 1');
     * ```
     */
    async selectDropdownOption(value: string, waitTime: number = 600): Promise<void> {
        await this.page.waitForTimeout(waitTime);
        
        const result = await this.page.evaluate((optionText) => {
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
     * Select dropdown option using Playwright locators (alternative approach)
     * Useful when the evaluate approach doesn't work
     * 
     * @param value - The exact or partial text to match
     * @param waitTime - Time to wait for dropdown to load (default: 600ms)
     */
    async selectDropdownOptionWithLocator(value: string, waitTime: number = 600): Promise<void> {
        await this.page.waitForTimeout(waitTime);
        
        const optionLocator = this.page.locator(
            '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option'
        ).filter({ hasText: value }).first();
        
        const optionCount = await optionLocator.count();
        
        if (optionCount === 0) {
            const allOptions = await this.page.locator(
                '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option'
            ).allTextContents();
            
            console.error(`❌ Dropdown selection failed:`);
            console.error(`   Searched for: "${value}"`);
            console.error(`   Found ${allOptions.length} options:`, allOptions);
            throw new Error(`Option "${value}" not found. Available: ${allOptions.join(', ') || 'none'}`);
        }
        
        const optionText = await optionLocator.textContent();
        console.log(`✅ Found and clicking option: ${optionText}`);
        
        await optionLocator.click();
        console.log(`✅ Selected: ${optionText}`);
        await this.page.waitForTimeout(600);
    }

    /**
     * Get all available options from currently visible dropdown
     * Useful for debugging or validating dropdown contents
     * 
     * @returns Array of option texts
     */
    async getAvailableOptions(): Promise<string[]> {
        await this.page.waitForTimeout(300);
        
        return await this.page.evaluate(() => {
            const visibleDropdown = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
            
            if (!visibleDropdown) {
                return [];
            }
            
            const options = Array.from(visibleDropdown.querySelectorAll('.ant-select-item-option'));
            return options.map(o => o.textContent?.trim() || '');
        });
    }

    /**
     * Check if a dropdown option exists
     * 
     * @param value - The text to search for
     * @returns true if option exists, false otherwise
     */
    async optionExists(value: string): Promise<boolean> {
        const options = await this.getAvailableOptions();
        return options.some(opt => opt.includes(value));
    }
}
