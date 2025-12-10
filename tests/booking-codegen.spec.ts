import { test, expect } from './fixtures/fixtures';
import { BookingPageCodegen } from './pages/BookingPageCodegen';
import { BookingData } from './data/BookingData';

/**
 * Test Suite: Booking Functionality using Codegen-based Page Object
 * 
 * This test uses the BookingPageCodegen class which implements the exact
 * flow recorded from Playwright Codegen for creating bookings.
 * 
 * IMPROVEMENTS:
 * - Smart waits instead of fixed timeouts
 * - Hover before interactions (fixes dropdown/input issues)
 * - Retry logic for flaky operations
 * - Better error messages for debugging
 * - Handles network-based timing issues
 */
test.describe('Booking Tests - Codegen Implementation', () => {

  test('should create a new booking using codegen flow', async ({ authenticatedPage }) => {
    const bookingPage = new BookingPageCodegen(authenticatedPage);

    // Booking data (no login credentials needed - handled by fixture)
    const bookingData: BookingData = {
      billingCustomer: '30050 - TOTAL ENERGIES',
      bookingType: 'TRANSPORT',
      department: 'NORTH',
      shipperRef: 'Farah Z',
      customerRef: '8742',
      remarks: 'Manual Testing 9/12',
      loadType: 'LTL',
      customerSo: '1001',
      references: 'Manual Testing 9/12',
      quotation: 'dev_4D7Z21f4B',
      jobType: 'DOMESTIC',
      measurementType: 'Linear',
      quantity: 'km',
      uom: 'TRIP',
      fromCompany: '- Another Base Company Testing',
      toCompany: '- Another Base Company Testing',
    };

    await bookingPage.createBooking(bookingData);

    // Verify we're on the booking details page after creation
    await expect(authenticatedPage).toHaveURL(/\/bookings\//);
    
    console.log('✅ Booking created successfully using codegen flow!');
  });

  test('should create booking with dynamic data', async ({ authenticatedPage }) => {
    const bookingPage = new BookingPageCodegen(authenticatedPage);
    
    // Generate unique identifiers for this test run
    const timestamp = new Date().getTime();

    const bookingData: BookingData = {
      billingCustomer: '1234567 - Another Base Company Testing',
      bookingType: 'TRANSPORT',
      department: 'NORTH',
      shipperRef: `Farah Z-${timestamp}`,
      customerRef: `8742-${timestamp}`,
      remarks: `Automated Testing ${new Date().toISOString()}`,
      loadType: 'LTL',
      customerSo: `1001-${timestamp}`,
      references: `Automated Testing ${new Date().toISOString()}`,
      quotation: 'dev_4D7Z21f4B',
      jobType: 'DOMESTIC',
      measurementType: 'Linear',
      quantity: 'km',
      uom: 'TRIP',
      fromCompany: '1234567 - Another Base Company Testing',
      toCompany: '1234567 - Another Base Company Testing',
    };

    await bookingPage.createBooking(bookingData);

    // Verify booking creation
    await expect(authenticatedPage).toHaveURL(/\/bookings\//);
    
    console.log(`✅ Dynamic booking created with ref: ${bookingData.shipperRef}`);
  });

});
