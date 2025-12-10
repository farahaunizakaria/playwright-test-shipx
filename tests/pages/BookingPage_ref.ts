// import { Page, Locator } from '@playwright/test';
// import { BasePage } from './BasePage';

// /**
//  * BookingPage - Page Object Model for booking operations
//  */
// export class BookingPage extends BasePage {
//   // Selectors - Buttons and Navigation
//   private readonly newBookingButton: Locator;
//   private readonly nextButton: Locator;
//   private readonly submitButton: Locator;

//   // page 1: Booking Details - Selectors
//   private readonly billingCustomerDropdown: Locator;
//   private readonly bookingTypeDropdown: Locator;
//   private readonly departmentDropdown: Locator;
//   private readonly shipperRefInput: Locator;
//   private readonly customerRefInput: Locator;
//   private readonly remarksInput: Locator;
//   private readonly loadTypeDropdown: Locator;
//   private readonly customerSoInput: Locator;
//   private readonly referencesInput: Locator;
//   private readonly quotationDropdown: Locator;

//   // Page 2: Job Details - Selectors
//   private readonly jobTypeDropdown: Locator;
//   private readonly quantityInput: Locator;
//   private readonly uomDropdown: Locator;
//   private readonly jobRemarksInput: Locator;
//   private readonly fromCompanyDropdown: Locator;
//   private readonly toCompanyDropdown: Locator;

//   constructor(page: Page) {
//     super(page);
    
//     // Initialize buttons
//     this.newBookingButton = page.getByRole('link', { name: 'plus New Booking' });
//     this.nextButton = page.getByRole('button', { name: 'Next right' });
//     this.submitButton = page.getByRole('button', { name: 'Submit' });

//     // Page 1 selectors
//     this.billingCustomerDropdown = page.locator('.ant-select-selection-search').first();
//     this.bookingTypeDropdown = page.locator('div:nth-child(2) > .ant-col.ant-col-18 > .ant-form-item-control > .ant-form-item-children > .ant-select > .ant-select-selector > .ant-select-selection-wrap > .ant-select-selection-search');
//     this.departmentDropdown = page.locator('[id="details.departments"]');
//     this.shipperRefInput = page.locator('[id="details.shipperRef"]');
//     this.customerRefInput = page.locator('[id="details.customerRef"]');
//     this.remarksInput = page.getByRole('textbox', { name: 'Remarks:' });
//     this.loadTypeDropdown = page.locator('[id="details.loadType"]');
//     this.customerSoInput = page.locator('[id="details.customerSo"]');
//     this.referencesInput = page.locator('[id="details.references"]');
//     this.quotationDropdown = page.locator('[id="details.quotation uuid"]');

//     // Page 2 selectors
//     this.jobTypeDropdown = page.locator('.ant-col.ant-form-item-control-wrapper.ant-col-xs-24 > .ant-form-item-control > .ant-form-item-children > .ant-select > .ant-select-selector > .ant-select-selection-wrap > .ant-select-selection-search').first();
//     this.quantityInput = page.getByRole('textbox', { name: 'Enter text' });
//     this.uomDropdown = page.locator('#details-uom');
//     this.jobRemarksInput = page.getByRole('textbox', { name: 'Enter job remarks...' });
//     this.fromCompanyDropdown = page.locator('#trips-0-from-company-selector');
//     this.toCompanyDropdown = page.locator('#trips-0-to-company-selector');
//   }

//   /**
//    * Navigate to bookings page
//    */
//   async navigateToBookings() {
//     await this.goto('/?filter=%7B%22userUuids%22%3A%5B%5D%7D');
//     await this.waitForPageLoad();
//   }

//   /**
//    * Click New Booking button
//    */
//   async clickNewBooking() {
//     await this.click(this.newBookingButton);
//     await this.billingCustomerDropdown.waitFor({ state: 'visible', timeout: 10000 });
//   }

//   // ==================== STEP 1: BOOKING DETAILS ====================

