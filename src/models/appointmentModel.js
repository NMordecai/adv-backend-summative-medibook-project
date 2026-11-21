const db = require('../utils/db');

const AppointmentModel = {
    countDoctorAppointmentsOnDate: async (connection, doctorId, dateString) => {
        const [rows] = await connection.query(
            `SELECT COUNT(*) as count 
             FROM appointments 
             WHERE doctor_id = ? 
               AND DATE(appt_datetime) = ? 
               AND status = 'booked'`,
            [doctorId, dateString]
        );
        return rows[0].count;
    },

    findSlot: async (connection, doctorId, apptDatetime) => {
        // Here I normalize the datetime to avoid timezone/formatting mismatch in the query
        const [rows] = await connection.query(
            `SELECT id FROM appointments 
             WHERE doctor_id = ? AND appt_datetime = ? AND status = 'booked'
             FOR UPDATE`, 
            [doctorId, apptDatetime]
        );
        return rows[0];
    },

    create: async (connection, patientId, doctorId, apptDatetime, amountPaid) => {
        const [result] = await connection.query(
            `INSERT INTO appointments (patient_id, doctor_id, appt_datetime, amount_paid, status) 
             VALUES (?, ?, ?, ?, 'booked')`,
            [patientId, doctorId, apptDatetime, amountPaid]
        );
        return result.insertId;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
        return rows[0];
    },

    cancel: async (connection, appointmentId, refundAmount) => {
        const [result] = await connection.query(
            `UPDATE appointments 
             SET status = 'cancelled', amount_paid = (amount_paid - ?) 
             WHERE id = ?`,
            [refundAmount, appointmentId]
        );
        return result.affectedRows;
    }
};

module.exports = AppointmentModel;