require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');

// Import routes
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Middleware
app.use(express.json());

// Use routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to MediBook API' });
});

// --- PART G: i18n Feedback Page ---
app.get('/feedback', (req, res) => {
    const lang = req.query.lang;
    // Default to English, fallback to English if unsupported
    let localeFile = 'en';
    if (lang === 'fr') {
        localeFile = 'fr';
    }

    try {
        const translations = require(`../locales/${localeFile}.json`);
        
        const dateFormatter = new Intl.DateTimeFormat(localeFile === 'fr' ? 'fr-FR' : 'en-US', {
            dateStyle: 'full'
        });
        const today = dateFormatter.format(new Date());

        const html = `
            <!DOCTYPE html>
            <html lang="${localeFile}">
            <head>
                <meta charset="UTF-8">
                <title>${translations.title}</title>
                <style>
                    body { font-family: sans-serif; max-width: 800px; margin: auto; padding: 20px; }
                    textarea { width: 100%; height: 80px; margin-bottom: 15px; }
                    .question { margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <h1>${translations.title}</h1>
                <p><strong>${today}</strong></p>
                <p>${translations.instructions}</p>
                <form>
                    <div class="question"><label>1. ${translations.q1}</label><br><textarea></textarea></div>
                    <div class="question"><label>2. ${translations.q2}</label><br><textarea></textarea></div>
                    <div class="question"><label>3. ${translations.q3}</label><br><textarea></textarea></div>
                    <div class="question"><label>4. ${translations.q4}</label><br><textarea></textarea></div>
                    <div class="question"><label>5. ${translations.q5}</label><br><textarea></textarea></div>
                    <button type="submit">Submit</button>
                </form>
            </body>
            </html>
        `;
        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading translations.');
    }
});

// Central Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});