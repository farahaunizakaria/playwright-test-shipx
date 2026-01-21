import { Page } from "@playwright/test";
import { BookingData, JobBookingData } from "../data/BookingData";
import { DropdownHelper, WaitHelper, ModalHelper, DateTimeHelper, MultipleOptionsHelper } from '../helper';

/**
 * BookingCreatePage - Page Object Model for creating new bookings
 */
export class BookingCreatePage {
    readonly page: Page;
    private dropdownHelper: DropdownHelper;
    private waitHelper: WaitHelper;
    private modalHelper: ModalHelper;
    private dateTimeHelper: DateTimeHelper;
    private multipleOptionsHelper: MultipleOptionsHelper;

    constructor(page: Page) {
        this.page = page;
        this.dropdownHelper = new DropdownHelper(page);
        this.waitHelper = new WaitHelper(page);
        this.modalHelper = new ModalHelper(page);
        this.dateTimeHelper = new DateTimeHelper(page);
        this.multipleOptionsHelper = new MultipleOptionsHelper(page);
    }

    /**
     * Create a new booking
     */
    async createBooking(data: BookingData, jobData: JobBookingData) {
        console.log('📋 Starting booking creation...');
        
        // Ensure page is ready before starting
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitHelper.wait(500);
        
        console.log('1️⃣ Clicking "New Booking"...');
        const newBookingButton = this.page.getByRole('link', { name: 'plus New Booking' });
        await newBookingButton.waitFor({ state: 'visible', timeout: 10000 });
        await newBookingButton.click();
        await this.waitHelper.waitForPageLoad('domcontentloaded');
        
        // Wait for booking form to be fully loaded
        await this.page.locator('#billing-customer-selector').waitFor({ state: 'visible', timeout: 10000 });
        
        // Reset any open UI elements from previous interactions
        await this.page.keyboard.press('Escape');
        await this.waitHelper.wait(300);
        
        // ========== BOOKING DETAILS ==========
        console.log('2️⃣ Booking Details');
        
        // Billing Customer
        console.log('   - Billing Customer...');
        await this.page.locator('#billing-customer-selector').click();
        await this.waitHelper.wait(300);
        await this.dropdownHelper.selectDropdownOption(data.billingCustomer);
        
        // Booking Type
        console.log('   - Booking Type...');
        await this.page.locator('#form-bookingTypes-selector').click();
        await this.waitHelper.wait(300);
        await this.dropdownHelper.selectDropdownOption(data.bookingType);
        
        // deliveryHour
        console.log('   - Delivery Hour...');
        await this.page.locator('[id="details.deliveryHour"]').click() 
        await this.waitHelper.wait(600);
        await this.dropdownHelper.selectDropdownOption(data.deliveryHour);
        
        // Customer Ref
        console.log('   - Customer Ref...');
        await this.page.locator('[id="details.customerRef"]').click();
        await this.page.locator('[id="details.customerRef"]').fill(data.customerRef);

        //   forwardingAgent: 'Another Base Company',
        console.log('   - Forwarding Agent...');
        await this.page.locator('[id="details.forwardingAgent"]').click() 
        await this.waitHelper.wait(600);
        await this.dropdownHelper.selectDropdownOption(data.forwardingAgent);

        //   shippingAgent: 'Another Base Company Testing',
        console.log('   - Shipping Agent...');
        await this.page.locator('[id="details\\.shippingAgent"]').click() 
        await this.waitHelper.wait(600);
        await this.dropdownHelper.selectDropdownOption(data.shippingAgent);

        //   shippingRefNo: `Farah Z-${timestamp}`,
        console.log('   - Shipping Ref No...');
        await this.page.locator('[id="details\\.shippingRefNo"]').click();
        await this.page.locator('[id="details\\.shippingRefNo"]').fill(data.shippingRefNo);

        //   vesselName: '', 
        console.log('   - Vessel Name...');
        await this.page.locator('[id="details.vesselName"]').click();
        await this.page.locator('[id="details.vesselName"]').fill(data.vesselName);

        //   operatorCode: '',
        console.log('   - Operator Code...');
        await this.page.locator('[id="details.operatorCode"]').click();
        await this.page.locator('[id="details.operatorCode"]').fill(data.operatorCode);

        //   voyageNo: '', 
        console.log('   - Voyage No...');
        await this.page.locator('[id="details.voyageNo"]').click();
        await this.page.locator('[id="details.voyageNo"]').fill(data.voyageNo);

        //   eta: new Date(), //date and time selection (select at date of booking creation, but make time 23:59)
        await this.dateTimeHelper.selectEta(data.eta);
    
        //   storageDate: new Date(), //date and time selection (select at date of booking creation, but make time 08:00)
        await this.dateTimeHelper.selectStorageDate(data.storageDate);
    
        //   cmo: new Date(), //date and time selection (select at date of booking creation, but make time 15:00)
        await this.dateTimeHelper.selectCmoDate(data.cmo);    
        
        //   commodity: 'General Cargo', //text    
        console.log('   - Commodity...');
        await this.page.locator('[id="details.commodity"]').click();
        await this.page.locator('[id="details.commodity"]').fill(data.commodity);

        //   dischargePort: 'JOHOR', //text
        console.log('   - Discharge Port...');
        await this.page.locator('[id="details.dischargePort"]').click();
        await this.page.locator('[id="details.dischargePort"]').fill(data.dischargePort);

        //   options: ['directDelivery', 'customSeal'] // multiple select
        if (data.options && data.options.length > 0) {
            console.log('   - Options...');
            await this.multipleOptionsHelper.selectMultipleOptions('details.options', data.options);
        }

        //   remarks: `Automated Testing ${new Date().toISOString()}`,
        console.log('   - Remarks...');
        await this.page.getByRole('textbox', { name: 'Remarks :' }).click();
        await this.page.getByRole('textbox', { name: 'Remarks :' }).fill(data.remarks);

        //   estimatedRfcDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), //date and time selection (select the date booking the next day after the booking created, and make it the same time as booking time)
        await this.dateTimeHelper.selectEstimatedRfcDate(data.estimatedRfcDate);    

        //   lastPortStorageDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), //date and time selection (select the date booking the next day after the booking created, and make time 00:00)
        await this.dateTimeHelper.selectLastPortStorageDate(data.lastPortStorageDate);    
        
        //   rfcRemarks: `Automated Testing ${new Date().toISOString()}`,
        console.log('   - RFC Remarks...');
        await this.page.locator('[id="details.rfcRemarks"]').click();
        await this.page.locator('[id="details.rfcRemarks"]').fill(data.rfcRemarks);

        //   collectionHours: '24 HOURS', //dropdown
        console.log('   - Collection Hours...');
        await this.page.locator('[id="details\\.collectionHours"]').click();
        await this.waitHelper.wait(300);
        await this.dropdownHelper.selectDropdownOption(data.collectionHours);

        //   confirmcoc: true,
        console.log('   - Confirm COC...');
        await this.page.locator('[id="details\\.confirmCoc"]').check();
        await this.waitHelper.wait(300);

        //   completeness: true,
        console.log('   - Completeness...');
        await this.page.locator('[id="details\\.completeness"]').check();
        await this.waitHelper.wait(300);

        // Navigate to Step 2
        console.log('   ✅ Step 1 complete, moving to Step 2...');
        await this.page.getByRole('button', { name: 'Next right' }).nth(1).click();
        await this.waitHelper.waitForPageLoad('domcontentloaded');
        await this.waitHelper.wait(2000); // Wait for Step 2 to render
        
        // ========== JOB DETAILS ==========
        console.log('3️⃣ Job Details');
        
        // Job Type 
        await this.page.locator('#type').click();
        await this.waitHelper.wait(300);
        await this.dropdownHelper.selectDropdownOption(jobData.jobType);
        
        // Trip Order Format
        console.log('   - Trip Format...')
        await this.page.locator('#tripFormat').click();
        await this.waitHelper.wait(300);
        await this.dropdownHelper.selectDropdownOption(jobData.tripOrderFormat);
        
        //   containerNo: '', //text
        console.log('   - Container No...');
        await this.page.locator('#containerNo').click();
        await this.page.locator('#containerNo').fill(jobData.containerNo);
        
        //   sealNo: '', //text
        console.log('   - Seal No...');
        await this.page.locator('#sealNo').click();
        await this.page.locator('#sealNo').fill(jobData.sealNo);
        
        //   containerSize: '20', //dropdown
        console.log('   - Container Size...');
        await this.page.locator('#containerSize').click() 
        await this.waitHelper.wait(600);
        await this.dropdownHelper.selectDropdownOption(jobData.containerSize);

        //   containerType: 'GP', //dropdown
        console.log('   - Container Type...');
        await this.page.locator('#containerType').click() 
        await this.waitHelper.wait(600);
        await this.dropdownHelper.selectDropdownOption(jobData.containerType);
        
        //   unit: 'km',
        console.log('   - Unit...');
        await this.page.locator('#unit').click();
        await this.page.locator('#unit').fill(jobData.unit);

        //   uom: 'TRIP',
        console.log('   - UOM...');
        await this.page.locator('#uom').click() 
        await this.waitHelper.wait(600);
        await this.dropdownHelper.selectDropdownOption(jobData.uom);

        //   trailerType: 'NORMAL', //dropdown
        console.log('   - Trailer Type...');
        await this.page.locator('#trailerType').click() 
        await this.waitHelper.wait(600);
        await this.dropdownHelper.selectDropdownOption(jobData.trailerType);
        
        //   handling: 'BY DRUM', //dropdown
        console.log('   - Handling...');
        await this.page.locator('#handling').click() 
        await this.waitHelper.wait(600);
        await this.dropdownHelper.selectDropdownOption(jobData.handling);

        //   height: '200', //text
        console.log('   - Height...');
        await this.page.locator('#height').click();
        await this.page.locator('#height').fill(jobData.height);

        //   weight: '2000', //text
        console.log('   - Weight...');
        await this.page.locator('#weight').click();
        await this.page.locator('#weight').fill(jobData.weight);

        //   temperature: '45', //text
        console.log('   - Temperature...');
        await this.page.locator('#temperature').click();
        await this.page.locator('#temperature').fill(jobData.temperature);

        //   vesselID: '', 
        console.log('   - Vessel ID...');
        await this.page.locator('#vesselID').click();
        await this.page.locator('#vesselID').fill(jobData.vesselID);         

        //   reference: '', //text
        console.log('   - Reference...');
        await this.page.locator('#reference').click();
        await this.page.locator('#reference').fill(jobData.reference);

        //   internalRemark: `Automated Testing ${new Date().toISOString()}`,
        console.log('   - Internal Remark...');
        await this.page.locator('#internalRemark').click();
        await this.page.locator('#internalRemark').fill(jobData.internalRemark);

        //   customerRef: `8742-${timestamp}`,
        console.log('   - Customer Ref...');
        await this.page.locator('#customerRef').click();
        await this.page.locator('#customerRef').fill(jobData.customerRef);

        //   remarks: `Automated Testing ${new Date().toISOString()}`,
        console.log('   - Remarks...');
        await this.page.getByPlaceholder('Enter job remarks...').click();
        await this.page.getByPlaceholder('Enter job remarks...').fill(jobData.remarks);

        // From Company (Trip #1) DELIVERY
        console.log('   - From Company...');
        await this.page.locator('#trips-0-from-company-selector').click();
        await this.waitHelper.wait(300);
        await this.dropdownHelper.selectDropdownOption(jobData.fromCompanyDelivery);
        await this.waitHelper.wait(800); // Wait for address auto-fill to complete

        // To Company (Trip #1) DELIVERY
        console.log('   - To Company...');
        await this.page.locator('#trips-0-to-company-selector').click();
        await this.waitHelper.wait(600); // Wait for dropdown to load
        await this.dropdownHelper.selectDropdownOption(jobData.toCompanyDelivery);

        // From Company (Trip #1) COLLECTION
        console.log('   - From Company...');
        await this.page.locator('#trips-1-from-company-selector').click();
        await this.waitHelper.wait(300);
        await this.dropdownHelper.selectDropdownOption(jobData.fromCompanyCollection);
        await this.waitHelper.wait(800); // Wait for address auto-fill to complete

        // To Company (Trip #1) COLLECTION
        console.log('   - To Company...');
        await this.page.locator('#trips-1-to-company-selector').click();
        await this.waitHelper.wait(600); // Wait for dropdown to load
        await this.dropdownHelper.selectDropdownOption(jobData.toCompanyCollection);

        console.log('   - Waiting for form validation...');
        await this.waitHelper.wait(2000);
        
        console.log('✅ BOOKING FORM COMPLETED - Ready to submit');
    }

