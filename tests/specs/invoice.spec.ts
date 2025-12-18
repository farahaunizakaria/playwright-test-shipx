import { test, expect } from '../fixtures/fixtures';
import { InvoicePage } from '../pages/InvoicePage';
import { readFileSync } from 'fs';

const sampleInvoiceData = {
    template: 'INVOICE:DETAILS',
    costItems: [
        {
            chargeItem: 'CS-FAF - FAF Charges',
            sellBaseRate: 1,
            costBaseRate: 1
        }
    ]
};

//TEST 4: TEST CUSTOMER INVOICE & SUPPLIER PAYMENT
test.describe('Customer Invoice', () => {
    
    let invoicePage: InvoicePage;

    test.beforeEach(async ({ authenticatedPage }) => {
        invoicePage = new InvoicePage(authenticatedPage);
    });

    test('should create and submit customer invoice', async ({ authenticatedPage }) => {
        test.setTimeout(60000); // 60 second timeout - approval takes time
        
        // Read booking ID from latest created booking
        let bookingId = '';
        try {
            bookingId = readFileSync('latest-booking-id.txt', 'utf-8').trim();
            console.log(`Using booking ID: ${bookingId}`);
        } catch (e) {
            console.warn('No booking ID file found, skipping invoice test');
            test.skip();
        }

        // Navigate to booking
        await invoicePage.navigateToBooking(bookingId);
        console.log('Booking page loaded');

        // Create and submit invoice
        await invoicePage.createAndSubmitInvoice(sampleInvoiceData);
        console.log('Customer invoice submitted');
        // Approve the customer invoice
        console.log('Approving customer invoice...');
        await invoicePage.approveCustomerInvoice();
        console.log('Customer invoice approved');

        console.log('Customer invoice workflow completed successfully!');
    });

    test('should create supplier payment from approved customer invoice', async ({ authenticatedPage }) => {
        test.setTimeout(60000); // 60 second timeout for supplier payment workflow
        
        // Read booking ID from latest created booking
        let bookingId = '';
        try {
            bookingId = readFileSync('latest-booking-id.txt', 'utf-8').trim();
            console.log(`Using booking ID: ${bookingId}`);
        } catch (e) {
            console.warn('No booking ID file found, skipping supplier payment test');
            test.skip();
        }

        // Step 1: Navigate to booking
        console.log('Step 1: Navigating to booking...');
        await invoicePage.navigateToBooking(bookingId);
        console.log('Booking page loaded');

        // Step 2: Capture the invoice number from approved customer invoice
        console.log('Step 2: Capturing invoice number from customer invoice...');
        const invoiceNumber = await invoicePage.captureInvoiceNumber();
        console.log(`Invoice Number captured: ${invoiceNumber}`);

        // Step 3: Create supplier payment
        console.log('Step 3: Creating supplier payment...');
        await invoicePage.createSupplierPayment(invoiceNumber, sampleInvoiceData);
        console.log('Supplier payment form created');

        // Step 4: Submit supplier payment
        console.log('Step 4: Submitting supplier payment...');
        await invoicePage.submitSupplierPayment();
        console.log('Supplier payment submitted');

        // Step 5: Approve supplier payment
        console.log('Step 5: Approving supplier payment...');
        await invoicePage.approveSupplierPayment();
        console.log('Supplier payment approved');

        console.log('Supplier payment workflow completed successfully!');
    });
});
