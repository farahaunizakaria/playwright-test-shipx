import { test, expect } from '../fixtures/fixtures';
import { TrackingPageCodegen } from '../pages/TrackingPageCodegen';
import { LegData } from '../data/TrackingData';

//TEST 3: TEST UPDATE LEGS AND TRIPS
test.describe('Update Leg', () => {
    
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
        
        // Get booking ID from file using BasePage method
        const bookingId = trackingPage.getLatestBookingId();
        if (!bookingId) {
            throw new Error('No booking ID found. Run create-booking test first.');
        }
        console.log(`📋 Using booking: ${bookingId}`);
        
        // Navigate and accept booking
        await trackingPage.navigateToBooking(bookingId);
        await trackingPage.acceptBooking();
        
        // Refresh page and wait for stable state
        await authenticatedPage.reload();
        await authenticatedPage.waitForLoadState('networkidle');
        
        // Sync and open leg modal
        const syncButton = authenticatedPage.getByRole('button', { name: 'sync' });
        await syncButton.waitFor({ state: 'visible', timeout: 5000 });
        await syncButton.click();
        await authenticatedPage.waitForTimeout(1500);
        
        const firstLegButton = authenticatedPage.locator('table').getByRole('button').first();
        await firstLegButton.waitFor({ state: 'visible', timeout: 5000 });
        await firstLegButton.click();
        
        // Wait for modal to appear
        const modal = authenticatedPage.locator('.ant-modal-wrap .ant-modal-content');
        await modal.waitFor({ state: 'visible', timeout: 5000 });
        
        // Sync legs if button exists
        const syncButtonInModal = modal.getByRole('button', { name: 'sync' });
        const syncExists = await syncButtonInModal.isVisible({ timeout: 2000 }).catch(() => false);
        if (syncExists) {
            await syncButtonInModal.click();
            await authenticatedPage.waitForTimeout(1500);
        }
        
        // Assign driver and vehicle, then submit
        await trackingPage.assignLegResources(legTestData);
        await trackingPage.submitLeg();
        
        // Wait for submission to complete
        await authenticatedPage.waitForLoadState('networkidle');
        
        // Close modal, sync trip, reopen leg modal
        await trackingPage.closeLegDialog();
        await authenticatedPage.waitForTimeout(500);
        
        const tripModal = authenticatedPage.locator('.ant-modal-wrap .ant-modal-content');
        await tripModal.waitFor({ state: 'visible', timeout: 5000 });
        
        const tripSyncButton = tripModal.getByRole('button', { name: 'sync' });
        await tripSyncButton.waitFor({ state: 'visible', timeout: 5000 });
        await tripSyncButton.click();
        await authenticatedPage.waitForTimeout(1500);
        
        const tripLegButton = tripModal.locator('table').getByRole('button').first();
        await tripLegButton.waitFor({ state: 'visible', timeout: 5000 });
        await tripLegButton.click();
        
        // Wait for Update Leg modal and update timeline fields
        const updateLegModal = authenticatedPage.locator('.ant-modal-wrap .ant-modal-content').last();
        await updateLegModal.waitFor({ state: 'visible', timeout: 5000 });
        await trackingPage.updateLegTimelineInteractive(legTestData);
        
        // Close and final sync
        await trackingPage.closeLegDialog();
        await authenticatedPage.waitForTimeout(500);
        
        const finalSyncButton = authenticatedPage.getByRole('button', { name: 'sync' }).last();
        await finalSyncButton.waitFor({ state: 'visible', timeout: 5000 });
        await finalSyncButton.click();
        await authenticatedPage.waitForTimeout(500);
    });
});
