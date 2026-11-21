const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.post('/book', appointmentController.bookAppointment);
router.delete('/:id', appointmentController.cancelAppointment);

module.exports = router;