# Booking Tracking & Management Test Suite

## Overview
Comprehensive test suite for booking tracking operations using CRUD principles. Tests cover the full lifecycle of booking management from creation through tracking and status management.

## Test Structure

### Files Created
- **TrackingPageCodegen.ts** - Page Object Model for tracking operations
- **booking-tracking.spec.ts** - Test suite with 5 organized groups

### Test Organization: 5 GROUP Structure

#### GROUP A: CREATE - Add Legs to Booking ✅ IMPLEMENTED
Reuses booking created by booking-codegen.spec.ts and adds tracking elements.

**Tests:**
- **A1**: Add single job to booking
  - Creates job with DOMESTIC type
  - Verifies job appears in UI
  
- **A2**: Add job with trip and complete leg assignment
  - Creates job → trip → leg
  - Assigns driver and vehicle
  - Submits leg
  - Verifies leg status shows (PENDING/CREATED/ASSIGNED)
  
- **A3**: Add multiple jobs to single booking
  - Creates two jobs with different measurement types
  - Verifies both jobs exist in booking

**Pattern:** Each test creates a fresh booking with `bookingPage.createBooking()`

---

#### GROUP B: VALIDATE - Required Fields & Logic ✅ IMPLEMENTED
Tests validation rules and error handling.

**Tests:**
- **B1**: Cannot submit leg without driver
  - Attempts to submit leg with only vehicle
  - Verifies error message appears
  
- **B2**: Cannot submit leg without vehicle
  - Attempts to submit leg with only driver
  - Verifies error message appears
  
- **B3**: Cannot set end time before start time
  - Sets start time to 10:00 and end time to 09:00
  - Attempts submit
  - Verifies time range error

**Pattern:** Each test creates a fresh booking, tests negative scenarios

---

#### GROUP C: UPDATE - Edit Existing Legs ✅ IMPLEMENTED
Tests modification of existing leg data after submission.

**Tests:**
- **C1**: Update leg driver after initial submission
  - Creates leg with Driver A → submits
  - Edits leg → changes to Driver B → submits
  - Verifies Driver B appears in UI
  
- **C2**: Update leg vehicle assignment
  - Creates leg with Vehicle 01 → submits
  - Edits leg → changes to Vehicle 02 → submits
  - Verifies Vehicle 02 appears in UI
  
- **C3**: Update leg timeline fields
  - Creates leg with timeline: planStart=0900, start=0915, planEnd=1700, end=1730
  - Edits and updates times: start=0930, end=1745
  - Submits and verifies new times appear

**Pattern:** Each test creates a fresh booking, creates a leg, then edits it

---

#### GROUP D: CANCEL - Discard Changes ✅ IMPLEMENTED
Tests cancellation without saving (rollback scenarios).

**Tests:**
- **D1**: Cancel leg edit without saving changes
  - Creates leg with Driver Original → submits
  - Opens for edit and changes to Driver Changed
  - Cancels without saving
  - Verifies Driver Original still exists (change was discarded)
  
- **D2**: Cancel new leg creation without saving
  - Starts creating leg with Driver Temporary
  - Cancels before submitting
  - Verifies leg was NOT created

**Pattern:** Each test creates a fresh booking, tests cancel/discard flows

---

#### GROUP E: READ & STATUS - Verify State Transitions ✅ IMPLEMENTED
Tests status verification and state cascade logic.

**Tests:**
- **E1**: Verify leg status changes from PENDING to COMPLETED
  - Creates leg with all timeline fields filled
  - Submits and verifies PENDING status
  - Edits to ensure endOut time is set
  - Submits and verifies COMPLETED status
  
- **E2**: Verify job status cascades from leg status
  - Creates leg with all timeline fields
  - Submits leg
  - Verifies job status reflects leg completion (COMPLETED)

**Pattern:** Each test creates a fresh booking, verifies status transitions

---

## POM Method Reference: TrackingPageCodegen

### Navigation
- `navigateToBooking(bookingId)` - Navigate to booking detail page

### CREATE Operations
- `addJob(jobData)` - Add new job to booking
- `addTrip(tripData, jobIndex)` - Add trip within job
- `openLegForCreation(legNumber)` - Open leg for initial creation

### UPDATE Operations
- `assignLegResources(legData)` - Assign driver, vehicle, remarks
- `updateLegTimeline(timelineData)` - Set timeline fields (start, end, planStart, planEnd, etc.)
- `submitLeg()` - Save leg changes
- `editLeg(legNumber)` - Open existing leg for editing

### DELETE/CANCEL Operations
- `cancelLegEdit()` - Close dialog and discard changes

### READ Operations
- `verifyLegStatus(legNumber, expectedStatus)` - Assert leg status
- `verifyJobStatus(jobNumber, expectedStatus)` - Assert job status

### VALIDATION Operations
- `attemptSubmitWithoutDriver()` - Returns true if error appears
- `attemptSubmitWithoutVehicle()` - Returns true if error appears
- `attemptInvalidTimeRange(startTime, endTime)` - Returns true if error appears

---

