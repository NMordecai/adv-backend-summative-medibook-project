const fs = require('fs').promises;
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'audit.log');

const logEvent = async (eventType, data) => {
    try {
        // Ensure the directory exists
        await fs.mkdir(LOG_DIR, { recursive: true });

        const logEntry = {
            timestamp: new Date().toISOString(),
            event: eventType,
            data: data
        };

        // Append as a JSON line
        await fs.appendFile(LOG_FILE, JSON.stringify(logEntry) + '\n', 'utf8');
    } catch (error) {
        // CRITICAL: A logging failure must NOT fail the user's request
        console.error('Failed to write to audit log:', error);
    }
};

module.exports = { logEvent };