import { test, expect } from '../fixtures/fixtures';
import { TrackingPageCodegen } from '../pages/TrackingPageCodegen';
import { LegData } from '../data/TrackingData';
import { readFileSync } from 'fs'

//TEST 3: TEST UPDATE LEGS AND TRIPS
test.describe('Update Leg', () => {
    
    const BOOKING_ID = readFileSync('latest-booking-id.txt', 'utf-8').trim();
    
    // Test data for leg update
    const legTestData: LegData = {
        driver: 'Aeril - Aakhif Aeril',  // Using actual driver from system
        vehicle: 'ABC001 - ABC001',      // Using actual vehicle from system
        planStart: false,               // Auto-set when driver/vehicle submitted, skip manual update
        start: true,                     // Click to save real-time
        startOut: true,                  // Click to save real-time
        planEnd: true,                   // Click to save real-time
        end: true,                       // Click to save real-time
        endOut: true                     // Click to save real-time
    };
    
    let trackingPage: TrackingPageCodegen;

    test.beforeEach(async ({ authenticatedPage }) => {
        trackingPage = new TrackingPageCodegen(authenticatedPage);
    });

    test('should update all legs in booking dynamically', async ({ authenticatedPage }) => {
        test.setTimeout(60000);
        
        // Navigate and accept booking
        await trackingPage.navigateToBooking(BOOKING_ID);
        await trackingPage.acceptBooking();
        
        // Refresh page
        await authenticatedPage.reload();
        await authenticatedPage.waitForLoadState('domcontentloaded');
        await authenticatedPage.waitForTimeout(500);
        
        // Sync and open leg modal
        await authenticatedPage.getByRole('button', { name: 'sync' }).click();
        await authenticatedPage.waitForTimeout(1000);
        await authenticatedPage.locator('table').getByRole('button').first().click();
        await authenticatedPage.waitForTimeout(1000);
        
        // Wait for modal and sync legs
        const modal = authenticatedPage.locator('.ant-modal-wrap .ant-modal-content');
        await modal.waitFor({ state: 'visible', timeout: 5000 });
        const syncButtonInModal = modal.getByRole('button', { name: 'sync' });
        if (await syncButtonInModal.count() > 0) {
            await syncButtonInModal.click();
            await authenticatedPage.waitForTimeout(1500);
        }
        
        // Assign driver and vehicle, then submit
        await trackingPage.assignLegResources(legTestData);
        await trackingPage.submitLeg();
        await authenticatedPage.waitForTimeout(500);
        
        // Close modal, sync trip, reopen leg modal
        await trackingPage.closeLegDialog();
        await authenticatedPage.waitForTimeout(500);
        const tripModal = authenticatedPage.locator('.ant-modal-wrap .ant-modal-content');
        await tripModal.getByRole('button', { name: 'sync' }).click();
        await authenticatedPage.waitForTimeout(1500);
        await tripModal.locator('table').getByRole('button').first().click();
        await authenticatedPage.waitForTimeout(1500);
        
        // Wait for Update Leg modal and update timeline fields
        const updateLegModal = authenticatedPage.locator('.ant-modal-wrap .ant-modal-content').last();
        await updateLegModal.waitFor({ state: 'visible', timeout: 5000 });
        await trackingPage.updateLegTimelineInteractive(legTestData);
        
        // Close and final sync
        await trackingPage.closeLegDialog();
        await authenticatedPage.waitForTimeout(500);
        await authenticatedPage.getByRole('button', { name: 'sync' }).last().click();
        await authenticatedPage.waitForTimeout(500);
    });
});
