import { test, expect } from '../fixtures/fixtures';
import { InvoicePage } from '../pages/InvoicePage';

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
        test.setTimeout(60000);
        
        // Use BasePage method instead of direct readFileSync
        const bookingId = invoicePage.getLatestBookingId();
        if (!bookingId) {
            throw new Error('No booking ID found. Run create-booking test first.');
        }
        console.log(`📋 Using booking: ${bookingId}`);
        
        await invoicePage.navigateToBooking(bookingId);
        await invoicePage.createAndSubmitInvoice(sampleInvoiceData);
        await invoicePage.approveCustomerInvoice();
    });

    test('should create supplier payment from approved customer invoice', async ({ authenticatedPage }) => {
        test.setTimeout(60000);
        
        // Use BasePage method instead of direct readFileSync
        const bookingId = invoicePage.getLatestBookingId();
        if (!bookingId) {
            throw new Error('No booking ID found. Run create-booking test first.');
        }
        console.log(`📋 Using booking: ${bookingId}`);
        
        await invoicePage.navigateToBooking(bookingId);
        const invoiceNumber = await invoicePage.captureInvoiceNumber();
        await invoicePage.createSupplierPayment(invoiceNumber, sampleInvoiceData);
        await invoicePage.submitSupplierPayment();
        await invoicePage.approveSupplierPayment();
    });
});
