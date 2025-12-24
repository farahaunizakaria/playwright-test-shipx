import { Page } from "@playwright/test";

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

export class InvoicePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigate to a booking by ID
     * @param bookingId The booking ID to navigate to
     */
    async navigateToBooking(bookingId: string) {
        console.log(`Navigating to booking: ${bookingId}`);
        await this.page.goto(`/bookings/${bookingId}`);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
        console.log('Booking page loaded');
    }

    /**
     * Create a new customer invoice for the booking
     * @param data Invoice data including template and cost items
     */
    async createCustomerInvoice(data: InvoiceData) {
        console.log('Starting customer invoice creation...');

        // Step 1: Click voucher types button
        console.log('Opening voucher types menu...');
        await this.page.locator('#voucher-types-button').click();
        await this.page.waitForTimeout(1000); // Increased wait for menu to appear

        // Step 2: Select Customer Invoice
        console.log('Selecting "Customer Invoice"...');
        await this.page.getByRole('button', { name: 'dollar Customer Invoice' }).click();
        await this.page.waitForTimeout(1500); // Wait for page transition

        // Step 3: Select template
        console.log(`Selecting template: ${data.template}...`);
        const templateDropdown = this.page.locator('div').filter({ hasText: /^Select a template\.\.\.$/ }).nth(4);
        await templateDropdown.waitFor({ state: 'visible', timeout: 3000 });
        await templateDropdown.click();
        await this.page.waitForTimeout(800);
        
        // Click the specific template
        const template = this.page.locator(`[title="${data.template}"]`).first();
        await template.waitFor({ state: 'visible', timeout: 3000 });
        await template.click();
        await this.page.waitForTimeout(1500); // Wait for template to load and form to initialize
        console.log(`Template "${data.template}" selected`);

        // Step 4: Add cost items
        console.log('Adding cost items...');
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
        await this.page.waitForTimeout(1000); // Wait for form to appear

        // Click charge item dropdown
        const chargeDropdown = this.page.locator('div').filter({ hasText: /^Select a charge item\.\.\.$/ }).nth(4);
        await chargeDropdown.waitFor({ state: 'visible', timeout: 3000 });
        await chargeDropdown.click();
        await this.page.waitForTimeout(800); // Wait for options to appear

        // Select the charge item
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

        console.log(`      Cost item added: ${item.chargeItem}`);
    }

    /**
     * Submit the invoice (Create and Submit)
     */
    async submitInvoice() {
        console.log('Submitting invoice...');

        // Wait for form to be ready
        await this.page.waitForTimeout(1500);

        // Click the charge item anchor/button to confirm selection
        console.log('Confirming charge item selection...');
        try {
            const chargeItemAnchor = this.page.locator('#select-charge-item-0-anchor');
            const isVisible = await chargeItemAnchor.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
                await chargeItemAnchor.click();
                await this.page.waitForTimeout(800);
                console.log('Charge item anchor clicked');
            }
        } catch (e) {
            console.log(`Charge item anchor not found: ${e}`);
        }

        // Click "Create and Submit" button
        console.log('Clicking "Create and Submit"...');
        await this.page.waitForTimeout(1000); // Extra wait to ensure form is ready
        
        const submitButton = this.page.getByRole('button', { name: 'Create and Submit' });
        await submitButton.waitFor({ state: 'visible', timeout: 3000 });
        await submitButton.click();
        await this.page.waitForTimeout(3000); // Wait for submission to complete

        console.log('Invoice submitted successfully!');
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
        console.log('Approving customer invoice...');
        
        // Click the approval button (exclamation-circle Customer button)
        const approvalButton = this.page.getByRole('button', { name: /exclamation-circle Customer/ });
        await approvalButton.waitFor({ state: 'visible', timeout: 3000 });
        await approvalButton.click();
        await this.page.waitForTimeout(800);
        console.log('Approval button clicked');

        // Click the "Approve" button
        const approveBtn = this.page.getByRole('button', { name: 'Approve' });
        await approveBtn.waitFor({ state: 'visible', timeout: 3000 });
        await approveBtn.click();
        
        // Wait for approval success message to appear
        await this.page.waitForSelector('text=has been approved', { timeout: 5000 }).catch(() => null);
        await this.page.waitForTimeout(1000); // Additional buffer
        console.log('Customer invoice approved');
    }

    /**
     * Capture the invoice number from the approved customer invoice
     * @returns The invoice number
     */
    async captureInvoiceNumber(): Promise<string> {
        console.log('Capturing invoice number...');
        
        // Wait for invoice number to appear in the list
        await this.page.waitForTimeout(1500);
        
        // The invoice number appears in a div with format like _INV25120006
        const invoiceNumberElement = this.page.locator('div').filter({ hasText: /^_INV\d{8}$/ }).first();
        await invoiceNumberElement.waitFor({ state: 'visible', timeout: 3000 });
        
        const invoiceNumber = await invoiceNumberElement.textContent();
        console.log(`Invoice number captured: ${invoiceNumber}`);
        
        return invoiceNumber || '';
    }

    /**
     * Create a supplier payment 
     * @param invoiceNumber The invoice number from customer invoice
     * @param supplierData Supplier payment data
     */
    async createSupplierPayment(invoiceNumber: string, supplierData: InvoiceData) {
        console.log(`💸 Starting supplier payment creation for invoice: ${invoiceNumber}...`);

        // Step 1: Click voucher types button
        console.log('Opening voucher types menu...');
        await this.page.locator('#voucher-types-button').click();
        await this.page.waitForTimeout(1000);

        // Step 2: Select Supplier Payment
        console.log('Selecting "Supplier Payment"...');
        await this.page.getByRole('button', { name: 'file Supplier Payment' }).click();
        await this.page.waitForTimeout(1500); // Wait for page transition

        // Step 3: Fill Invoice Number
        console.log(`Filling invoice number: ${invoiceNumber}...`);
        const invoiceNumberField = this.page.getByRole('textbox', { name: '* Invoice No.' });
        await invoiceNumberField.waitFor({ state: 'visible', timeout: 3000 });
        await invoiceNumberField.click();
        await invoiceNumberField.fill(invoiceNumber);
        await this.page.waitForTimeout(800);
        console.log('Invoice number filled');

        // Step 4: Select company
        console.log('Selecting company...');
        const companyDropdown = this.page.locator('div').filter({ hasText: /^Select a company\.\.\.$/ }).nth(4);
        await companyDropdown.waitFor({ state: 'visible', timeout: 3000 });
        await companyDropdown.click();
        await this.page.waitForTimeout(800);

        // Select first company option
        const companyOption = this.page.locator('.ant-select-item').first();
        await companyOption.waitFor({ state: 'visible', timeout: 3000 });
        await companyOption.click();
        await this.page.waitForTimeout(1000);
        console.log('Company selected');

        // Step 5: Select template
        console.log(`Selecting template: ${supplierData.template}...`);
        const templateDropdown = this.page.locator('div').filter({ hasText: /^Select a template\.\.\.$/ }).nth(4);
        await templateDropdown.waitFor({ state: 'visible', timeout: 3000 });
        await templateDropdown.click();
        await this.page.waitForTimeout(800);
        
        // Click the specific template
        const template = this.page.locator(`[title="${supplierData.template}"]`).first();
        await template.waitFor({ state: 'visible', timeout: 3000 });
        await template.click();
        await this.page.waitForTimeout(1500); // Wait for template to load
        console.log(`Template "${supplierData.template}" selected`);
    }

    /**
     * Submit the supplier payment
     */
    async submitSupplierPayment() {
        console.log('Submitting supplier payment...');

        // Wait for form to be ready
        await this.page.waitForTimeout(1500);

        // Click the charge item anchor to confirm selection
        console.log('Confirming charge item selection...');
        try {
            const chargeItemAnchor = this.page.locator('#select-charge-item-0-anchor');
            const isVisible = await chargeItemAnchor.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
                await chargeItemAnchor.click();
                await this.page.waitForTimeout(800);
                console.log('Charge item anchor clicked');
            }
        } catch (e) {
            console.log(`Charge item anchor not found: ${e}`);
        }

        // Click "Create and Submit" button
        console.log('Clicking "Create and Submit"...');
        await this.page.waitForTimeout(1000);
        
        const submitButton = this.page.getByRole('button', { name: 'Create and Submit' });
        await submitButton.waitFor({ state: 'visible', timeout: 3000 });
        await submitButton.click();
        await this.page.waitForTimeout(3000); // Wait for submission to complete

        console.log('Supplier payment submitted successfully!');
    }

    /**
     * Approve a supplier payment
     */
    async approveSupplierPayment() {
        console.log('Approving supplier payment...');
        
        // Click the approval button (exclamation-circle Trans button)
        const approvalButton = this.page.getByRole('button', { name: /exclamation-circle Trans/ });
        await approvalButton.waitFor({ state: 'visible', timeout: 3000 });
        await approvalButton.click();
        await this.page.waitForTimeout(800);
        console.log('Approval button clicked');

        // Click the "Approve" button
        const approveBtn = this.page.getByRole('button', { name: 'Approve' });
        await approveBtn.waitFor({ state: 'visible', timeout: 3000 });
        await approveBtn.click();
        await this.page.waitForTimeout(2000); // Wait for approval to complete
        console.log('Supplier payment approved');
    }
}
