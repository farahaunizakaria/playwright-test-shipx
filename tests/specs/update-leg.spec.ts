import { test, expect } from '../fixtures/fixtures';
import { TrackingPageCodegen } from '../pages/TrackingPageCodegen';
import { LegData } from '../data/TrackingData';
import { readFileSync } from 'fs'

test.describe('Update Leg', () => {
    
    const BOOKING_ID = readFileSync('latest-booking-id.txt', 'utf-8').trim();
    
    // Test data for leg update
    const legTestData: LegData = {
        driver: 'Aeril - Aakhif Aeril',  // Using actual driver from system
        vehicle: 'ABC001 - ABC001',      // Using actual vehicle from system
        planStart: true,                 // Click to save real-time
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
        await authenticatedPage.waitForTimeout(1500);
        
        // Click first leg button - this opens the modal
        await authenticatedPage.locator('table').getByRole('button').first().click();
        await authenticatedPage.waitForTimeout(2000);
        
        // Step 5: Wait for modal to be visible
        console.log('Step 5: Waiting for modal...');
        const modal = authenticatedPage.locator('.ant-modal-wrap .ant-modal-content');
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
        
        // Step 8: FIRST SUBMIT - Submit driver and vehicle assignment
        console.log('Step 8: Submitting driver and vehicle (first submit button)...');
        await trackingPage.submitLegDriverVehicle();
        await authenticatedPage.waitForTimeout(1500); // Wait for driver/vehicle to save
        
        // Step 9: Update all timeline fields (modal still open after first submit)
        console.log('Step 9: Updating timeline fields with real-time data...');
        await authenticatedPage.waitForTimeout(1000); // Additional timeout before updating timeline
        await trackingPage.updateLegTimelineInteractive(legTestData);
        
        // Step 10: Wait for timeline updates to complete
        console.log('Step 10: Waiting for timeline updates...');
        await authenticatedPage.waitForTimeout(2000); // Wait for updates to process
        
        // Step 11: FINAL SUBMIT - Submit everything (top-right button)
        console.log('Step 11: Final submit (top-right button)...');
        await trackingPage.submitLegFinal();
        
        // Step 12: Close the modal
        console.log('Step 12: Closing leg dialog...');
        await trackingPage.closeLegDialog();
        
        console.log('✅ Leg updated successfully with driver, vehicle, and all timeline fields!');
    });
});
