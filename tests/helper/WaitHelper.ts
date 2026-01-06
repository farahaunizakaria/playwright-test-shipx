import { Page, Locator } from '@playwright/test';

/**
 * WaitHelper - Reusable methods for waiting and timing operations
 * 
 * Centralizes common wait patterns used across page objects
 */
export class WaitHelper {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Wait for element to be visible with custom timeout
     * 
     * @param locator - Element locator
     * @param timeout - Timeout in milliseconds (default: 5000)
     */
    async waitForVisible(locator: Locator, timeout: number = 5000): Promise<void> {
        await locator.waitFor({ state: 'visible', timeout });
    }

    /**
     * Wait for multiple elements to be visible
     * 
     * @param locators - Array of element locators
     * @param timeout - Timeout for each element (default: 5000)
     */
    async waitForMultipleVisible(locators: Locator[], timeout: number = 5000): Promise<void> {
        await Promise.all(locators.map(loc => loc.waitFor({ state: 'visible', timeout })));
    }

    /**
     * Wait for page to fully load
     * 
     * @param state - Load state to wait for (default: 'domcontentloaded')
     */
    async waitForPageLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await this.page.waitForLoadState(state);
    }

    /**
     * Wait for a specific amount of time
     * Use sparingly - prefer explicit waits when possible
     * 
     * @param ms - Milliseconds to wait
     */
    async wait(ms: number): Promise<void> {
        await this.page.waitForTimeout(ms);
    }

    /**
     * Wait for text to appear on page
     * 
     * @param text - Text to wait for (supports regex)
     * @param timeout - Timeout in milliseconds (default: 5000)
     */
    async waitForText(text: string | RegExp, timeout: number = 5000): Promise<void> {
        await this.page.waitForSelector(`text=${text}`, { timeout }).catch(() => null);
    }

    /**
     * Wait for element to be hidden/removed
     * 
     * @param locator - Element locator
     * @param timeout - Timeout in milliseconds (default: 5000)
     */
    async waitForHidden(locator: Locator, timeout: number = 5000): Promise<void> {
        await locator.waitFor({ state: 'hidden', timeout });
    }

    /**
     * Retry an action until it succeeds or max attempts reached
     * 
     * @param action - Async function to execute
     * @param maxAttempts - Maximum number of attempts (default: 3)
     * @param delayMs - Delay between attempts in milliseconds (default: 1000)
     * @throws Error from last attempt if all attempts fail
     */
    async retryAction(
        action: () => Promise<void>,
        maxAttempts: number = 3,
        delayMs: number = 1000
    ): Promise<void> {
        let lastError: Error | undefined;
        
        for (let i = 0; i < maxAttempts; i++) {
            try {
                await action();
                return; // Success
            } catch (error) {
                lastError = error as Error;
                console.log(`⚠️ Attempt ${i + 1} failed, retrying...`);
                if (i < maxAttempts - 1) {
                    await this.wait(delayMs);
                }
            }
        }
        
        throw lastError || new Error('All retry attempts failed');
    }
}
