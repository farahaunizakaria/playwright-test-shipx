import { Page, Locator } from '@playwright/test';

/**
 * Retry clicking an element with multiple selector strategies
 * Handles timing issues and stale elements automatically
 */
export async function smartClick(
    page: Page,
    selectors: string[] | Locator[],
    options: { timeout?: number; waitAfter?: number } = {}
) {
    const { timeout = 10000, waitAfter = 300 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        for (const selector of selectors) {
            try {
                const locator = typeof selector === 'string' ? page.locator(selector) : selector;
                
                // Wait for element to be ready
                await locator.waitFor({ state: 'visible', timeout: 2000 });
                await locator.click({ timeout: 2000 });
                await page.waitForTimeout(waitAfter);
                
                console.log(`✅ Successfully clicked using selector: ${typeof selector === 'string' ? selector : 'locator'}`);
                return; // Success!
            } catch (e) {
                // Try next selector
                continue;
            }
        }
        
        // Wait before retrying all selectors
        await page.waitForTimeout(500);
    }
    
    throw new Error(`Failed to click element after ${timeout}ms with ${selectors.length} selector strategies`);
}

/**
 * Select from dropdown with auto-retry
 */
export async function smartSelectDropdown(
    page: Page,
    fieldSelectors: string[] | Locator[],
    optionText: string,
    options: { timeout?: number } = {}
) {
    await smartClick(page, fieldSelectors, options);
    
    // Try multiple ways to select the option
    const optionSelectors = [
        page.getByTitle(optionText),
        page.getByText(optionText, { exact: true }),
        page.locator('.ant-select-item-option-content').filter({ hasText: optionText }),
        page.locator(`[title="${optionText}"]`)
    ];
    
    await smartClick(page, optionSelectors, { waitAfter: 500 });
}

/**
 * Wait for page to be fully ready (handles React re-renders)
 */
export async function waitForPageReady(page: Page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Buffer for React effects
}
