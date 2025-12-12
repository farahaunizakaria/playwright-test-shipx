// import { test, expect } from './fixtures/fixtures';
// import { BookingPage } from './pages/BookingPage';

// /**
//  * Test Suite: Booking Functionality
//  * 
//  * Test cases for creating and managing bookings
//  * Uses authenticatedPage fixture to skip login in each test
//  */

// test.describe('Booking Tests', () => {
  
//   test('should create a simple domestic booking successfully', async ({ authenticatedPage }) => {
//     // User is already logged in via authenticatedPage fixture
//     const bookingPage = new BookingPage(authenticatedPage);
    
//     // Wait for user to manually select company if needed (60s timeout)
//     await authenticatedPage.waitForTimeout(5000);
    
//     // Navigate to bookings page
//     await bookingPage.navigateToBookings();
//     await expect(authenticatedPage).toHaveURL(/filter/);
    
//     // Create a unique ID for this test run to avoid duplicate entries
//     const uniqueId = new Date().getTime();

//     // Create booking with all details
//     //use unique id to avoid duplicates -> lead to error if duplicate details
//     const bookingId = await bookingPage.createSimpleBooking({
//       // Step 1: Booking Details
//       billingCustomer: '- Another Base Company Testing',
//       bookingType: 'TRANSPORT',
//       department: 'SOUTH',
//       shipperRef: `SR-${uniqueId}`,
//       customerRef: `CR-${uniqueId}`,
//       remarks: `Automated test run on ${new Date().toISOString()}`,
//       loadType: 'FTL',
//       customerSo: `SO-${uniqueId}`,
//       references: `REF-${uniqueId}`,
//       quotation: 'dev_vTqsipULb',
//       // Step 2: Job Details
//       jobType: 'DOMESTIC',
//       measurementType: 'Linear',
//       quantity: '1000',
//       uom: 'DR',
//       jobRemarks: 'Test Linear',
//       fromCompany: '- Another Base Company Testing',
//       toCompany: '- Another Base Company',
//     });
    
//     // Verify booking was created
//     expect(bookingId).toBeTruthy();
//     console.log(`✅ Booking created successfully with ID: ${bookingId}`);
//   });

// });