## Data Interfaces

### BookingData (from booking-codegen)
```typescript
{
    billingCustomer: string;
    bookingType: string;      // "NORMAL", "EXPRESS", etc.
    department: string;        // "OPERATIONS", etc.
    shipperRef: string;        // Reference number
    customerRef: string;       // Customer reference
    remarks: string;           // Booking remarks
    loadType: string;          // "FULL", "LTL", etc.
    customerSo: string;        // Customer SO (optional)
    references: string;        // Additional references
    quotation: string;         // "NONE", quotation ID, etc.
    jobType: string;           // "DOMESTIC", "INTERNATIONAL", etc.
    measurementType: string;   // "WEIGHT", "VOLUME"
    quantity: string;          // "100", "50", etc.
    uom: string;              // "KG", "CBM", "PALLETS"
    fromCompany: string;       // Shipper company
    toCompany: string;         // Consignee company
}
```

### JobData (from TrackingData)
```typescript
{
    jobType: string;           // "DOMESTIC", "INTERNATIONAL"
    measurementType: string;   // "WEIGHT", "VOLUME"
    quantity: string;          // "100", "500", etc.
    uom: string;              // "KG", "CBM"
    remarks?: string;         // Job remarks
}
```

### TripData (from TrackingData)
```typescript
{
    fromCompany: string;       // Origin company
    toCompany: string;         // Destination company
    remarks?: string;          // Trip remarks
}
```

### LegData (from TrackingData)
```typescript
{
    driver?: string;           // Driver name/ID
    vehicle?: string;          // Vehicle ID/plate
    remarks?: string;          // Leg remarks
    planStart?: string;        // Planned start time (HHmm format)
    start?: string;            // Actual start time
    startOut?: string;         // Start out time
    planEnd?: string;          // Planned end time
    end?: string;              // Actual end time
    endOut?: string;           // End out time
}
```

---

## Running the Tests

### Run all tracking tests
```bash
npx playwright test booking-tracking.spec.ts
```

### Run specific GROUP
```bash
npx playwright test booking-tracking.spec.ts --grep "GROUP A"
npx playwright test booking-tracking.spec.ts --grep "GROUP B"
npx playwright test booking-tracking.spec.ts --grep "GROUP C"
npx playwright test booking-tracking.spec.ts --grep "GROUP D"
npx playwright test booking-tracking.spec.ts --grep "GROUP E"
```

### Run specific test
```bash
npx playwright test booking-tracking.spec.ts -g "A1"
npx playwright test booking-tracking.spec.ts -g "C3"
```

### Run with trace/debug
```bash
npx playwright test booking-tracking.spec.ts --debug
```

---

## Key Implementation Notes

### Booking Creation for Each Group
Each test group (B-E) creates a fresh booking before running tests, ensuring:
- Test independence (can run in any order)
- Isolation (no cross-test side effects)
- Repeatability (deterministic results)

GROUP A reuses a single booking created once, for efficiency.

### Dropdown Selection Pattern
TrackingPageCodegen uses the proven keyboard-filtering approach from BookingPageCodegen:
```typescript
await this.page.keyboard.type(value.substring(0, 5)); // Type first 5 chars
await this.page.waitForTimeout(300);
await this.page.locator('.ant-select-item-option').first().click();
```

This avoids issues with virtualized lists and element visibility.

### Status Verification
Status text is verified using regex patterns to handle variations:
```typescript
await expect(authenticatedPage.locator('text=/PENDING|CREATED|ASSIGNED/')).toBeVisible();
```

### Timeline Fields
Time fields use HHmm format (e.g., "0900" for 9:00 AM, "1730" for 5:30 PM).

---

## Integration with booking-codegen.spec.ts

- **booking-codegen.spec.ts**: Creates bookings and tests booking creation flow
- **booking-tracking.spec.ts**: Tests tracking operations on existing bookings
- Both use `authenticatedPage` fixture for pre-authenticated sessions
- Both use same dropdown selection strategy for consistency

---

## Future Enhancements

1. **Concurrent Leg Operations**
   - Add tests for multiple legs in single trip
   - Test concurrent updates to different legs

2. **Advanced Status Flows**
   - Test incomplete leg status (missing fields)
   - Test status cascading across jobs and trips
   - Test revert scenarios (COMPLETED → PENDING)

3. **Data Validation**
   - Test special characters in remarks
   - Test maximum length fields
   - Test date/time edge cases

4. **Performance Tests**
   - Booking with many jobs/trips/legs
   - Bulk operations on multiple bookings

5. **Error Scenarios**
   - Network failures during submit
   - Session timeout during edit
   - Concurrent edit conflicts

---

## Debugging Tips

1. **Enable trace**: Add `--trace on` to capture full browser session
2. **Use slowMo**: Add `--slow-mo 500` to watch execution in slow motion
3. **Check selectors**: Use DevTools in test to verify selectors still work
4. **Log timezone**: Some time-related tests may need timezone awareness
5. **Verify test data**: Use TEST CUSTOMER / SHIPPER COMPANY that exist in your system
