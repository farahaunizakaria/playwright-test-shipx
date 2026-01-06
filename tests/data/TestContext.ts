// /**
//  * TestContext interface and manager for sharing data between page objects
//  * ## Option 2: TestContext (For Complex Tests)

// Use if you have many page objects sharing data:

// ```typescript
// import { TestContextManager } from '../data/TestContext';

// test('complex flow', async ({ page }) => {
//     const context = new TestContextManager();
//     const bookingPage = new BookingPageCodegen(page, context);
//     const invoicePage = new InvoicePage(page, context);
    
//     await bookingPage.createBooking(bookingData);
//     await bookingPage.submitBooking();
//     // Booking ID auto-saved to context
    
//     await invoicePage.navigateToCurrentBooking(); 
//     // Gets booking ID from context automatically
// });
//  * Use this to pass booking IDs, invoice numbers, and other test data
//  * between page objects without manual parameter passing.
//  */

// export interface TestContext {
//     bookingId?: string;
//     invoiceNumber?: string;
//     shiftId?: string;
//     driverName?: string;
//     vehicleCode?: string;
//     legId?: string;
//     tripId?: string;
// }

// /**
//  * TestContextManager - Manages test execution state
//  * 
//  * @example
//  * ```typescript
//  * const context = new TestContextManager();
//  * const bookingPage = new BookingPageCodegen(page, context);
//  * const invoicePage = new InvoicePage(page, context);
//  * 
//  * await bookingPage.createBooking(data); // auto-stores bookingId
//  * await invoicePage.navigateToCurrentBooking(); // uses stored bookingId
//  * ```
//  */
// export class TestContextManager {
//     private context: TestContext = {};

//     /**
//      * Set a value in the context
//      * @param key - Context key to set
//      * @param value - Value to store
//      */
//     set(key: keyof TestContext, value: string): void {
//         this.context[key] = value;
//         console.log(`📝 Context updated: ${key} = ${value}`);
//     }

//     /**
//      * Get a value from the context (returns undefined if not set)
//      * @param key - Context key to retrieve
//      * @returns The stored value or undefined
//      */
//     get(key: keyof TestContext): string | undefined {
//         return this.context[key];
//     }

//     /**
//      * Get a required value from the context (throws if not set)
//      * @param key - Context key to retrieve
//      * @returns The stored value
//      * @throws Error if key is not set
//      */
//     require(key: keyof TestContext): string {
//         const value = this.context[key];
//         if (!value) {
//             throw new Error(`Required context key "${key}" is not set. Make sure to run prerequisite steps first.`);
//         }
//         return value;
//     }

//     /**
//      * Check if a key exists in the context
//      * @param key - Context key to check
//      * @returns true if key is set
//      */
//     has(key: keyof TestContext): boolean {
//         return this.context[key] !== undefined;
//     }

//     /**
//      * Clear all context data
//      */
//     clear(): void {
//         this.context = {};
//         console.log('🧹 Context cleared');
//     }

//     /**
//      * Get all context data (read-only copy)
//      * @returns Copy of all context data
//      */
//     getAll(): Readonly<TestContext> {
//         return { ...this.context };
//     }

//     /**
//      * Set multiple values at once
//      * @param data - Object with key-value pairs to set
//      */
//     setMultiple(data: Partial<TestContext>): void {
//         Object.entries(data).forEach(([key, value]) => {
//             if (value !== undefined) {
//                 this.set(key as keyof TestContext, value);
//             }
//         });
//     }

//     /**
//      * Log current context state (for debugging)
//      */
//     log(): void {
//         console.log('📋 Current context state:', JSON.stringify(this.context, null, 2));
//     }
// }
