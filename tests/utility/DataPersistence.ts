// import * as fs from 'fs';
// import * as path from 'path';

// /**
//  * Useful for:
//  * - Running tests independently
//  * - Sharing data between test runs
//  * 
//  * @example
//  * ```typescript
//  * // Save booking ID for later use
//  * DataPersistence.save('latest-booking-id', bookingId);
//  * 
//  * // Load in another test
//  * const bookingId = DataPersistence.require('latest-booking-id');
//  * ```
//  */
// export class DataPersistence {
//     private static readonly DATA_DIR = path.join(__dirname, '../../test-data');

//     /**
//      * Ensure data directory exists
//      */
//     private static ensureDataDir(): void {
//         if (!fs.existsSync(this.DATA_DIR)) {
//             fs.mkdirSync(this.DATA_DIR, { recursive: true });
//         }
//     }

//     /**
//      * Save data to file
//      * @param key - Unique key for the data
//      * @param value - Value to store
//      */
//     static save(key: string, value: string): void {
//         this.ensureDataDir();
//         const filePath = path.join(this.DATA_DIR, `${key}.txt`);
//         fs.writeFileSync(filePath, value, 'utf-8');
//         console.log(`💾 Saved ${key}: ${value}`);
//     }

//     /**
//      * Load data from file (returns null if not found)
//      * @param key - Key to load
//      * @returns Stored value or null
//      */
//     static load(key: string): string | null {
//         const filePath = path.join(this.DATA_DIR, `${key}.txt`);
        
//         if (fs.existsSync(filePath)) {
//             const value = fs.readFileSync(filePath, 'utf-8').trim();
//             console.log(`📂 Loaded ${key}: ${value}`);
//             return value;
//         }
        
//         console.warn(`⚠️  No data found for key: ${key}`);
//         return null;
//     }

//     /**
//      * Load required data (throws if not found)
//      * @param key - Key to load
//      * @returns Stored value
//      * @throws Error if key not found
//      */
//     static require(key: string): string {
//         const value = this.load(key);
//         if (!value) {
//             throw new Error(
//                 `Required data key "${key}" not found. ` +
//                 `Run prerequisite test first or manually create: test-data/${key}.txt`
//             );
//         }
//         return value;
//     }

//     /**
//      * Check if data exists for a key
//      * @param key - Key to check
//      * @returns true if data exists
//      */
//     static exists(key: string): boolean {
//         const filePath = path.join(this.DATA_DIR, `${key}.txt`);
//         return fs.existsSync(filePath);
//     }

//     /**
//      * Delete data for a key
//      * @param key - Key to delete
//      */
//     static clear(key: string): void {
//         const filePath = path.join(this.DATA_DIR, `${key}.txt`);
//         if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//             console.log(`🗑️  Cleared ${key}`);
//         }
//     }

//     /**
//      * Clear all persisted data
//      */
//     static clearAll(): void {
//         if (fs.existsSync(this.DATA_DIR)) {
//             const files = fs.readdirSync(this.DATA_DIR);
//             files.forEach(file => {
//                 fs.unlinkSync(path.join(this.DATA_DIR, file));
//             });
//             console.log(`🗑️  Cleared all persisted data (${files.length} files)`);
//         }
//     }

//     /**
//      * List all persisted keys
//      * @returns Array of available keys
//      */
//     static listKeys(): string[] {
//         if (!fs.existsSync(this.DATA_DIR)) {
//             return [];
//         }
        
//         return fs.readdirSync(this.DATA_DIR)
//             .filter(file => file.endsWith('.txt'))
//             .map(file => file.replace('.txt', ''));
//     }

//     /**
//      * Save multiple key-value pairs at once
//      * @param data - Object with key-value pairs to save
//      */
//     static saveMultiple(data: Record<string, string>): void {
//         Object.entries(data).forEach(([key, value]) => {
//             this.save(key, value);
//         });
//     }

//     /**
//      * Load multiple keys at once
//      * @param keys - Array of keys to load
//      * @returns Object with loaded data (null for missing keys)
//      */
//     static loadMultiple(keys: string[]): Record<string, string | null> {
//         const result: Record<string, string | null> = {};
//         keys.forEach(key => {
//             result[key] = this.load(key);
//         });
//         return result;
//     }
// }

// /**
//  * BookingIdManager - Specialized manager for booking IDs
//  * 
//  * Uses the existing latest-booking-id.txt file at project root
//  */
// export class BookingIdManager {
//     private static readonly FILE_PATH = path.join(__dirname, '../../latest-booking-id.txt');

//     static save(bookingId: string): void {
//         fs.writeFileSync(this.FILE_PATH, bookingId, 'utf-8');
//         console.log(`💾 Saved latest booking ID: ${bookingId}`);
//     }

//     static load(): string | null {
//         if (fs.existsSync(this.FILE_PATH)) {
//             const id = fs.readFileSync(this.FILE_PATH, 'utf-8').trim();
//             console.log(`📂 Loaded latest booking ID: ${id}`);
//             return id;
//         }
//         console.warn('⚠️  No booking ID found in latest-booking-id.txt');
//         return null;
//     }

//     static require(): string {
//         const id = this.load();
//         if (!id) {
//             throw new Error(
//                 'No booking ID found in latest-booking-id.txt. ' +
//                 'Create a booking first or manually set the ID in the file.'
//             );
//         }
//         return id;
//     }

//     static exists(): boolean {
//         return fs.existsSync(this.FILE_PATH);
//     }
// }
