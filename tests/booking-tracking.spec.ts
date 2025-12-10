import { test as base, expect } from "@playwright/test";
import { test } from "./fixtures/fixtures";
import { TrackingPageCodegen } from "./pages/TrackingPageCodegen";
import { BookingPageCodegen } from "./pages/BookingPageCodegen";
import { BookingData } from "./data/BookingData";
import { LegData, JobData, TripData } from "./data/TrackingData";

/**
 * BOOKING TRACKING & MANAGEMENT TEST SUITE
 * 
 * Tests cover full CRUD operations on bookings:
 * - GROUP A: CREATE (add jobs, trips, legs)
 * - GROUP B: VALIDATE (required fields, time logic, error handling)
 * - GROUP C: UPDATE (edit after submission)
 * - GROUP D: CANCEL (discard changes)
 * - GROUP E: READ & STATUS (verify state transitions)
 * 
 * Test Pattern:
 * - Reuse booking from booking-codegen.spec.ts (GROUP A only)
 * - Create fresh bookings for VALIDATE/UPDATE/CANCEL/READ groups
 * - Each test should be independent and runnable in any order
 */

/**
 * ============================
 * GROUP A: CREATE OPERATIONS
 * ============================
 * Add jobs, trips, legs to existing booking
 * Reuses booking ID from booking creation test
 */

test.describe("GROUP A: CREATE - Add Legs to Booking", () => {
    let trackingPage: TrackingPageCodegen;
    let bookingPage: BookingPageCodegen;
    let bookingId: string;

    test.beforeEach(async ({ authenticatedPage }) => {
        trackingPage = new TrackingPageCodegen(authenticatedPage);
        bookingPage = new BookingPageCodegen(authenticatedPage);

        // Create a fresh booking for GROUP A tests
        const bookingData: BookingData = {
            billingCustomer: "TEST CUSTOMER",
            bookingType: "NORMAL",
            department: "OPERATIONS",
            shipperRef: `SHIP-${Date.now()}`,
            customerRef: `CUST-${Date.now()}`,
            remarks: "GROUP A: Create test booking",
            loadType: "FULL",
            customerSo: "",
            references: "",
            quotation: "NONE",
            jobType: "DOMESTIC",
            measurementType: "WEIGHT",
            quantity: "100",
            uom: "KG",
            fromCompany: "SHIPPER COMPANY",
            toCompany: "CONSIGNEE COMPANY"
        };

        await bookingPage.createBooking(bookingData);

        // Extract booking ID from URL
        const url = await authenticatedPage.url();
        const match = url.match(/\/bookings\/([^\/]+)/);
        bookingId = match ? match[1] : "";
    });

    test("A1: Add single job to booking", async ({ authenticatedPage }) => {
        await trackingPage.navigateToBooking(bookingId);

        const jobData: JobData = {
            jobType: "DOMESTIC",
            measurementType: "WEIGHT",
            quantity: "1000",
            uom: "KG",
            remarks: "Test job A1"
        };

        await trackingPage.addJob(jobData);
        
        // Verify job was added
        await expect(authenticatedPage.locator('text=DOMESTIC')).toBeVisible();
    });

    test("A2: Add job with trip and complete leg assignment", async ({ authenticatedPage }) => {
        await trackingPage.navigateToBooking(bookingId);

        const jobData: JobData = {
            jobType: "DOMESTIC",
            measurementType: "WEIGHT",
            quantity: "500",
            uom: "KG",
            remarks: "Job with full trip"
        };

        const tripData: TripData = {
            fromCompany: "SHIPPER COMPANY",
            toCompany: "CONSIGNEE COMPANY",
            remarks: "Test trip A2"
        };

        const legData: LegData = {
            driver: "DRIVER NAME",
            vehicle: "VEHICLE01",
            remarks: "Full assignment"
        };

        await trackingPage.addJob(jobData);
        await trackingPage.addTrip(tripData, 0);
        await trackingPage.openLegForCreation(1);
        await trackingPage.assignLegResources(legData);
        await trackingPage.submitLeg();

        // Verify leg status is visible
        await expect(authenticatedPage.locator('text=/PENDING|CREATED|ASSIGNED/')).toBeVisible({ timeout: 5000 });
    });

    test("A3: Add multiple jobs to single booking", async ({ authenticatedPage }) => {
        await trackingPage.navigateToBooking(bookingId);

        const jobData1: JobData = {
            jobType: "DOMESTIC",
            measurementType: "WEIGHT",
            quantity: "1000",
            uom: "KG",
            remarks: "First job A3"
        };

        const jobData2: JobData = {
            jobType: "DOMESTIC",
            measurementType: "VOLUME",
            quantity: "50",
            uom: "CBM",
            remarks: "Second job A3"
        };

        await trackingPage.addJob(jobData1);
        await trackingPage.addJob(jobData2);

        // Verify both jobs exist
        const jobCount = await authenticatedPage.locator('[id^="job-"]').count();
        expect(jobCount).toBeGreaterThanOrEqual(2);
    });
});

