import { Page } from '@playwright/test';

/**
 * DateTimeHelper - Helper class for handling date and time selections
 */
export class DateTimeHelper {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Helper function to create date with specific time
     */
    static createDateWithTime(baseDate: Date, hours: number, minutes: number = 0): Date {
        const date = new Date(baseDate);
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    /**
     * Close any open date pickers
     */
    private async closeOpenPickers() {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(300);
    }

    /**
     * Select time in Ant Design DateTimePicker
     */
    private async selectTime(hours: number, minutes: number) {
        await this.page.waitForTimeout(800);
        
        console.log(`   🕐 Attempting to select time: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
        
        // Wait for time panel to be visible
        const timePanel = this.page.locator('.ant-picker-time-panel').last();
        await timePanel.waitFor({ state: 'visible', timeout: 3000 });
        console.log(`   ✓ Time panel visible`);
        
        // Get all time panel columns (should be 2: hours and minutes)
        const columns = this.page.locator('.ant-picker-time-panel-column');
        const columnCount = await columns.count();
        console.log(`   📊 Found ${columnCount} time columns`);
        
        // Select hour in the LAST visible hour column
        const hourColumn = columns.nth(columnCount - 2); // Second to last column is hours
        const hourPadded = hours.toString().padStart(2, '0');
        
        // Scroll to the hour if needed
        await hourColumn.locator(`li.ant-picker-time-panel-cell:has-text("${hourPadded}")`).scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(200);
        
        const hourOption = hourColumn.locator(`li.ant-picker-time-panel-cell`).filter({ hasText: new RegExp(`^${hourPadded}$`) });
        const hourCount = await hourOption.count();
        console.log(`   📊 Found ${hourCount} matching hour options for "${hourPadded}"`);
        
        if (hourCount > 0) {
            await hourOption.first().click();
            await this.page.waitForTimeout(300);
            console.log(`   ✓ Hour ${hourPadded} selected`);
        } else {
            console.log(`   ⚠️  Hour ${hourPadded} not found, skipping hour selection`);
        }
        
        // Select minute in the LAST visible minute column
        const minuteColumn = columns.last(); // Last column is minutes
        const minutePadded = minutes.toString().padStart(2, '0');
        
        // Scroll to the minute if needed
        await minuteColumn.locator(`li.ant-picker-time-panel-cell:has-text("${minutePadded}")`).scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(200);
        
        const minuteOption = minuteColumn.locator(`li.ant-picker-time-panel-cell`).filter({ hasText: new RegExp(`^${minutePadded}$`) });
        const minuteCount = await minuteOption.count();
        console.log(`   📊 Found ${minuteCount} matching minute options for "${minutePadded}"`);
        
        if (minuteCount > 0) {
            await minuteOption.first().click();
            await this.page.waitForTimeout(300);
            console.log(`   ✓ Minute ${minutePadded} selected`);
        } else {
            console.log(`   ⚠️  Minute ${minutePadded} not found, skipping minute selection`);
        }
    }

    /**
     * Generic date & time selection - extracts time from Date object
     */
    private async selectDateTime(fieldId: string, date: Date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        console.log(`📅 Selecting date ${date.toLocaleDateString()} with time ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}...`);
        
        await this.closeOpenPickers();
        
        const datePicker = this.page.locator(`[id="${fieldId}"]`);
        await datePicker.waitFor({ state: 'visible', timeout: 5000 });
        await datePicker.click();
        await this.page.waitForTimeout(600);
        
        // Click on the date in the calendar
        const day = date.getDate().toString();
        const dateOption = this.page.locator('.ant-picker-cell-in-view:not(.ant-picker-cell-disabled) .ant-picker-cell-inner').filter({ hasText: new RegExp(`^${day}$`) }).last();
        await dateOption.click({ timeout: 5000 });
        await this.page.waitForTimeout(600);
        
        // Select time from the Date object
        await this.selectTime(hours, minutes);
        
        // Click OK button to confirm
        const okButton = this.page.getByRole('button', { name: 'OK' }).last();
        await okButton.waitFor({ state: 'visible', timeout: 5000 });
        await okButton.click();
        await this.page.waitForTimeout(600);
        
        console.log(`✅ Date selected with time ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }

    /**
     * ETA date & time selection (time: 23:59)
     */
    async selectEta(date: Date) {
        await this.selectDateTime('details.eta', date);
    }

    /**
     * Storage Date selection (time: 20:00)
     */
    async selectStorageDate(date: Date) {
        await this.selectDateTime('details.storageDate', date);
    }

    /**
     * CMO Date selection (time: 22:00)
     */
    async selectCmoDate(date: Date) {
        await this.selectDateTime('details.cmo', date);
    }

    /**
     * Estimated RFC Date selection (same time as booking creation)
     */
    async selectEstimatedRfcDate(date: Date) {
        await this.selectDateTime('details.estimatedRfcDate', date);
    }

    /**
     * Last Port Storage Date selection (time: 00:00)
     */
    async selectLastPortStorageDate(date: Date) {
        await this.selectDateTime('details.lastPortStorageDate', date);
    }
}