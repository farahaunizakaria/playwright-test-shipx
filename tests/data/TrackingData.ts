/**
 * TrackingData interfaces for booking leg/job tracking operations (TEST 3: TEST UPDATE LEGS AND TRIPS)
 * Used in GROUP A-E test suites in booking-tracking.spec.ts
 */

export interface LegTimelineData {
    planStart?: string | boolean;    // ISO string or time format "HH:mm", or true to use current time
    start?: string | boolean;
    startOut?: string | boolean;
    planEnd?: string | boolean;
    end?: string | boolean;
    endOut?: string | boolean;
}

export interface LegAssignmentData {
    driver?: string;       // Driver name (searchable text)
    vehicle?: string;      // Vehicle identifier (searchable text)
    transporter?: string;  // Company/Transporter name
    assistants?: string;   // Assistant name(s)
    remarks?: string;      // Leg remarks/notes
}

export interface LegData extends LegTimelineData, LegAssignmentData {
    // Combined interface for complete leg update
}

export interface JobData {
    jobType: string;           // e.g., "DOMESTIC"
    measurementType: string;   // e.g., "Linear"
    quantity: string;          // e.g., "km"
    uom: string;              // e.g., "TRIP"
    remarks?: string;
}

export interface TripData {
    fromCompany: string;      // Source company
    toCompany: string;        // Destination company
    fromAddress?: string;     // Source address
    toAddress?: string;       // Destination address
    remarks?: string;
}

export interface BookingTrackingState {
    bookingId: string;
    jobId?: string;
    tripId?: string;
    legId?: string;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}
