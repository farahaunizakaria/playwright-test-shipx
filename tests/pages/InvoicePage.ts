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

export interface SupplierPaymentData {
    invoiceNumber: string;        // e.g., "_INV12345678"
    payTo: string;                // Company name to pay to
    template: string;             // e.g., "INVOICE:DETAILS"
}

export class InvoicePage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    // ===== HELPER METHODS =====

    /**
     * Helper: Click the "Create and Submit" button
     */
    private async clickSubmitButton() {
        await this.page.waitForTimeout(1000);
        
        // Optional: Click charge item anchor if visible
        const chargeItemAnchor = this.page.locator('#select-charge-item-0-anchor'); //suppose to choose the latest idk 
        if (await chargeItemAnchor.isVisible({ timeout: 1000 }).catch(() => false)) {
            await chargeItemAnchor.click();
            await this.page.waitForTimeout(500);
        }
        
        //const submitButton = this.page.getByRole('button', { name: 'Create and Submit' }); submit-invoice-button
        const submitButton = this.page.locator('#submit-invoice-button');
        await submitButton.waitFor({ state: 'visible', timeout: 3000 });
        await submitButton.click();
        await this.page.waitForTimeout(2000);
    }

        /**
     * Helper to select dropdown option from visible dropdown only
     */
    private async selectDropdownOption(value: string, waitTime: number = 600) {
        await this.page.waitForTimeout(waitTime);
        
        const result = await this.page.evaluate((optionText) => {
            const visibleDropdown = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
            
            if (!visibleDropdown) {
                return {
                    success: false,
                    searchedFor: optionText,
                    available: [],
                    count: 0,
                    error: 'No visible dropdown found'
                };
            }
            
            // Only get options from the visible dropdown
            const options = Array.from(visibleDropdown.querySelectorAll('.ant-select-item-option'));
            const availableOptions = options.map(o => o.textContent?.trim());
            
            const targetOption = options.find(opt => 
                opt.textContent?.trim().includes(optionText)
            );
            
            if (targetOption) {
                (targetOption as HTMLElement).click();
                return { success: true, found: targetOption.textContent?.trim() };
            } else {
                return { 
                    success: false, 
                    searchedFor: optionText,
                    available: availableOptions,
                    count: options.length
                };
            }
        }, value);
        
        if (!result.success) {
            console.error(`❌ Dropdown selection failed:`);
            console.error(`   Searched for: "${result.searchedFor}"`);
            console.error(`   Found ${result.count} options:`, result.available);
            throw new Error(`Option "${result.searchedFor}" not found. Available: ${result.available?.join(', ') || 'none'}`);
        }
        
        console.log(`✅ Selected: ${result.found}`);
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
        // Click voucher types button
        await this.page.locator('#voucher-types-button').click();
        await this.page.waitForTimeout(1000);

        // Select Customer Invoice
        await Promise.all([
            this.page.locator('#voucher-option-ACCREC').click(),
            this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
        ]);
        
        await this.page.waitForTimeout(3000);

        // Select document type/template
        //use '#documentCreatorTemplateUuid' instead of '#invoice-document-type-selector'
        await this.page.locator('#documentCreatorTemplateUuid').click();
        await this.page.waitForTimeout(500);
        await this.selectDropdownOption(data.template);

        // Add cost items
        for (let i = 0; i < data.costItems.length; i++) {
            const item = data.costItems[i];
            await this.addCostItem(item, i);
            await this.page.waitForTimeout(500);
        }
    }

    /**
     * Add a single cost item to the invoice
     * @param item Cost item data
     * @param index Item index
     */
    private async addCostItem(item: InvoiceCostItem, index: number) {
        // Click "Add new cost item" button
        await this.page.locator('#invoice-add-new-cost-item-button').click();
        await this.page.waitForTimeout(300);

        // Click charge item dropdown and select
        await this.page.locator('#cost-charge-item-selector').click();
        await this.page.waitForTimeout(300);
        await this.selectDropdownOption(item.chargeItem);

        // Fill Sell Base Rate
        //const sellRateField = this.page.getByRole('spinbutton', { name: '* Sell Base Rate' });
        const sellRateField = this.page.locator('#sellBaseRate');
        await sellRateField.waitFor({ state: 'visible', timeout: 3000 });
        await sellRateField.click();
        await sellRateField.fill(String(item.sellBaseRate));
        await this.page.waitForTimeout(400);

        // Fill Cost Base Rate
        const costRateField = this.page.locator('#costBaseRate');
        await costRateField.waitFor({ state: 'visible', timeout: 3000 });
        await costRateField.click();
        await costRateField.fill(String(item.costBaseRate));
        await this.page.waitForTimeout(400);

        // Click Create button to add the item
        //const createButton = this.page.getByLabel('Add new cost item').getByRole('button', { name: 'Create' }); create-cost-item-button
        const createButton = this.page.locator('#create-cost-item-button'); 
        await createButton.waitFor({ state: 'visible', timeout: 3000 });
        await createButton.click();
        await this.page.waitForTimeout(1200);
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
        await this.page.waitForTimeout(1000);
        
        // Check if approval button exists
        //const approvalButton = this.page.getByRole('button', { name: /exclamation-circle Customer/ }); approval-selector
        const approvalButton = this.page.locator('#approval-selector');
        const buttonExists = await approvalButton.count();
        
        if (buttonExists === 0) {
            console.log('⚠️  Approval button not found - invoice may already be approved or in different state');
            return;
        }
        
        await approvalButton.waitFor({ state: 'visible', timeout: 3000 });
        await approvalButton.click();
        await this.page.waitForTimeout(500);

        //const approveBtn = this.page.getByRole('button', { name: 'Approve' }); finance-approve-voucher-button
        const approveBtn = this.page.locator('#finance-approve-voucher-button');
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
     * @param supplierData Supplier payment data including invoice number, pay to company, and template
     */
    async createSupplierPayment(supplierData: SupplierPaymentData) {
        // Click voucher types button
        await this.page.locator('#voucher-types-button').click();
        await this.page.waitForTimeout(1000);

        // Select Supplier Payment
        await this.page.locator('#voucher-option-ACCPAY').click();
        await this.page.waitForTimeout(1500);

        // Fill Invoice Number
        //const invoiceNumberField = this.page.getByRole('textbox', { name: '* Invoice No.' });
        const invoiceNumberField = this.page.locator('#invoiceNumber');
        await invoiceNumberField.waitFor({ state: 'visible', timeout: 3000 });
        await invoiceNumberField.click();
        await invoiceNumberField.fill(supplierData.invoiceNumber);
        await this.page.waitForTimeout(800);

        // Select Pay To company
        //await this.page.locator('#supplier-company-selector').click();
        await this.page.locator('#form-company-selector').click();
        await this.page.waitForTimeout(300);
        await this.selectDropdownOption(supplierData.payTo);
        await this.page.waitForTimeout(1000);

        // Select document type/template
        await this.page.locator('#documentCreatorTemplateUuid').click();
        await this.page.waitForTimeout(500);
        await this.selectDropdownOption(supplierData.template);
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
        const approvalButton = this.page.locator('#approval-selector');
        const buttonExists = await approvalButton.count();
        
        if (buttonExists === 0) {
            console.log('⚠️  Approval button not found - invoice may already be approved or in different state');
            return;
        }
        
        await approvalButton.waitFor({ state: 'visible', timeout: 3000 });
        await approvalButton.click();
        await this.page.waitForTimeout(500);

        //const approveBtn = this.page.getByRole('button', { name: 'Approve' }); finance-approve-voucher-button
        const approveBtn = this.page.locator('#finance-approve-voucher-button');
        await approveBtn.waitFor({ state: 'visible', timeout: 3000 });
        await approveBtn.click();
        await this.page.waitForSelector('text=has been approved', { timeout: 5000 }).catch(() => null);
        await this.page.waitForTimeout(500);
    }
}
