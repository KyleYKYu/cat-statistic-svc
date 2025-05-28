const mysql = require('mysql2');
const dbConfig = require('../config/dbconfig');

// Create a connection pool
const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the pool for use in other files
module.exports = pool.promise();