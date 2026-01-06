import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { DropdownHelper, WaitHelper, ModalHelper } from '../helper';

/**
 * InvoiceData interfaces for creating customer invoices and supplier payments
 */
export interface InvoiceCostItem {
    chargeItem: string;           // e.g., "CS-FAF - FAF Charges"
    sellBaseRate: string | number;
    costBaseRate: string | number;
}

export interface InvoiceData {
    template: string;             // e.g., "INVOICE:DETAILS"
    costItems: InvoiceCostItem[];
}

export interface SupplierPaymentData {
    invoiceNumber: string;        // e.g., "_INV12345678"
    payTo: string;                // Company name to pay to
    template: string;             // e.g., "INVOICE:DETAILS"
}

export class InvoicePage extends BasePage {
    private dropdownHelper: DropdownHelper;
    private waitHelper: WaitHelper;
    private modalHelper: ModalHelper;

    constructor(page: Page) {
        super(page);
        this.dropdownHelper = new DropdownHelper(page);
        this.waitHelper = new WaitHelper(page);
        this.modalHelper = new ModalHelper(page);
    }

    // ===== HELPER METHODS =====

    /**
     * Helper: Click the "Create and Submit" button in invoice
     */
    private async clickSubmitButton() {
        await this.waitHelper.wait(1000);
        
        // Optional: Click charge item anchor if visible
        const chargeItemAnchor = this.page.locator('#select-charge-item-0-anchor'); //suppose to choose the latest idk 
        if (await chargeItemAnchor.isVisible({ timeout: 1000 }).catch(() => false)) {
            await chargeItemAnchor.click();
            await this.waitHelper.wait(500);
        }
        
        //const submitButton = this.page.getByRole('button', { name: 'Create and Submit' }); submit-invoice-button
        const submitButton = this.page.locator('#submit-invoice-button');
        await submitButton.waitFor({ state: 'visible', timeout: 3000 });
        await submitButton.click();
        await this.waitHelper.wait(2000);
    }

    // ===== PUBLIC METHODS =====

    /**
     * Navigate to a booking by ID
     * @param bookingId The booking ID to navigate to
     */
    async navigateToBooking(bookingId: string) {
        await this.page.goto(`/bookings/${bookingId}`);
        await this.waitHelper.waitForPageLoad('domcontentloaded');
        await this.waitHelper.wait(500);
    }

    /**
     * Create a new customer invoice for the booking
     * @param data Invoice data including template and cost items
     */
    async createCustomerInvoice(data: InvoiceData) {
        // Click voucher types button
        await this.page.locator('#voucher-types-button').click();
        await this.waitHelper.wait(1000);

        // Select Customer Invoice
        await this.page.locator('#voucher-option-ACCREC').click();
        await this.waitHelper.waitForPageLoad('networkidle').catch(() => {});
        
        await this.waitHelper.wait(3000);

        // Select document type/template
        //use '#documentCreatorTemplateUuid' instead of '#invoice-document-type-selector'
        await this.page.locator('#documentCreatorTemplateUuid').click();
        await this.waitHelper.wait(500);
        await this.dropdownHelper.selectDropdownOption(data.template);

        // Add cost items
        for (let i = 0; i < data.costItems.length; i++) {
            const item = data.costItems[i];
            await this.addCostItem(item, i);
            await this.waitHelper.wait(500);
        }
    }

    /**
     * Add a single cost item to the invoice
     * @param item Cost item data
     * @param index Item index
     */
    private async addCostItem(item: InvoiceCostItem, index: number) {
        // Open "Add new cost item" modal
        await this.page.locator('#invoice-add-new-cost-item-button').click();
        await this.waitHelper.wait(300);

        // Click charge item dropdown and select
        await this.page.locator('#cost-charge-item-selector').click();
        await this.waitHelper.wait(300);
        await this.dropdownHelper.selectDropdownOption(item.chargeItem);

        // Fill Sell Base Rate
        const sellRateField = this.page.locator('#sellBaseRate');
        await sellRateField.waitFor({ state: 'visible', timeout: 3000 });
        await sellRateField.click();
        await sellRateField.fill(String(item.sellBaseRate));
        await this.waitHelper.wait(400);

        // Fill Cost Base Rate
        const costRateField = this.page.locator('#costBaseRate');
        await costRateField.waitFor({ state: 'visible', timeout: 3000 });
        await costRateField.click();
        await costRateField.fill(String(item.costBaseRate));
        await this.waitHelper.wait(400);

        // Submit modal to add the item
        await this.modalHelper.submitModal('#create-cost-item-button');
        await this.waitHelper.wait(1200);
    }