/**
 * ============================
 * GROUP B: VALIDATE OPERATIONS
 * ============================
 * Test required field validation, time logic, error handling
 * Create fresh booking for each test
 */

test.describe("GROUP B: VALIDATE - Required Fields & Logic", () => {
    let trackingPage: TrackingPageCodegen;
    let bookingPage: BookingPageCodegen;
    let bookingId: string;

    test.beforeEach(async ({ authenticatedPage }) => {
        trackingPage = new TrackingPageCodegen(authenticatedPage);
        bookingPage = new BookingPageCodegen(authenticatedPage);

        // Create fresh booking for each validation test
        const bookingData: BookingData = {
            billingCustomer: "TEST CUSTOMER",
            bookingType: "NORMAL",
            department: "OPERATIONS",
            shipperRef: `SHIP-${Date.now()}`,
            customerRef: `CUST-${Date.now()}`,
            remarks: "GROUP B: Validation test booking",
            loadType: "FULL",
            customerSo: "",
            references: "",
            quotation: "NONE",
            jobType: "DOMESTIC",
            measurementType: "WEIGHT",
            quantity: "100",
            uom: "KG",
            fromCompany: "SHIPPER COMPANY",
            toCompany: "CONSIGNEE COMPANY"
        };

        await bookingPage.createBooking(bookingData);
        
        // Get booking ID from URL
        const url = await authenticatedPage.url();
        const bookingIdMatch = url.match(/\/bookings\/([^\/]+)/);
        bookingId = bookingIdMatch ? bookingIdMatch[1] : "";
        
        await trackingPage.navigateToBooking(bookingId);
    });

    test("B1: Cannot submit leg without driver", async ({ authenticatedPage }) => {
        const legData: LegData = {
            vehicle: "VEHICLE01" // Driver is missing
        };

        await trackingPage.openLegForCreation(1);
        await trackingPage.assignLegResources(legData);
        
        const hasError = await trackingPage.attemptSubmitWithoutDriver();
        expect(hasError).toBeTruthy();
    });

    test("B2: Cannot submit leg without vehicle", async ({ authenticatedPage }) => {
        const legData: LegData = {
            driver: "DRIVER NAME" // Vehicle is missing
        };

        await trackingPage.openLegForCreation(1);
        await trackingPage.assignLegResources(legData);
        
        const hasError = await trackingPage.attemptSubmitWithoutVehicle();
        expect(hasError).toBeTruthy();
    });

    test("B3: Cannot set end time before start time", async ({ authenticatedPage }) => {
        const legData: LegData = {
            driver: "DRIVER NAME",
            vehicle: "VEHICLE01"
        };

        await trackingPage.openLegForCreation(1);
        await trackingPage.assignLegResources(legData);
        
        const hasError = await trackingPage.attemptInvalidTimeRange("1000", "0900");
        expect(hasError).toBeTruthy();
    });
});

/**
 * ============================
 * GROUP C: UPDATE OPERATIONS
 * ============================
 * Edit legs after submission, test partial updates
 * Create fresh booking for each test
 */

