const ReportModel = require('../models/reportModel');

const reportController = {
    getDoctorsReport: async (req, res, next) => {
        try {
            const report = await ReportModel.getDoctorsReport();
            res.json(report);
        } catch (error) {
            next(error);
        }
    },

    getBusyDaysReport: async (req, res, next) => {
        try {
            const report = await ReportModel.getBusyDaysReport();
            res.json(report);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = reportController;