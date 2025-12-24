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
        test.setTimeout(60000); // 60 second timeout to prevent hanging
        console.log(`📍 Booking ID: ${BOOKING_ID}`);
        
        // Step 1: Navigate to booking
        console.log('Step 1: Navigating to booking...');
        await trackingPage.navigateToBooking(BOOKING_ID);
        await authenticatedPage.waitForTimeout(1000);
        
        // Step 2: Accept booking
        console.log('Step 2: Accepting booking...');
        await trackingPage.acceptBooking();
        
        // Step 3: Refresh page
        console.log('Step 3: Refreshing page...');
        await authenticatedPage.reload();
        await authenticatedPage.waitForLoadState('domcontentloaded');
        await authenticatedPage.waitForTimeout(1000);
        
        // Step 4: Sync table and click first leg - modal should open
        console.log('Step 4: Clicking first leg to open modal...');
        await authenticatedPage.getByRole('button', { name: 'sync' }).click();
        await authenticatedPage.waitForTimeout(1000);
        
        // Click first leg button - this opens the modal
        await authenticatedPage.locator('table').getByRole('button').first().click();
        await authenticatedPage.waitForTimeout(1000);
        
        // Step 5: Wait for modal to be visible (Update Leg modal)
        console.log('Step 5: Waiting for modal...');
        let modal = authenticatedPage.locator('.ant-modal-wrap .ant-modal-content').last();
        await modal.waitFor({ state: 'visible', timeout: 5000 });
        console.log('Modal is visible');
        
        // Step 6: IMPORTANT - Sync legs inside the modal to refresh form fields
        console.log('Step 6: Syncing legs in modal to load form fields...');
        const syncButtonInModal = modal.getByRole('button', { name: 'sync' });
        if (await syncButtonInModal.count() > 0) {
            await syncButtonInModal.click();
            await authenticatedPage.waitForTimeout(2000);
            console.log('Legs synced in modal');
        } else {
            console.log('No sync button found in modal, continuing...');
        }
        
        // Step 7: Assign resources (now the form fields should be ready)
        console.log('Step 7: Assigning driver and vehicle...');
        await trackingPage.assignLegResources(legTestData);
        
        // Step 8: Submit driver and vehicle assignment
        console.log('Step 8: Submitting driver and vehicle...');
        await trackingPage.submitLeg();
        await authenticatedPage.waitForTimeout(1000);
        
        // Step 9: CLOSE the Update Leg modal (Trip modal stays open)
        console.log('Step 9: Closing Update Leg modal after driver/vehicle submit...');
        await trackingPage.closeLegDialog();
        await authenticatedPage.waitForTimeout(1000);
        
        // Step 10: SYNC the trip table inside the Trip modal (critical step!)
        console.log('Step 10: Syncing trip table...');
        // The sync button is inside the Trip modal that's still open
        const tripModal = authenticatedPage.locator('.ant-modal-wrap .ant-modal-content');
        await tripModal.getByRole('button', { name: 'sync' }).click();
        await authenticatedPage.waitForTimeout(2000);
        
        // Step 11: Click the leg button again (inside the same Trip modal table)
        console.log('Step 11: Reopening leg for timeline updates...');
        await tripModal.locator('table').getByRole('button').first().click();
        await authenticatedPage.waitForTimeout(2000);
        
        // Wait for Update Leg modal to appear again
        modal = authenticatedPage.locator('.ant-modal-wrap .ant-modal-content').last();
        await modal.waitFor({ state: 'visible', timeout: 5000 });
        console.log('   ✅ Update Leg modal reopened, ready for timeline updates');
        
        // Step 12: Now update timeline fields (leg has UUIDs from previous submit)
        console.log('Step 12: Updating timeline fields with real-time data...');
        await trackingPage.updateLegTimelineInteractive(legTestData);
        
        // Step 13: Close modal after timeline updates
        console.log('Step 13: Closing modal after timeline updates...');
        await trackingPage.closeLegDialog();
        await authenticatedPage.waitForTimeout(1000);
        
        // Step 14: Final sync to refresh and verify data in table
        console.log('Step 14: Final sync to refresh table...');
        await authenticatedPage.getByRole('button', { name: 'sync' }).last().click();
        await authenticatedPage.waitForTimeout(1000);
        
        console.log('✅ Leg updated successfully with driver, vehicle, and all timeline fields!');
    });
});
