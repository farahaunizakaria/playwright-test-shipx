import { test, expect } from '../fixtures/fixtures';
import { BookingCreatePage } from '../pages/BookingPageCodegen_BookingCreatePage';
import { BookingEditPage } from '../pages/BookingPageCodegen_BookingEditPage';
import { JobEditPage } from '../pages/BookingPageCodegen_JobEditPage';
import { DuplicateBookingPage } from '../pages/BookingPageCodegen_DuplicateBooking';
import { CancelBookingPage } from '../pages/BookingPageCodegen_CancelBooking';
import { BookingData } from '../data/BookingData';
import { JobBookingData } from '../data/BookingData';
import { BasePage } from '../pages/BasePage';
import { DateTimeHelper } from '../helper/DateTimeHelper';
import { NumberHelper } from '../helper/NumberHelper';

//TEST 2: CREATE JOB BOOKING
test.describe('Create Booking', () => {

  test('should create booking with dynamic data (IMPORT)', async ({ authenticatedPage }) => {
    test.setTimeout(120000); // Increase timeout for submission tests
    const bookingPage = new BookingCreatePage(authenticatedPage);

    // making one job and no trip to see performance flow
    const timestamp = new Date().getTime();

    const bookingData: BookingData = {
      billingCustomer: '1234567 - Another Base Company Testing',
      bookingType: 'IMPORT',
      deliveryHour: '24 HRS',
      customerRef: `8742-${timestamp}`,
      forwardingAgent: 'Another Base Company',
      shippingAgent: 'Another Base Company Testing',
      shippingRefNo: `Farah Z-${timestamp}`,
      vesselName: NumberHelper.generateVesselName(),
      operatorCode: NumberHelper.generateOperatorCode(),
      voyageNo: NumberHelper.generateVoyageNumber(),
      eta: DateTimeHelper.createDateWithTime(new Date(), 23, 59), // Today at 23:59
      storageDate: DateTimeHelper.createDateWithTime(new Date(), 20, 0), // Today at 20:00
      cmo: DateTimeHelper.createDateWithTime(new Date(), 22, 0), // Today at 22:00
      commodity: 'General Cargo',
      dischargePort: 'JOHOR',
      options: ['directDelivery'],
      remarks: `Automated Testing ${new Date().toISOString()}`,
      estimatedRfcDate: DateTimeHelper.createDateWithTime(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), new Date().getHours(), new Date().getMinutes()), // Tomorrow, same time
      lastPortStorageDate: DateTimeHelper.createDateWithTime(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 0, 0), // Tomorrow at 00:00
      rfcRemarks: `Automated Testing ${new Date().toISOString()}`,
      collectionHours: '24 HOURS',
      confirmcoc: true,
      completeness: true,
    };
  
    const jobData: JobBookingData = {
      jobType:'IMPORT',
      tripOrderFormat: 'Linear',
      containerNo: NumberHelper.generateContainerNumber(), 
      sealNo: NumberHelper.generateSealNumber(), 
      containerSize: '20',
      containerType: 'GP',
      unit: 'km',
      uom: 'TRIP',
      trailerType: 'NORMAL',
      handling: 'DRUM',
      height: '200',
      weight: '2000',
      temperature: '45',
      vesselID: NumberHelper.generateVesselId(), 
      reference: NumberHelper.generateReference(), 
      internalRemark: `Automated Testing ${new Date().toISOString()}`,
      customerRef: `8742-${timestamp}`,
      remarks: `Automated Testing ${new Date().toISOString()}`,
      fromCompanyDelivery: '1234567 - Another Base Company Testing',
      toCompanyDelivery: '1234567 - Another Base Company Testing',
      fromCompanyCollection: '1234567 - Another Base Company Testing',
      toCompanyCollection: '1234567 - Another Base Company Testing',
    };

    await bookingPage.createBooking(bookingData, jobData);

    // Submit the booking so it appears in the dashboard
    await bookingPage.submitBooking();
    
    // Extract booking ID (already redirected to booking page)
    const bookingId = await bookingPage.getBookingIdFromUrl();
    BasePage.saveLatestBookingId(bookingId);
    
    console.log(`✅ Dynamic booking submitted with ref: ${bookingData.shippingRefNo}, ID: ${bookingId}`);
    console.log(`🔗 Booking URL: /bookings/${bookingId}`); 
  });

  test('should edit booking details', async ({ authenticatedPage }) => {
    test.setTimeout(60000);
    const bookingPage = new BookingEditPage(authenticatedPage);

    // Reuse booking
    const bookingId = BasePage.readLatestBookingId();
    if (!bookingId) {
      throw new Error('No booking ID found. Run create booking test first.');
    }

    // Navigate to the booking
    await bookingPage.page.goto(`/bookings/${bookingId}`);
    await bookingPage.page.waitForLoadState('domcontentloaded');
    
    // Edit delivery hour only
    await bookingPage.editBookingDeliveryHour('OFFICE HRS');
    
    console.log(`✅ Booking ${bookingId} edited: Delivery Hour → 'OFFICE HRS'`);
  });

  test('should edit job container size', async ({ authenticatedPage }) => {
    test.setTimeout(60000);
    const bookingPage = new JobEditPage(authenticatedPage);

    // Reuse booking from create test
    const bookingId = BasePage.readLatestBookingId();
    if (!bookingId) {
      throw new Error('No booking ID found. Run create booking test first.');
    }

    // Navigate to the booking
    await bookingPage.page.goto(`/bookings/${bookingId}`);
    await bookingPage.page.waitForLoadState('domcontentloaded');
    
    // Edit job: accept (if needed), edit container size, and update
    // This will work whether the booking was already accepted by test 2 or not
    await bookingPage.editJobDetails('45');
    
    console.log(`✅ Booking ${bookingId} job edited: Container Size → '45'`);
  });

  test('should duplicate booking', async ({ authenticatedPage }) => {
    test.setTimeout(60000);
    const duplicatePage = new DuplicateBookingPage(authenticatedPage);

    // Reuse booking from create test
    const bookingId = BasePage.readLatestBookingId();
    if (!bookingId) {
      throw new Error('No booking ID found. Run create booking test first.');
    }

    // Navigate to the booking
    await duplicatePage.page.goto(`/bookings/${bookingId}`);
    await duplicatePage.page.waitForLoadState('domcontentloaded');
    
    // Duplicate the booking: accept if needed, duplicate, and submit
    await duplicatePage.duplicateBooking();
    
    // Extract new booking ID
    const newBookingId = await duplicatePage.getBookingIdFromUrl();
    
    console.log(`✅ Booking ${bookingId} duplicated → New booking ID: ${newBookingId}`);
  });

  test('should cancel booking', async ({ authenticatedPage }) => {
  test.setTimeout(60000);
  const cancelPage = new CancelBookingPage(authenticatedPage);

  // Reuse booking from create test
  const bookingId = BasePage.readLatestBookingId();
  if (!bookingId) {
    throw new Error('No booking ID found. Run create booking test first.');
  }

  // Navigate to the booking
  await cancelPage.page.goto(`/bookings/${bookingId}`);
  await cancelPage.page.waitForLoadState('domcontentloaded');
  
  // Cancel the booking: accept if needed, click cancel, fill reason, and confirm
  await cancelPage.cancelBooking('Automated test cancellation');
  
  console.log(`✅ Booking ${bookingId} cancelled successfully`);
});

});