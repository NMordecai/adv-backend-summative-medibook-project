const db = require('../utils/db');
const AppointmentModel = require('../models/appointmentModel');
const DoctorModel = require('../models/doctorModel');
const { isValidSlot, calculateRefund, MAX_APPOINTMENTS_PER_DAY } = require('../utils/bookingUtils');
const { logEvent } = require('../utils/logger');

const appointmentController = {
    bookAppointment: async (req, res, next) => {
        const { patient_id, doctor_id, appt_datetime } = req.body;

        if (!patient_id || !doctor_id || !appt_datetime) {
            return res.status(400).json({ error: 'patient_id, doctor_id, and appt_datetime are required' });
        }

        const validation = isValidSlot(appt_datetime);
        if (!validation.valid) {
            return res.status(422).json({ error: validation.message });
        }

        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            const doctor = await DoctorModel.findById(doctor_id);
            if (!doctor) {
                await connection.rollback();
                return res.status(404).json({ error: 'Doctor not found' });
            }

            // Safely extract the date string
            const dateString = appt_datetime.substring(0, 10); 
            
            const dailyCount = await AppointmentModel.countDoctorAppointmentsOnDate(connection, doctor_id, dateString);
            
            if (dailyCount >= MAX_APPOINTMENTS_PER_DAY) {
                await connection.rollback();
                return res.status(409).json({ error: 'Doctor has reached the maximum 12 appointments for this day' });
            }

            const existingSlot = await AppointmentModel.findSlot(connection, doctor_id, appt_datetime);
            if (existingSlot) {
                await connection.rollback();
                
                // --- PART E: It adds to Waitlist instead of failing ---
                const { addToWaitlist } = require('../utils/queueUtils');
                await addToWaitlist(patient_id, doctor_id, appt_datetime);
                
                return res.status(409).json({ 
                    error: 'This time slot is already booked',
                    message: 'You have been added to the waitlist for this slot.'
                });
            }

            const amountPaid = doctor.consultation_fee;
            const appointmentId = await AppointmentModel.create(connection, patient_id, doctor_id, appt_datetime, amountPaid);

            await connection.commit();

            await logEvent('BOOKING', {
                appointment_id: appointmentId,
                patient_id,
                doctor_id,
                appt_datetime,
                amount_paid: amountPaid
            });

            res.status(201).json({
                message: 'Appointment booked successfully',
                appointment_id: appointmentId,
                amount_paid: amountPaid
            });

        } catch (error) {
            await connection.rollback();
            console.error("BOOKING ERROR:", error);
            next(error);
        } finally {
            connection.release();
        }
    },

    cancelAppointment: async (req, res, next) => {
        const { id } = req.params;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const appointment = await AppointmentModel.findById(id);
            if (!appointment) {
                await connection.rollback();
                return res.status(404).json({ error: 'Appointment not found' });
            }

            if (appointment.status === 'cancelled') {
                await connection.rollback();
                return res.status(400).json({ error: 'Appointment is already cancelled' });
            }

            const { refundPercentage, refundAmount } = calculateRefund(appointment.appt_datetime, appointment.amount_paid);

            await AppointmentModel.cancel(connection, id, refundAmount);

            await connection.commit();

            await logEvent('CANCELLATION', {
                appointment_id: id,
                refund_amount: refundAmount,
                refund_percentage: refundPercentage * 100
            });
            
            // Trigger the worker by pushing a dummy message, or just let the interval pick it up.
            // The requirement says "a cancellation frees a slot, a worker process pops...".
            // The worker runs on a 5-second interval, so it will automatically find this cancellation.

            res.json({
                message: 'Appointment cancelled',
                refund_percentage: `${refundPercentage * 100}%`,
                refund_amount: refundAmount
            });

        } catch (error) {
            await connection.rollback();
            console.error("CANCEL ERROR:", error);
            next(error);
        } finally {
            connection.release();
        }
    }
};

module.exports = appointmentController;