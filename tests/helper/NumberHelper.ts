/**
 * NumberHelper - Utility for generating random numbers for test data
 */
export class NumberHelper {
    /**
     * Generate a random number string with specified length
     * @param length Length of the number string (default: 6)
     * @param prefix Optional prefix for the number
     * @returns Random number string
     */
    static generateRandomNumber(length: number = 6, prefix: string = ''): string {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        return `${prefix}${randomNum}`;
    }

    /**
     * Generate vessel-related numbers
     */
    static generateVesselName(): string {
        return this.generateRandomNumber(8, 'VSL');
    }

    static generateOperatorCode(): string {
        return this.generateRandomNumber(4);
    }

    static generateVoyageNumber(): string {
        return this.generateRandomNumber(6, 'V');
    }

    static generateContainerNumber(): string {
        // Container numbers are typically 11 characters: 4 letters + 7 digits
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const prefix = Array.from({length: 4}, () => letters[Math.floor(Math.random() * letters.length)]).join('');
        const numbers = this.generateRandomNumber(7);
        return `${prefix}${numbers}`;
    }

    static generateSealNumber(): string {
        return this.generateRandomNumber(8, 'SL');
    }

    static generateVesselId(): string {
        return this.generateRandomNumber(6, 'VID');
    }

    static generateReference(): string {
        return this.generateRandomNumber(10, 'REF');
    }
}