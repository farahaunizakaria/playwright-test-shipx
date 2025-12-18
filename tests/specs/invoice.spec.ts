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
        test.setTimeout(30000); // 30 second timeout
        
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

        // Create and submit invoice
        await invoicePage.createAndSubmitInvoice(sampleInvoiceData);

        console.log('Customer invoice created and submitted successfully!');
    });
});