    /**
     * Submit the invoice (Create and Submit)
     */
    async submitInvoice() {
        await this.clickSubmitButton();
    }

    /**
     * Complete invoice creation workflow (create + submit)
     * @param data Invoice data
     */
    async createAndSubmitInvoice(data: InvoiceData) {
        await this.createCustomerInvoice(data);
        await this.submitInvoice();
    }

    /**
     * Private helper: Approve a voucher (invoice or payment)
     */
    private async approveVoucher() {
        await this.waitHelper.wait(1000);
        
        const approvalButton = this.page.locator('#approval-selector');
        const buttonExists = await approvalButton.count();
        
        if (buttonExists === 0) {
            console.log('⚠️  Approval button not found - voucher may already be approved or in different state');
            return;
        }
        
        await approvalButton.waitFor({ state: 'visible', timeout: 3000 });
        await approvalButton.click();
        await this.waitHelper.wait(500);

        const approveBtn = this.page.locator('#finance-approve-voucher-button');
        await approveBtn.waitFor({ state: 'visible', timeout: 3000 });
        await approveBtn.click();
        await this.page.waitForSelector('text=has been approved', { timeout: 5000 }).catch(() => null);
        await this.waitHelper.wait(500);
    }

    /**
     * Approve a customer invoice
     */
    async approveCustomerInvoice() {
        await this.approveVoucher();
    }

    /**
     * Capture the invoice number from the approved customer invoice
     * @returns The invoice number
     */
    async captureInvoiceNumber(): Promise<string> {
        await this.waitHelper.wait(1000);
        const invoiceNumberElement = this.page.locator('div').filter({ hasText: /^_INV\d{8}$/ }).first();
        await invoiceNumberElement.waitFor({ state: 'visible', timeout: 3000 });
        const invoiceNumber = await invoiceNumberElement.textContent();
        return invoiceNumber || '';
    }

    /**
     * Create a supplier payment 
     * @param supplierData Supplier payment data including invoice number, pay to company, and template
     */
    async createSupplierPayment(supplierData: SupplierPaymentData) {
        // Click voucher types button
        await this.page.locator('#voucher-types-button').click();
        await this.waitHelper.wait(1000);

        // Select Supplier Payment
        await this.page.locator('#voucher-option-ACCPAY').click();
        await this.waitHelper.wait(1500);

        // Fill Invoice Number
        //const invoiceNumberField = this.page.getByRole('textbox', { name: '* Invoice No.' });
        const invoiceNumberField = this.page.locator('#invoiceNumber');
        await invoiceNumberField.waitFor({ state: 'visible', timeout: 3000 });
        await invoiceNumberField.click();
        await invoiceNumberField.fill(supplierData.invoiceNumber);
        await this.waitHelper.wait(800);

        // Select Pay To company
        //await this.page.locator('#supplier-company-selector').click();
        await this.page.locator('#form-company-selector').click();
        await this.waitHelper.wait(300);
        await this.dropdownHelper.selectDropdownOption(supplierData.payTo);
        await this.waitHelper.wait(1000);

        // Select document type/template
        await this.page.locator('#documentCreatorTemplateUuid').click();
        await this.waitHelper.wait(500);
        await this.dropdownHelper.selectDropdownOption(supplierData.template);
    }

    /**
     * Submit the supplier payment
     */
    async submitSupplierPayment() {
        await this.clickSubmitButton();
    }

    /**
     * Approve a supplier payment
     */
    async approveSupplierPayment() {
        await this.approveVoucher();
    }
}
