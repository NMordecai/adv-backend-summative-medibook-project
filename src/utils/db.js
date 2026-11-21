const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'medibook',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Use the promise wrapper so we can use async/await in our controllers
const db = pool.promise();

module.exports = db;