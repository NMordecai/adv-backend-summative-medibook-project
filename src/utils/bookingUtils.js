// src/utils/bookingUtils.js

const WORKING_HOURS_START = 9;
const WORKING_HOURS_END = 17;
const MAX_APPOINTMENTS_PER_DAY = 12;

const isValidSlot = (dateString) => {
    // Here I replaced space with 'T' to ensure consistent parsing across all environments
    const normalizedDate = dateString.replace(' ', 'T');
    const date = new Date(normalizedDate);
    const now = new Date();

    if (isNaN(date.getTime())) {
        return { valid: false, message: 'Invalid date format provided' };
    }

    // 1. Must be in the future
    if (date <= now) {
        return { valid: false, message: 'Appointment must be in the future' };
    }

    const hours = date.getHours();
    const minutes = date.getMinutes();

    // 2. Must be within working hours
    if (hours < WORKING_HOURS_START || hours >= WORKING_HOURS_END) {
        return { valid: false, message: 'Appointment must be between 09:00 and 17:00' };
    }

    // 3. Must be on a 30-minute boundary
    if (minutes !== 0 && minutes !== 30) {
        return { valid: false, message: 'Appointments must be on a 30-minute boundary' };
    }

    return { valid: true };
};

/**
 * Calculates refund based on hours before the appointment
 */
const calculateRefund = (appointmentDate, amountPaid) => {
    const now = new Date();
    const apptDate = new Date(appointmentDate);
    const diffInHours = (apptDate - now) / (1000 * 60 * 60);

    let refundPercentage = 0;

    if (diffInHours > 48) {
        refundPercentage = 1.0; // 100%
    } else if (diffInHours >= 24 && diffInHours <= 48) {
        refundPercentage = 0.5; // 50%
    } else {
        refundPercentage = 0.0; // 0%
    }

    return {
        refundPercentage,
        refundAmount: parseFloat(amountPaid) * refundPercentage
    };
};

module.exports = {
    isValidSlot,
    calculateRefund,
    MAX_APPOINTMENTS_PER_DAY
};