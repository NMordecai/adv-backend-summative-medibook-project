const db = require('../utils/db');

const ReportModel = {
    // Part C.5: Doctors Report
    getDoctorsReport: async () => {
        const [rows] = await db.query(
            `SELECT 
                d.id AS doctor_id,
                d.name AS doctor_name,
                COUNT(a.id) AS total_appointments,
                COALESCE(SUM(CASE WHEN a.status = 'booked' THEN a.amount_paid ELSE 0 END), 0) AS total_revenue
             FROM doctors d
             LEFT JOIN appointments a ON d.id = a.doctor_id
             GROUP BY d.id, d.name
             ORDER BY total_revenue DESC`
        );
        return rows;
    },

    // Part C.6: Busy Days Report 
    getBusyDaysReport: async () => {
        const [rows] = await db.query(
            `SELECT 
                d.name AS doctor_name,
                DATE(a.appt_datetime) AS date,
                COUNT(a.id) AS total_booked,
                (COUNT(a.id) / 12) * 100 AS utilization_percentage
             FROM appointments a
             JOIN doctors d ON a.doctor_id = d.id
             WHERE a.status = 'booked'
             GROUP BY d.id, d.name, DATE(a.appt_datetime)
             HAVING COUNT(a.id) >= 10
             ORDER BY date ASC`
        );
        return rows;
    }
};

module.exports = ReportModel;