test.describe("GROUP C: UPDATE - Edit Existing Legs", () => {
    let trackingPage: TrackingPageCodegen;
    let bookingPage: BookingPageCodegen;
    let bookingId: string;

    test.beforeEach(async ({ authenticatedPage }) => {
        trackingPage = new TrackingPageCodegen(authenticatedPage);
        bookingPage = new BookingPageCodegen(authenticatedPage);

        // Create fresh booking
        const bookingData: BookingData = {
            billingCustomer: "TEST CUSTOMER",
            bookingType: "NORMAL",
            department: "OPERATIONS",
            shipperRef: `SHIP-${Date.now()}`,
            customerRef: `CUST-${Date.now()}`,
            remarks: "GROUP C: Update test booking",
            loadType: "FULL",
            customerSo: "",
            references: "",
            quotation: "NONE",
            jobType: "DOMESTIC",
            measurementType: "WEIGHT",
            quantity: "100",
            uom: "KG",
            fromCompany: "SHIPPER COMPANY",
            toCompany: "CONSIGNEE COMPANY"
        };

        await bookingPage.createBooking(bookingData);
        
        const url = await authenticatedPage.url();
        const bookingIdMatch = url.match(/\/bookings\/([^\/]+)/);
        bookingId = bookingIdMatch ? bookingIdMatch[1] : "";
        
        await trackingPage.navigateToBooking(bookingId);
    });

    test("C1: Update leg driver after initial submission", async ({ authenticatedPage }) => {
        const initialLegData: LegData = {
            driver: "DRIVER_A",
            vehicle: "VEHICLE01"
        };

        const updatedLegData: LegData = {
            driver: "DRIVER_B", // Changed driver
            vehicle: "VEHICLE01"
        };

        // Create and submit leg
        await trackingPage.openLegForCreation(1);
        await trackingPage.assignLegResources(initialLegData);
        await trackingPage.submitLeg();

        // Edit leg
        await trackingPage.editLeg(1);
        await trackingPage.assignLegResources(updatedLegData);
        await trackingPage.submitLeg();

        // Verify update
        await expect(authenticatedPage.locator('text=DRIVER_B')).toBeVisible({ timeout: 5000 });
    });

    test("C2: Update leg vehicle assignment", async ({ authenticatedPage }) => {
        const initialLegData: LegData = {
            driver: "DRIVER_A",
            vehicle: "VEHICLE01"
        };

        const updatedLegData: LegData = {
            driver: "DRIVER_A",
            vehicle: "VEHICLE02" // Changed vehicle
        };

        await trackingPage.openLegForCreation(1);
        await trackingPage.assignLegResources(initialLegData);
        await trackingPage.submitLeg();

        await trackingPage.editLeg(1);
        await trackingPage.assignLegResources(updatedLegData);
        await trackingPage.submitLeg();

        await expect(authenticatedPage.locator('text=VEHICLE02')).toBeVisible({ timeout: 5000 });
    });

    test("C3: Update leg timeline fields", async ({ authenticatedPage }) => {
        const legData: LegData = {
            driver: "DRIVER_A",
            vehicle: "VEHICLE01",
            planStart: "0900",
            start: "0915",
            planEnd: "1700",
            end: "1730"
        };

        await trackingPage.openLegForCreation(1);
        await trackingPage.assignLegResources(legData);
        await trackingPage.updateLegTimeline(legData);
        await trackingPage.submitLeg();

        // Edit and update times
        const updatedTimeline: LegData = {
            start: "0930",
            end: "1745"
        };

        await trackingPage.editLeg(1);
        await trackingPage.updateLegTimeline(updatedTimeline);
        await trackingPage.submitLeg();

        // Verify timeline was updated
        await expect(authenticatedPage.locator('text=0930')).toBeVisible({ timeout: 5000 });
    });
});

/**
 * ============================
 * GROUP D: CANCEL OPERATIONS
 * ============================
 * Discard changes without saving, verify rollback
 * Create fresh booking for each test
 */

test.describe("GROUP D: CANCEL - Discard Changes", () => {
    let trackingPage: TrackingPageCodegen;
    let bookingPage: BookingPageCodegen;
    let bookingId: string;

    test.beforeEach(async ({ authenticatedPage }) => {
        trackingPage = new TrackingPageCodegen(authenticatedPage);
        bookingPage = new BookingPageCodegen(authenticatedPage);

        // Create fresh booking
        const bookingData: BookingData = {
            billingCustomer: "TEST CUSTOMER",
            bookingType: "NORMAL",
            department: "OPERATIONS",
            shipperRef: `SHIP-${Date.now()}`,
            customerRef: `CUST-${Date.now()}`,
            remarks: "GROUP D: Cancel test booking",
            loadType: "FULL",
            customerSo: "",
            references: "",
            quotation: "NONE",
            jobType: "DOMESTIC",
            measurementType: "WEIGHT",
            quantity: "100",
            uom: "KG",
            fromCompany: "SHIPPER COMPANY",
            toCompany: "CONSIGNEE COMPANY"
        };

        await bookingPage.createBooking(bookingData);
        
        const url = await authenticatedPage.url();
        const bookingIdMatch = url.match(/\/bookings\/([^\/]+)/);
        bookingId = bookingIdMatch ? bookingIdMatch[1] : "";
        
        await trackingPage.navigateToBooking(bookingId);
    });

    test("D1: Cancel leg edit without saving changes", async ({ authenticatedPage }) => {
        const originalLegData: LegData = {
            driver: "DRIVER_ORIGINAL",
            vehicle: "VEHICLE01"
        };

        // Create original leg
        await trackingPage.openLegForCreation(1);
        await trackingPage.assignLegResources(originalLegData);
        await trackingPage.submitLeg();

        // Edit but cancel
        await trackingPage.editLeg(1);
        const changedData: LegData = {
            driver: "DRIVER_CHANGED"
        };
        await trackingPage.assignLegResources(changedData);
        await trackingPage.cancelLegEdit();

        // Verify original data still exists
        await expect(authenticatedPage.locator('text=DRIVER_ORIGINAL')).toBeVisible({ timeout: 5000 });
    });

    test("D2: Cancel new leg creation without saving", async ({ authenticatedPage }) => {
        const legData: LegData = {
            driver: "DRIVER_TEMPORARY",
            vehicle: "VEHICLE999"
        };

        // Start creating leg but cancel
        await trackingPage.openLegForCreation(1);
        await trackingPage.assignLegResources(legData);
        await trackingPage.cancelLegEdit();

        // Verify leg was not created
        const hasLeg = await authenticatedPage.locator('text=DRIVER_TEMPORARY').isVisible({ timeout: 2000 }).catch(() => false);
        expect(hasLeg).toBeFalsy();
    });
});