//   /**
//    * Select billing customer
//    * @param customerName - Customer name to select
//    */
//   async selectBillingCustomer(customerName: string) {
//     await this.click(this.billingCustomerDropdown);
//     await this.page.getByText(customerName).click();
//   }

//   /**
//    * Select booking type
//    * @param bookingType - Booking type (e.g., "TRANSPORT")
//    */
//   async selectBookingType(bookingType: string) {
//     await this.click(this.bookingTypeDropdown);
//     await this.page.getByText(bookingType, { exact: true }).nth(1).click();
//   }

//   /**
//    * Select department
//    * @param department - Department name (e.g., "SOUTH")
//    */
//   async selectDepartment(department: string) {
//     await this.click(this.departmentDropdown);
//     await this.page.getByText(department).nth(1).click();
//   }

//   /**
//    * Enter shipper reference
//    * @param reference - Shipper reference number
//    */
//   async enterShipperRef(reference: string) {
//     await this.click(this.shipperRefInput);
//     await this.fill(this.shipperRefInput, reference);
//   }

//   /**
//    * Enter customer reference
//    * @param reference - Customer reference text
//    */
//   async enterCustomerRef(reference: string) {
//     await this.click(this.customerRefInput);
//     await this.fill(this.customerRefInput, reference);
//   }

//   /**
//    * Enter booking remarks
//    * @param remarks - Remarks text
//    */
//   async enterRemarks(remarks: string) {
//     await this.click(this.remarksInput);
//     await this.fill(this.remarksInput, remarks);
//   }

//   /**
//    * Select load type
//    * @param loadType - Load type (e.g., "FTL")
//    */
//   async selectLoadType(loadType: string) {
//     await this.click(this.loadTypeDropdown);
//     await this.page.getByText(loadType).nth(1).click();
//   }

//   /**
//    * Enter customer SO
//    * @param so - Customer SO number
//    */
//   async enterCustomerSo(so: string) {
//     await this.click(this.customerSoInput);
//     await this.fill(this.customerSoInput, so);
//   }

//   /**
//    * Enter references
//    * @param references - Reference text
//    */
//   async enterReferences(references: string) {
//     await this.click(this.referencesInput);
//     await this.fill(this.referencesInput, references);
//   }

//   /**
//    * Select quotation
//    * @param quotation - Quotation ID
//    */
//   async selectQuotation(quotation: string) {
//     await this.click(this.quotationDropdown);
//     await this.page.getByText(quotation).nth(1).click();
//   }

//   /**
//    * Click Next button (Step 1 -> Step 2)
//    */
//   async clickNextToJobDetails() {
//     await this.nextButton.nth(1).click();
//     await this.jobTypeDropdown.waitFor({ state: 'visible', timeout: 10000 });
//   }

//   // ==================== STEP 2: JOB DETAILS ====================

//   /**
//    * Select job type
//    * @param jobType - Job type (e.g., "DOMESTIC")
//    */
//   async selectJobType(jobType: string) {
//     await this.click(this.jobTypeDropdown);
//     await this.page.locator('div').filter({ hasText: new RegExp(`^${jobType}$`) }).nth(2).click();
//   }

//   /**
//    * Select measurement type
//    * @param measurementType - Measurement type (e.g., "Linear", "None")
//    */
//   async selectMeasurementType(measurementType: string) {
//     await this.page.getByText('None').click();
//     await this.page.getByText(measurementType, { exact: true }).click();
//   }
  
//   /**
//    * Enter quantity
//    * @param quantity - Quantity value
//    */
//   async enterQuantity(quantity: string) {
//     await this.page.getByRole('textbox', { name: 'Enter text' }).click();
//     await this.page.getByRole('textbox', { name: 'Enter text' }).fill(quantity);
//   }

//   /**
//    * Select UOM (Unit of Measurement)
//    * @param uom - UOM code (e.g., "DR")
//    */
//   async selectUom(uom: string) {
//     await this.page.locator('#details-uom').click();
//     await this.page.getByText(uom).nth(5).click();
//   }

