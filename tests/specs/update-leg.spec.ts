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
        
        // Navigate and accept booking
        await trackingPage.navigateToBooking(bookingId);
        await trackingPage.acceptBooking();
        
        // Refresh page to ensure stable state
        await authenticatedPage.reload();
        await authenticatedPage.waitForLoadState('networkidle');
        await authenticatedPage.waitForTimeout(2000);
        console.log('✅ Page reloaded and stable');
        
        // Wait for and click sync button with better targeting
        console.log('🔄 Looking for sync button...');
        const syncButton = authenticatedPage.locator('button:has(span.anticon-sync)').first();
        await syncButton.waitFor({ state: 'visible', timeout: 10000 });
        await authenticatedPage.waitForTimeout(1000);
        
        // Try clicking multiple times if needed
        let syncClicked = false;
        for (let i = 0; i < 3; i++) {
            try {
                await syncButton.click({ force: true, timeout: 3000 });
                syncClicked = true;
                console.log(`✅ Sync button clicked (attempt ${i + 1})`);
                break;
            } catch (e) {
                console.log(`⚠️ Sync click attempt ${i + 1} failed, retrying...`);
                await authenticatedPage.waitForTimeout(1000);
            }
        }
        
        if (!syncClicked) {
            await authenticatedPage.screenshot({ path: 'sync-button-not-clickable.png', fullPage: true });
            throw new Error('Sync button could not be clicked after 3 attempts');
        }
        
        await authenticatedPage.waitForTimeout(3000);
        console.log('⏳ Waiting for sync to complete...');
        
        // Wait for leg status to change to PENDING (format is "1-PENDING" with leg number)
        console.log('👀 Checking for PENDING status...');
        const pendingStatus = authenticatedPage.locator('table').getByText(/-PENDING/, { exact: false });
        
        try {
            await pendingStatus.waitFor({ state: 'visible', timeout: 20000 });
            console.log('✅ PENDING status found - leg is ready!');
            await authenticatedPage.waitForTimeout(1000);
        } catch (e) {
            console.log('❌ PENDING status not found after sync!');
            await authenticatedPage.screenshot({ path: 'pending-status-not-found.png', fullPage: true });
            
            // Check what status we have
            const tableContent = await authenticatedPage.locator('table').textContent();
            console.log('Table content:', tableContent?.substring(0, 500));
            
            throw new Error('Leg status did not change to PENDING after sync. Check screenshot.');
        }
        
        // Click first leg button
        const firstLegButton = authenticatedPage.locator('table').getByRole('button').first();
        await firstLegButton.waitFor({ state: 'visible', timeout: 5000 });
        await firstLegButton.click();
        await authenticatedPage.waitForTimeout(1500);
        
        // Wait for Trip modal to appear
        const tripModal = authenticatedPage.locator('.ant-modal-wrap').filter({ hasText: 'Trip (' }).locator('.ant-modal-content');
        await tripModal.waitFor({ state: 'visible', timeout: 5000 });
        console.log('✅ Trip modal opened');
        
        // Sync legs in trip modal using icon selector
        const syncButtonInTripModal = tripModal.locator('button:has(span.anticon-sync)');
        const syncExists = await syncButtonInTripModal.isVisible({ timeout: 2000 }).catch(() => false);
        if (syncExists) {
            await syncButtonInTripModal.click({ force: true });
            await authenticatedPage.waitForTimeout(2000);
            console.log('✅ Synced legs in trip modal');
        }
        
        // Click first leg in trip modal to open Update Leg modal
        const legInTripModal = tripModal.locator('table').getByRole('button').first();
        await legInTripModal.waitFor({ state: 'visible', timeout: 5000 });
        
        // Wait for button to be enabled
        await authenticatedPage.waitForTimeout(1000);
        const isEnabled = await legInTripModal.isEnabled({ timeout: 5000 }).catch(() => false);
        if (!isEnabled) {
            console.log('⚠️ Button is disabled, waiting for it to be enabled...');
            await authenticatedPage.waitForTimeout(2000);
        }
        
        await legInTripModal.click({ force: true });
        await authenticatedPage.waitForTimeout(1500);
        
        // Wait for Update Leg modal to appear (second modal)
        const updateLegModal = authenticatedPage.locator('.ant-modal-wrap').filter({ hasText: 'Update Leg' }).locator('.ant-modal-content');
        await updateLegModal.waitFor({ state: 'visible', timeout: 5000 });
        console.log('✅ Update Leg modal opened');
        
        // Assign driver and vehicle, then submit
        await trackingPage.assignLegResources(legTestData);
        await trackingPage.submitLeg();
        await authenticatedPage.waitForTimeout(1000);
        
        // Close Update Leg modal (NOT the Trip modal)
        console.log('🚪 Closing Update Leg modal...');
        const updateLegCloseButton = authenticatedPage.getByLabel('Update Leg').getByRole('button', { name: 'Close', exact: true });
        await updateLegCloseButton.click();
        await authenticatedPage.waitForTimeout(1000);
        console.log('✅ Update Leg modal closed, Trip modal should still be visible');
        
        // Verify Trip modal is still visible
        const tripModalAgain = authenticatedPage.locator('.ant-modal-wrap').filter({ hasText: 'Trip (' }).locator('.ant-modal-content');
        const tripModalVisible = await tripModalAgain.isVisible({ timeout: 2000 }).catch(() => false);
        console.log(`Trip modal visible after closing Update Leg: ${tripModalVisible}`);
        
        // Sync trip modal again
        const syncAgain = tripModalAgain.locator('button:has(span.anticon-sync)');
        const syncAgainExists = await syncAgain.isVisible({ timeout: 2000 }).catch(() => false);
        if (syncAgainExists) {
            console.log('🔄 Syncing trip modal again...');
            await syncAgain.click({ force: true });
            await authenticatedPage.waitForTimeout(2000);
            console.log('✅ Trip modal synced');
        } else {
            console.log('⚠️ Sync button not found in trip modal');
        }
        
        // Reopen leg for timeline updates
        console.log('🔓 Reopening leg for timeline updates...');
        const legForTimeline = tripModalAgain.locator('table').getByRole('button').first();
        const legButtonVisible = await legForTimeline.isVisible({ timeout: 5000 }).catch(() => false);
        console.log(`Leg button visible: ${legButtonVisible}`);
        
        if (!legButtonVisible) {
            console.log('❌ Leg button not visible, taking screenshot...');
            await authenticatedPage.screenshot({ path: 'leg-button-not-visible.png', fullPage: true });
            throw new Error('Leg button not visible for timeline updates');
        }
        
        await authenticatedPage.waitForTimeout(1000);
        await legForTimeline.click({ force: true });
        await authenticatedPage.waitForTimeout(1500);
        console.log('✅ Clicked leg button for timeline updates');
        
        // Wait for Update Leg modal again
        const updateLegModalAgain = authenticatedPage.locator('.ant-modal-wrap').filter({ hasText: 'Update Leg' }).locator('.ant-modal-content');
        await updateLegModalAgain.waitFor({ state: 'visible', timeout: 5000 });
        console.log('✅ Update Leg modal reopened for timeline updates');
        
        // Update timeline fields
        console.log('⏰ Starting timeline field updates...');
        await trackingPage.updateLegTimelineInteractive(legTestData);
        console.log('✅ Timeline fields updated');
        
        // Close and final sync
        await trackingPage.closeLegDialog();
        await authenticatedPage.waitForTimeout(500);
        
        const finalSyncButton = authenticatedPage.getByRole('button', { name: 'sync' }).last();
        await finalSyncButton.waitFor({ state: 'visible', timeout: 5000 });
        await finalSyncButton.click();
        await authenticatedPage.waitForTimeout(500);
    });
});
