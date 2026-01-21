/**
 * BookingData interface for codegen flow (works with authenticatedPage fixture)
 * Login is handled by the fixture, so no credentials needed here
 */


export interface BookingData {
    billingCustomer: string;
    bookingType: string;
    deliveryHour: string;
    customerRef: string;
    forwardingAgent: string;
    shippingAgent: string;
    shippingRefNo: string;
    vesselName: string;
    operatorCode: string;
    voyageNo: string;
    eta: Date; //date and time selection (select at date of booking creation, but make time 23:59)
    storageDate: Date; //date and time selection (select at date of booking creation, but make time 08:00)
    cmo: Date; //date and time selection (select at date of booking creation, but make time 15:00)
    commodity: string;
    dischargePort: string;
    options: string[];
    remarks: string;
    estimatedRfcDate: Date; //date and time selection (select the date booking the next day after the booking created, and make it the same time as booking time)
    lastPortStorageDate: Date; //date and time selection (select the date booking the next day after the booking created, and make time 00:00)
    rfcRemarks: string;
    collectionHours: string;
    confirmcoc: boolean;
    completeness: boolean;
}

export interface JobBookingData {
    jobType: string;
    tripOrderFormat: string;
    containerNo: string;
    sealNo: string;
    containerSize: string;
    containerType: string;
    unit: string;
    uom: string;
    trailerType: string;
    handling: string;
    weight: string;
    height: string;
    temperature: string;    
    vesselID: string;
    reference: string;
    internalRemark: string;
    customerRef: string;
    remarks: string;
    fromCompanyDelivery: string;
    toCompanyDelivery: string;
    fromCompanyCollection: string;
    toCompanyCollection: string;
}