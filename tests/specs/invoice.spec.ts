// import { test, expect } from './fixtures/fixtures';
// import { InvoicePage } from './pages/InvoicePage';
// import { BookingPage } from './pages/BookingPage';

// /**
//  * Test Suite: Invoice Functionality
//  * 
//  * Test cases for creating and managing invoices
//  * Uses authenticatedPage fixture to skip login in each test
//  */

// test.describe('Invoice Tests', () => {
  
//   /**
//    * End-to-End Test: Create booking then invoice
//    * This test demonstrates the full flow from booking creation to invoice generation
//    */
//   test('should create booking and then create invoice for it', async ({ authenticatedPage }) => {
//     // Step 1: Create a booking first
//     const bookingPage = new BookingPage(authenticatedPage);
//     await bookingPage.navigateToBookings();
    
//     const uniqueId = new Date().getTime();
    
//     const bookingId = await bookingPage.createSimpleBooking({
//       billingCustomer: '- Another Base Company Testing',
//       bookingType: 'TRANSPORT',
//       department: 'SOUTH',
//       shipperRef: `SR-${uniqueId}`,
//       customerRef: `CR-${uniqueId}`,
//       remarks: `Test for invoice - ${new Date().toISOString()}`,
//       loadType: 'FTL',
//       customerSo: `SO-${uniqueId}`,
//       references: `REF-${uniqueId}`,
//       quotation: 'dev_vTqsipULb',
//       jobType: 'DOMESTIC',
//       measurementType: 'Linear',
//       quantity: '1000',
//       uom: 'DR',
//       jobRemarks: 'Test Linear',
//       fromCompany: '- Another Base Company Testing',
//       toCompany: '- Another Base Company',
//     });
    
//     expect(bookingId).toBeTruthy();
//     console.log(`✅ Booking created: ${bookingId}`);
    
//     // Step 2: Now create an invoice for this booking
//     const invoicePage = new InvoicePage(authenticatedPage);
    
//     // TODO: Implement invoice creation flow
//     // This will be implemented after codegen recording
//     // await invoicePage.navigateToBooking(bookingId);
//     // await invoicePage.clickCreateCustomerInvoice();
//     // await invoicePage.fillInvoiceForm({ ... });
//     // await invoicePage.submitInvoice();
    
//     console.log(`📝 Ready to create invoice for booking: ${bookingId}`);
//   });
  
//   /**
//    * Test: Create invoice from existing booking
//    * This test assumes a booking already exists and creates an invoice for it
//    */
//   test.skip('should create invoice from existing booking', async ({ authenticatedPage }) => {
//     const invoicePage = new InvoicePage(authenticatedPage);
    
//     // Navigate to dashboard
//     await invoicePage.navigateToDashboard();
    
//     // TODO: Implement flow to:
//     // 1. Search for or select the first available booking
//     // 2. Open booking details
//     // 3. Create invoice
//     // 4. Verify invoice was created
//   });

// });
