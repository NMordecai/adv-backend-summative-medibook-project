const db = require('../utils/db');

const PatientModel = {
    create: async (name, email, phone) => {
        const [result] = await db.query(
            'INSERT INTO patients (name, email, phone) VALUES (?, ?, ?)',
            [name, email, phone]
        );
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM patients');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, name, email, phone) => {
        const [result] = await db.query(
            'UPDATE patients SET name = ?, email = ?, phone = ? WHERE id = ?',
            [name, email, phone, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM patients WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = PatientModel;