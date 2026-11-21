const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/doctors', reportController.getDoctorsReport);
router.get('/busy-days', reportController.getBusyDaysReport);

module.exports = router;