//   /**
//    * Enter job remarks
//    * @param remarks - Job remarks text
//    */
//   async enterJobRemarks(remarks: string) {
//     await this.page.getByRole('textbox', { name: 'Enter job remarks...' }).click();
//     await this.page.getByRole('textbox', { name: 'Enter job remarks...' }).fill(remarks);
//   }

//   /**
//    * Select from company (pickup location)
//    * @param companyName - Company name
//    */
//   async selectFromCompany(companyName: string) {
//     await this.fromCompanyDropdown.click();
//     await this.page.waitForTimeout(1500);
//     await this.page.getByText(companyName).nth(2).click();
//     await this.page.waitForTimeout(500);
//   }

//   /**
//    * Select to company (delivery location)
//    * @param companyName - Company name
//    */
//   async selectToCompany(companyName: string) {
//     await this.toCompanyDropdown.click();
//     await this.page.waitForTimeout(1500);
//     // Wait for dropdown to be visible
//     await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last().waitFor({ state: 'visible', timeout: 5000 });
//     await this.page.getByText(companyName).nth(4).click();
//     await this.page.waitForTimeout(500);
//   }

//   /**
//    * Click Next button (Step 2 -> Step 3)
//    */
//   async clickNextToReview() {
//     await this.nextButton.nth(1).click();
//     await this.submitButton.waitFor({ state: 'visible', timeout: 10000 });
//   }

//   // ==================== STEP 3: SUBMIT ====================

//   /**
//    * Submit the booking and return the booking ID
//    * @returns The booking ID extracted from the URL
//    */
//   async clickSubmit(): Promise<string> {
//     await this.page.getByRole('button', { name: 'Submit' }).click();
//     await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    
//     // Extract booking ID from URL (e.g., /bookings/BK-123456)
//     const url = this.page.url();
//     const bookingIdMatch = url.match(/\/bookings\/([^/?]+)/);
//     const bookingId = bookingIdMatch ? bookingIdMatch[1] : '';
    
//     console.log(`Booking created with ID: ${bookingId}`);
    
//     await this.page.getByRole('link', { name: 'back to home page' }).click();
    
//     return bookingId;
//   }

//   /**
//    * Create a simple booking with all details
//    * @param bookingData - All booking form data
//    * @returns The created booking ID
//    */
//   async createSimpleBooking(bookingData: {
//     // Page 1
//     billingCustomer: string;
//     bookingType: string;
//     department: string;
//     shipperRef: string;
//     customerRef: string;
//     remarks: string;
//     loadType: string;
//     customerSo: string;
//     references: string;
//     quotation: string;
//     // Page 2
//     jobType: string;
//     measurementType: string;
//     quantity: string;
//     uom: string;
//     jobRemarks: string;
//     fromCompany: string;
//     toCompany: string;
//   }): Promise<string> {
//     await this.clickNewBooking();

//     // Page 1: Booking Details Page
//     await this.selectBillingCustomer(bookingData.billingCustomer);
//     await this.selectBookingType(bookingData.bookingType);
//     await this.selectDepartment(bookingData.department);
//     await this.enterShipperRef(bookingData.shipperRef);
//     await this.enterCustomerRef(bookingData.customerRef);
//     await this.enterRemarks(bookingData.remarks);
//     await this.selectLoadType(bookingData.loadType);
//     await this.enterCustomerSo(bookingData.customerSo);
//     await this.enterReferences(bookingData.references);s
//     await this.selectQuotation(bookingData.quotation);
//     await this.clickNextToJobDetails();

//     // Page 2: Job Details Page
//     await this.selectJobType(bookingData.jobType);
//     await this.selectMeasurementType(bookingData.measurementType);
//     await this.enterQuantity(bookingData.quantity);
//     await this.selectUom(bookingData.uom);
//     await this.enterJobRemarks(bookingData.jobRemarks);
//     await this.selectFromCompany(bookingData.fromCompany);
//     await this.selectToCompany(bookingData.toCompany);
    
//     await this.clickNextToReview();

//     // Page 3: Submit Page
//     const bookingId = await this.clickSubmit();
//     return bookingId;
//   }
// }

 //test successfully run (dropdown issue resolved)