/**
 * ============================
 * GROUP E: READ & STATUS
 * ============================
 * Verify state transitions and status cascading
 * Create fresh booking for each test
 */

test.describe("GROUP E: READ - Verify Status Transitions", () => {
    let trackingPage: TrackingPageCodegen;
    let bookingPage: BookingPageCodegen;
    let bookingId: string;

    test.beforeEach(async ({ authenticatedPage }) => {
        trackingPage = new TrackingPageCodegen(authenticatedPage);
        bookingPage = new BookingPageCodegen(authenticatedPage);

        // Create fresh booking
        const bookingData: BookingData = {
            billingCustomer: "TEST CUSTOMER",
            bookingType: "NORMAL",
            department: "OPERATIONS",
            shipperRef: `SHIP-${Date.now()}`,
            customerRef: `CUST-${Date.now()}`,
            remarks: "GROUP E: Status test booking",
            loadType: "FULL",
            customerSo: "",
            references: "",
            quotation: "NONE",
            jobType: "DOMESTIC",
            measurementType: "WEIGHT",
            quantity: "100",
            uom: "KG",
            fromCompany: "SHIPPER COMPANY",
            toCompany: "CONSIGNEE COMPANY"
        };

        await bookingPage.createBooking(bookingData);
        
        const url = await authenticatedPage.url();
        const bookingIdMatch = url.match(/\/bookings\/([^\/]+)/);
        bookingId = bookingIdMatch ? bookingIdMatch[1] : "";
        
        await trackingPage.navigateToBooking(bookingId);
    });

    test("E1: Verify leg status changes from PENDING to COMPLETED", async ({ authenticatedPage }) => {
        const legData: LegData = {
            driver: "DRIVER_A",
            vehicle: "VEHICLE01",
            planStart: "0900",
            start: "0915",
            planEnd: "1700",
            end: "1730",
            endOut: "1745"
        };

        // Create leg - should be PENDING
        await trackingPage.openLegForCreation(1);
        await trackingPage.assignLegResources(legData);
        await trackingPage.updateLegTimeline(legData);
        await trackingPage.submitLeg();

        // Verify PENDING status
        await trackingPage.verifyLegStatus(1, "PENDING");

        // After all end times are filled, status should change to COMPLETED
        const updatedTimeline: LegData = {
            endOut: "1745"
        };
        await trackingPage.editLeg(1);
        await trackingPage.updateLegTimeline(updatedTimeline);
        await trackingPage.submitLeg();

        // Should be COMPLETED now
        await trackingPage.verifyLegStatus(1, "COMPLETED");
    });

    test("E2: Verify job status cascades from leg status", async ({ authenticatedPage }) => {
        const legData: LegData = {
            driver: "DRIVER_A",
            vehicle: "VEHICLE01",
            planStart: "0900",
            start: "0915",
            planEnd: "1700",
            end: "1730",
            endOut: "1745"
        };

        // Create and submit leg
        await trackingPage.openLegForCreation(1);
        await trackingPage.assignLegResources(legData);
        await trackingPage.updateLegTimeline(legData);
        await trackingPage.submitLeg();

        // Job status should reflect leg status
        // If all legs COMPLETED, job should be COMPLETED
        await trackingPage.verifyJobStatus(1, "COMPLETED");
    });
});
