const redis = require('./redis');

const QUEUE_NAME = 'waitlist:appointments';

const addToWaitlist = async (patientId, doctorId, apptDatetime) => {
    const data = JSON.stringify({ patientId, doctorId, apptDatetime });
    await redis.rpush(QUEUE_NAME, data);
};

const popFromWaitlist = async () => {
    const data = await redis.lpop(QUEUE_NAME);
    return data ? JSON.parse(data) : null;
};

module.exports = { addToWaitlist, popFromWaitlist };