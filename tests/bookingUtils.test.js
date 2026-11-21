const { calculateRefund, isValidSlot } = require('../src/utils/bookingUtils');

describe('Booking Utils Tests', () => {
    
    // --- REFUND TESTS ---
    describe('calculateRefund', () => {
        // We mock the current time so the tests are consistent
        const amountPaid = 100;

        beforeAll(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-12-01T12:00:00Z'));
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        test('should give 100% refund if > 48 hours notice', () => {
            // 49 hours later
            const apptDate = '2026-12-03T13:00:00Z'; 
            const result = calculateRefund(apptDate, amountPaid);
            expect(result.refundPercentage).toBe(1.0);
            expect(result.refundAmount).toBe(100);
        });

        test('should give 50% refund at exactly 48 hours boundary', () => {
            // Exactly 48 hours later
            const apptDate = '2026-12-03T12:00:00Z'; 
            const result = calculateRefund(apptDate, amountPaid);
            expect(result.refundPercentage).toBe(0.5);
            expect(result.refundAmount).toBe(50);
        });

        test('should give 50% refund at exactly 24 hours boundary', () => {
            // Exactly 24 hours later
            const apptDate = '2026-12-02T12:00:00Z'; 
            const result = calculateRefund(apptDate, amountPaid);
            expect(result.refundPercentage).toBe(0.5);
            expect(result.refundAmount).toBe(50);
        });

        test('should give 0% refund if < 24 hours notice', () => {
            // 1 hour later
            const apptDate = '2026-12-01T13:00:00Z'; 
            const result = calculateRefund(apptDate, amountPaid);
            expect(result.refundPercentage).toBe(0.0);
            expect(result.refundAmount).toBe(0);
        });
    });

    // --- VALIDATION TESTS ---
    describe('isValidSlot', () => {
        test('should reject slots that are not on 30-minute boundaries', () => {
            // 09:15 is not on a 30-min boundary
            const result = isValidSlot('2027-01-01 09:15:00'); 
            expect(result.valid).toBe(false);
            expect(result.message).toContain('30-minute boundary');
        });

        test('should reject slots outside working hours (e.g., 08:00)', () => {
            const result = isValidSlot('2027-01-01 08:00:00'); 
            expect(result.valid).toBe(false);
            expect(result.message).toContain('between 09:00 and 17:00');
        });

        test('should accept valid future slots (e.g., 10:30)', () => {
            const result = isValidSlot('2027-01-01 10:30:00'); 
            expect(result.valid).toBe(true);
        });
    });
});