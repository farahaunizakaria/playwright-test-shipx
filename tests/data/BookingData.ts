/**
 * BookingData interface for codegen flow (works with authenticatedPage fixture)
 * Login is handled by the fixture, so no credentials needed here
 */
export interface BookingData {
    billingCustomer: string;
    bookingType: string;
    department: string;
    shipperRef: string;
    customerRef: string;
    remarks: string;
    loadType: string;
    customerSo: string;
    references: string;
    quotation: string;
    jobType: string;
    measurementType: string;
    quantity: string;
    uom: string;
    fromCompany: string;
    toCompany: string;
}
