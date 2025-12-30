import { test, expect } from '../fixtures/fixtures';
import { TrackingPageCodegen } from '../pages/TrackingPageCodegen';
import { LegData } from '../data/TrackingData';
import { BasePage } from '../pages/BasePage';

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
        
        // Get booking ID from file using BasePage static method
        const bookingId = BasePage.readLatestBookingId();
        if (!bookingId) {
            throw new Error('No booking ID found. Run create-booking test first.');
        }
        console.log(`📋 Using booking: ${bookingId}`);
        
        // Navigate, accept booking, and sync
        await trackingPage.navigateToBooking(bookingId);
        await trackingPage.acceptBooking();
        await trackingPage.syncBooking();
        await trackingPage.waitForPendingStatus();
        
        // Open Trip modal and sync
        const tripModal = await trackingPage.openTripModal();
        await trackingPage.syncModal(tripModal, 'Trip modal');
        
        // Open Update Leg modal
        const updateLegModal = await trackingPage.openUpdateLegModal(tripModal);
        
        // Assign driver and vehicle, then submit
        await trackingPage.assignLegResources(legTestData);
        await trackingPage.submitLeg();
        
        // Close Update Leg modal, sync Trip modal, and reopen for timeline updates
        await trackingPage.closeUpdateLegModal();
        const tripModalAgain = authenticatedPage.locator('.ant-modal-wrap').filter({ hasText: 'Trip (' });
        await trackingPage.syncModal(tripModalAgain, 'Trip modal');
        
        // Reopen Update Leg modal for timeline updates
        console.log('🔓 Reopening leg for timeline updates...');
        await trackingPage.openUpdateLegModal(tripModalAgain);
        
        // Update timeline fields
        console.log('⏰ Starting timeline field updates...');
        await trackingPage.updateLegTimelineInteractive(legTestData);
        console.log('✅ Timeline fields updated');
        
        // Close dialog
        await trackingPage.closeLegDialog();
    });
});
