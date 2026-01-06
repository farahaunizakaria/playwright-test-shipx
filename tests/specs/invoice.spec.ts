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

const sampleSupplierPaymentData = {
    invoiceNumber: '', // Will be captured from customer invoice
    payTo: '123456 - Another Base Company',
    template: 'INVOICE:DETAILS'
};

//TEST 4: TEST CUSTOMER INVOICE & SUPPLIER PAYMENT
test.describe('Customer Invoice', () => {
    
    let invoicePage: InvoicePage;

    test.beforeEach(async ({ authenticatedPage }) => {
        invoicePage = new InvoicePage(authenticatedPage);
    });

    test('should create and submit customer invoice', async ({ authenticatedPage }) => {
        test.setTimeout(60000);
        
        const bookingId = invoicePage.getLatestBookingId();
        if (!bookingId) {
            throw new Error('No booking ID found. Run create-booking test first.');
        }
        console.log(`📋 Using booking: ${bookingId}`);
        
        await invoicePage.navigateToBooking(bookingId);
        await invoicePage.createAndSubmitInvoice({
            template: sampleInvoiceData.template,
            costItems: sampleInvoiceData.costItems
        });
        await invoicePage.approveCustomerInvoice();
    });

    test('should create supplier payment from approved customer invoice', async ({ authenticatedPage }) => {
        test.setTimeout(60000);
        
        const bookingId = invoicePage.getLatestBookingId();
        if (!bookingId) {
            throw new Error('No booking ID found. Run create-booking test first.');
        }
        console.log(`📋 Using booking: ${bookingId}`);
        
        await invoicePage.navigateToBooking(bookingId);
        const invoiceNumber = await invoicePage.captureInvoiceNumber();
        
        await invoicePage.createSupplierPayment({
            invoiceNumber,
            payTo: sampleSupplierPaymentData.payTo,
            template: sampleSupplierPaymentData.template
        });
        await invoicePage.submitSupplierPayment();
        await invoicePage.approveSupplierPayment();
    });
});
