import { test, expect } from '../fixtures/fixtures';
import { BookingPageCodegen } from '../pages/BookingPageCodegen';
import { BookingData } from '../data/BookingData';

/*
 * Test Suite: Booking Functionality using Codegen-based Page Object
 * to track new booking with added jobs and trips
 */

test.describe('Booking Tests - Codegen Implementation', () => {

  test('should create a new booking with static data', async ({ authenticatedPage }) => {
    const bookingPage = new BookingPageCodegen(authenticatedPage);

    //test #1
    // Booking data (no login credentials needed - handled by fixture)
    //create booking with one job and no trip
    //use static data to test a normal flow 
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
    
    console.log('✅ Booking form completed with static data (ready for job/trip additions)!');
    //purpose: test filling booking form only for booking page and job info page
  });

  test('should create booking with dynamic data', async ({ authenticatedPage }) => {
    test.setTimeout(60000); // Increase timeout for submission tests
    const bookingPage = new BookingPageCodegen(authenticatedPage);
    
    //Test #2
    // Generate unique identifiers for this test run
    // making one job and no trip to see performance flow
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

    // Submit the booking so it appears in the dashboard
    await bookingPage.submitBooking();
    
    // Extract booking ID (already redirected to booking page)
    //To verify the booking was created (not "new")
    //booking id not been used in Test#3
    const bookingId = await bookingPage.getBookingIdFromUrl(); 
    
    console.log(`✅ Dynamic booking submitted with ref: ${bookingData.shipperRef}, ID: ${bookingId}`);
    
    // purpose: test full booking creation and submission flow with dynamic data
  });

  test('should create booking with one additional trip (1 Job, 2 Trips)', async ({ authenticatedPage }) => {
    test.setTimeout(60000); // Increase timeout for submission tests
    const bookingPage = new BookingPageCodegen(authenticatedPage);
    const timestamp = new Date().getTime();

    //Test #3
    //use dynamic data 
    // to test job booking with trips
    // Step 1: Create base booking with Job #1, Trip #1
    const bookingData: BookingData = {
      billingCustomer: '30050 - TOTAL ENERGIES',
      bookingType: 'TRANSPORT',
      department: 'NORTH',
      shipperRef: `ADDTRIP-${timestamp}`,
      customerRef: `AT-${timestamp}`,
      remarks: `Automated test - ${timestamp}`,
      loadType: 'FTL',
      customerSo: `SO-${timestamp}`,
      references: `Test run ${new Date().toISOString()}`,
      quotation: 'dev_Vwhf8d947',
      jobType: 'DOMESTIC',
      measurementType: 'Linear',
      quantity: 'km',
      uom: 'TRIP',
      fromCompany: '30050 - TOTAL ENERGIES',
      toCompany: '30050 - TOTAL ENERGIES',
    };

    await bookingPage.createBooking(bookingData);

    // Step 2: Add Job #1 remarks and Trip #1 remarks (already on Job Details page)
    await bookingPage.fillJobRemarks(0, 'Job #1 - Single additional trip test');
    await bookingPage.fillTripRemarks(1, 'Trip #1: Warehouse → Customer A');

    // Step 3: Add Trip #2
    await bookingPage.addTrip();
    await bookingPage.fillTripRemarks(2, 'Trip #2: Customer A → Customer B');

    // Step 4: Submit booking using helper method
    await bookingPage.submitBooking();

    // Step 5: Extract booking ID from page
    // To confirm booking was created (URL changed from /bookings/new to /bookings/{id})
    // To log which booking was created
    const bookingId = await bookingPage.getBookingIdFromUrl();
    
    console.log(`✅ Booking created with ID: ${bookingId}`);
  });

});
