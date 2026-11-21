const PatientModel = require('../models/patientModel');

const patientController = {
    createPatient: async (req, res, next) => {
        try {
            const { name, email, phone } = req.body;
            if (!name || !email || !phone) {
                return res.status(400).json({ error: 'Name, email, and phone are required' });
            }
            const id = await PatientModel.create(name, email, phone);
            res.status(201).json({ message: 'Patient created', id });
        } catch (error) {
            // Handle duplicate email error
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Email already exists' });
            }
            next(error);
        }
    },

    getAllPatients: async (req, res, next) => {
        try {
            const patients = await PatientModel.findAll();
            res.json(patients);
        } catch (error) {
            next(error);
        }
    },

    getPatientById: async (req, res, next) => {
        try {
            const patient = await PatientModel.findById(req.params.id);
            if (!patient) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            res.json(patient);
        } catch (error) {
            next(error);
        }
    },

    updatePatient: async (req, res, next) => {
        try {
            const { name, email, phone } = req.body;
            if (!name || !email || !phone) {
                return res.status(400).json({ error: 'Name, email, and phone are required' });
            }
            const affectedRows = await PatientModel.update(req.params.id, name, email, phone);
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            res.json({ message: 'Patient updated' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Email already exists' });
            }
            next(error);
        }
    },

    deletePatient: async (req, res, next) => {
        try {
            const affectedRows = await PatientModel.delete(req.params.id);
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
};

module.exports = patientController;