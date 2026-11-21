require('dotenv').config();
const { popFromWaitlist, addToWaitlist } = require('./src/utils/queueUtils');
const AppointmentModel = require('./src/models/appointmentModel');
const DoctorModel = require('./src/models/doctorModel');
const db = require('./src/utils/db');
const { logEvent } = require('./src/utils/logger');

console.log('Worker started. Listening for tasks...');

const processQueue = async () => {
    const job = await popFromWaitlist();
    
    if (!job) return; // Here the Queue is empty

    console.log('Processing waitlist job:', job);
    const { patientId, doctorId, apptDatetime } = job;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if slot is STILL taken
        const existingSlot = await AppointmentModel.findSlot(connection, doctorId, apptDatetime);
        if (existingSlot) {
            console.log('Slot still taken. Putting patient back in queue...');
            await connection.rollback();
            // Put them back at the front of the queue so they don't get lost
            await addToWaitlist(patientId, doctorId, apptDatetime); 
            return;
        }

        const doctor = await DoctorModel.findById(doctorId);
        const appointmentId = await AppointmentModel.create(connection, patientId, doctorId, apptDatetime, doctor.consultation_fee);
        
        await connection.commit();

        console.log(`Successfully auto-booked waitlisted patient ${patientId} for slot ${apptDatetime}`);
        
        await logEvent('WAITLIST_PROMOTION', {
            appointment_id: appointmentId,
            patient_id: patientId,
            doctor_id: doctorId,
            appt_datetime: apptDatetime
        });

    } catch (error) {
        await connection.rollback();
        console.error('Waitlist booking failed:', error);
        // Put them back in the queue if the booking fails
        await addToWaitlist(patientId, doctorId, apptDatetime);
    } finally {
        connection.release();
    }
};

// Run the queue check every 5 seconds
setInterval(processQueue, 5000);