    /**
     * Submit booking
     */
    async submitBooking() {
        console.log('📤 Submitting booking...');
        console.log('   - Clicking Next to go to Step 3...');
        
        await this.waitHelper.wait(1500);
        
        // Multiple buttons have the same ID, use getByRole with nth to target the correct one
        await this.page.locator('#create-booking-stepper-button:visible').first().click()
        await this.waitHelper.waitForPageLoad('domcontentloaded');
        await this.waitHelper.wait(1000);
        
        // Check "Override Duplicate Booking" checkbox
        console.log('   - Checking override duplicate booking...');
        await this.page.getByLabel('', { exact: true }).check();
        
        // Submit
        console.log('   - Clicking Submit...');
        await this.page.getByRole('button', { name: 'Submit' }).click();
        
        // Wait for redirect to booking detail page
        await this.waitHelper.waitForPageLoad('domcontentloaded');
        await this.waitHelper.wait(1000);
        
        console.log('✅ Booking submitted successfully!');
    }

    /**
     * Extract booking ID from URL after submission
     */
    async getBookingIdFromUrl(): Promise<string> {
        await this.waitHelper.wait(1000);
        
        const url = this.page.url();
        const bookingId = url.match(/\/bookings\/([^/?]+)/)?.[1];
        
        if (bookingId && bookingId !== 'new') {
            console.log(`📋 ✅ Extracted booking ID from URL: ${bookingId}`);
            return bookingId;
        }
        
        console.warn('⚠️ Could not extract booking ID from URL:', url);
        return '';
    }
}
