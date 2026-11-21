const db = require('../utils/db');

const DoctorModel = {
    create: async (name, specialty, consultation_fee, room) => {
        const [result] = await db.query(
            'INSERT INTO doctors (name, specialty, consultation_fee, room) VALUES (?, ?, ?, ?)',
            [name, specialty, consultation_fee, room]
        );
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM doctors');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM doctors WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, name, specialty, consultation_fee, room) => {
        const [result] = await db.query(
            'UPDATE doctors SET name = ?, specialty = ?, consultation_fee = ?, room = ? WHERE id = ?',
            [name, specialty, consultation_fee, room, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM doctors WHERE id = ?', [id]);
        return result.affectedRows;
    },

    // --- PART C.4: Statistics ---
    
    getStats: async (doctorId) => {
        const [rows] = await db.query(
            `SELECT 
                COALESCE(SUM(CASE WHEN status = 'booked' OR status = 'cancelled' THEN amount_paid ELSE 0 END), 0) AS total_revenue,
                COUNT(CASE WHEN appt_datetime > NOW() AND status = 'booked' THEN 1 END) AS upcoming_appointments
             FROM appointments 
             WHERE doctor_id = ?`,
            [doctorId]
        );
        return rows[0];
    },

    // Get appointments per day for the next 7 days
    getUpcomingWeekStats: async (doctorId) => {
        const [rows] = await db.query(
            `SELECT 
                DATE(appt_datetime) AS date,
                COUNT(*) AS appointments_count
             FROM appointments
             WHERE doctor_id = ? 
               AND status = 'booked'
               AND DATE(appt_datetime) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
             GROUP BY DATE(appt_datetime)
             ORDER BY date ASC`,
            [doctorId]
        );
        return rows;
    }
};

module.exports = DoctorModel;