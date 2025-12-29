import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

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

export class InvoicePage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    // ===== HELPER METHODS =====

    /**
     * Helper: Open a dropdown by placeholder text
     */
    private async openDropdown(placeholderText: string) {
        const dropdown = this.page.locator('div')
            .filter({ hasText: new RegExp(`^${placeholderText}$`) }).nth(4);
        await dropdown.waitFor({ state: 'visible', timeout: 3000 });
        await dropdown.click();
        await this.page.waitForTimeout(800);
    }

    /**
     * Helper: Select a template from dropdown
     */
    private async selectTemplate(templateName: string) {
        await this.openDropdown('Select a template...');
        
        const template = this.page.locator(`[title="${templateName}"]`).first();
        await template.waitFor({ state: 'visible', timeout: 3000 });
        await template.click();
        await this.page.waitForTimeout(1500);
    }

    /**
     * Helper: Click the "Create and Submit" button
     */
    private async clickSubmitButton() {
        await this.page.waitForTimeout(1000);
        
        // Optional: Click charge item anchor if visible
        const chargeItemAnchor = this.page.locator('#select-charge-item-0-anchor');
        if (await chargeItemAnchor.isVisible({ timeout: 1000 }).catch(() => false)) {
            await chargeItemAnchor.click();
            await this.page.waitForTimeout(500);
        }
        
        const submitButton = this.page.getByRole('button', { name: 'Create and Submit' });
        await submitButton.waitFor({ state: 'visible', timeout: 3000 });
        await submitButton.click();
        await this.page.waitForTimeout(2000);
    }

    // ===== PUBLIC METHODS =====

    /**
     * Navigate to a booking by ID
     * @param bookingId The booking ID to navigate to
     */
    async navigateToBooking(bookingId: string) {
        await this.page.goto(`/bookings/${bookingId}`);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(500);
    }

    /**
     * Create a new customer invoice for the booking
     * @param data Invoice data including template and cost items
     */
    async createCustomerInvoice(data: InvoiceData) {
        console.log('Starting customer invoice creation...');

        // Click voucher types button
        console.log('Opening voucher types menu...');
        await this.page.locator('#voucher-types-button').click();
        await this.page.waitForTimeout(1000); // Increased wait for menu to appear

        // Select Customer Invoice
        console.log('Selecting "Customer Invoice"...');
        await this.page.getByRole('button', { name: 'dollar Customer Invoice' }).click();
        await this.page.waitForTimeout(1500);

        // Select template
        await this.selectTemplate(data.template);

        // Add cost items
        for (let i = 0; i < data.costItems.length; i++) {
            const item = data.costItems[i];
            await this.addCostItem(item, i);
            // Wait between items to ensure form is ready
            await this.page.waitForTimeout(500);
        }

        console.log('All cost items added');
    }

    /**
     * Add a single cost item to the invoice
     * @param item Cost item data
     * @param index Item index (for logging)
     */
    private async addCostItem(item: InvoiceCostItem, index: number) {
        console.log(`   Adding cost item #${index + 1}: ${item.chargeItem}...`);

        // Click "Add new cost item" button
        const addButton = this.page.locator('#invoice-add-new-cost-item-button');
        await addButton.waitFor({ state: 'visible', timeout: 3000 });
        await addButton.click();
        await this.page.waitForTimeout(1000);

        // Click charge item dropdown and select
        await this.openDropdown('Select a charge item...');

        const chargeOption = this.page.locator('div').filter({ hasText: new RegExp(`^${item.chargeItem}$`) }).first();
        await chargeOption.waitFor({ state: 'visible', timeout: 3000 });
        await chargeOption.click();
        await this.page.waitForTimeout(800);

        // Fill Sell Base Rate
        const sellRateField = this.page.getByRole('spinbutton', { name: '* Sell Base Rate' });
        await sellRateField.waitFor({ state: 'visible', timeout: 3000 });
        await sellRateField.click();
        await sellRateField.fill(String(item.sellBaseRate));
        await this.page.waitForTimeout(400);

        // Fill Cost Base Rate
        const costRateField = this.page.getByRole('spinbutton', { name: '* Cost Base Rate' });
        await costRateField.waitFor({ state: 'visible', timeout: 3000 });
        await costRateField.click();
        await costRateField.fill(String(item.costBaseRate));
        await this.page.waitForTimeout(400);

        // Click Create button to add the item
        const createButton = this.page.getByLabel('Add new cost item').getByRole('button', { name: 'Create' });
        await createButton.waitFor({ state: 'visible', timeout: 3000 });
        await createButton.click();
        await this.page.waitForTimeout(1200); // Wait for item to be added and form to reset

        console.log(`Cost item added: ${item.chargeItem}`);
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
     * Approve a customer invoice
     */
    async approveCustomerInvoice() {
        const approvalButton = this.page.getByRole('button', { name: /exclamation-circle Customer/ });
        await approvalButton.waitFor({ state: 'visible', timeout: 3000 });
        await approvalButton.click();
        await this.page.waitForTimeout(500);

        const approveBtn = this.page.getByRole('button', { name: 'Approve' });
        await approveBtn.waitFor({ state: 'visible', timeout: 3000 });
        await approveBtn.click();
        await this.page.waitForSelector('text=has been approved', { timeout: 5000 }).catch(() => null);
        await this.page.waitForTimeout(500);
    }

    /**
     * Capture the invoice number from the approved customer invoice
     * @returns The invoice number
     */
    async captureInvoiceNumber(): Promise<string> {
        await this.page.waitForTimeout(1000);
        const invoiceNumberElement = this.page.locator('div').filter({ hasText: /^_INV\d{8}$/ }).first();
        await invoiceNumberElement.waitFor({ state: 'visible', timeout: 3000 });
        const invoiceNumber = await invoiceNumberElement.textContent();
        return invoiceNumber || '';
    }

    /**
     * Create a supplier payment 
     * @param invoiceNumber The invoice number from customer invoice
     * @param supplierData Supplier payment data
     */
    async createSupplierPayment(invoiceNumber: string, supplierData: InvoiceData) {
        console.log(`💸 Starting supplier payment creation for invoice: ${invoiceNumber}...`);

        // Click voucher types button
        console.log('Opening voucher types menu...');
        await this.page.locator('#voucher-types-button').click();
        await this.page.waitForTimeout(1000);

        // Select Supplier Payment
        console.log('Selecting "Supplier Payment"...');
        await this.page.getByRole('button', { name: 'file Supplier Payment' }).click();
        await this.page.waitForTimeout(1500); // Wait for page transition

        // Fill Invoice Number
        console.log(`Filling invoice number: ${invoiceNumber}...`);
        const invoiceNumberField = this.page.getByRole('textbox', { name: '* Invoice No.' });
        await invoiceNumberField.waitFor({ state: 'visible', timeout: 3000 });
        await invoiceNumberField.click();
        await invoiceNumberField.fill(invoiceNumber);
        await this.page.waitForTimeout(800);

        // Select company
        await this.openDropdown('Select a company...');

        const companyOption = this.page.locator('.ant-select-item').first();
        await companyOption.waitFor({ state: 'visible', timeout: 3000 });
        await companyOption.click();
        await this.page.waitForTimeout(1000);

        // Select template
        await this.selectTemplate(supplierData.template);
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
        const approvalButton = this.page.getByRole('button', { name: /exclamation-circle Trans/ });
        await approvalButton.waitFor({ state: 'visible', timeout: 3000 });
        await approvalButton.click();
        await this.page.waitForTimeout(500);

        const approveBtn = this.page.getByRole('button', { name: 'Approve' });
        await approveBtn.waitFor({ state: 'visible', timeout: 3000 });
        await approveBtn.click();
        await this.page.waitForTimeout(1000);
    }
}
