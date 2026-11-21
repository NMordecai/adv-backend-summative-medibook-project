const DoctorModel = require('../models/doctorModel');

const doctorController = {
    createDoctor: async (req, res, next) => {
        try {
            const { name, specialty, consultation_fee, room } = req.body;
            // Basic validation
            if (!name || !specialty || !consultation_fee || !room) {
                return res.status(400).json({ error: 'Name, specialty, consultation_fee, and room are required' });
            }
            if (isNaN(consultation_fee) || consultation_fee < 0) {
                return res.status(400).json({ error: 'Consultation fee must be a positive number' });
            }

            const id = await DoctorModel.create(name, specialty, consultation_fee, room);
            res.status(201).json({ message: 'Doctor created', id });
        } catch (error) {
            next(error);
        }
    },

    getAllDoctors: async (req, res, next) => {
        try {
            const doctors = await DoctorModel.findAll();
            res.json(doctors);
        } catch (error) {
            next(error);
        }
    },

    getDoctorById: async (req, res, next) => {
        try {
            const doctor = await DoctorModel.findById(req.params.id);
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found' });
            }
            res.json(doctor);
        } catch (error) {
            next(error);
        }
    },

    updateDoctor: async (req, res, next) => {
        try {
            const { name, specialty, consultation_fee, room } = req.body;
            if (!name || !specialty || !consultation_fee || !room) {
                return res.status(400).json({ error: 'All fields are required' });
            }
            const affectedRows = await DoctorModel.update(req.params.id, name, specialty, consultation_fee, room);
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Doctor not found' });
            }
            res.json({ message: 'Doctor updated' });
        } catch (error) {
            next(error);
        }
    },

    deleteDoctor: async (req, res, next) => {
        try {
            const affectedRows = await DoctorModel.delete(req.params.id);
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Doctor not found' });
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },

    // --- PART C.4: Statistics ---
    getDoctorStats: async (req, res, next) => {
        try {
            const doctorId = req.params.id;
            
            // Check if doctor exists first
            const doctor = await DoctorModel.findById(doctorId);
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found' });
            }

            // Fetch the two SQL aggregations
            const overallStats = await DoctorModel.getStats(doctorId);
            const weeklyStats = await DoctorModel.getUpcomingWeekStats(doctorId);

            // Calculate utilization for each day in the next 7 days
            // The cap is 12 appointments per day.
            const MAX_SLOTS_PER_DAY = 12;
            
            const formattedWeeklyStats = weeklyStats.map(day => {
                const utilizationPercentage = ((day.appointments_count / MAX_SLOTS_PER_DAY) * 100).toFixed(2);
                return {
                    date: day.date,
                    appointments: day.appointments_count,
                    utilization: `${utilizationPercentage}%`
                };
            });

            res.json({
                doctor_id: doctorId,
                doctor_name: doctor.name,
                total_revenue: overallStats.total_revenue,
                upcoming_appointments: overallStats.upcoming_appointments,
                next_7_days: formattedWeeklyStats
            });

        } catch (error) {
            next(error);
        }
    }
};

module.exports = doctorController;