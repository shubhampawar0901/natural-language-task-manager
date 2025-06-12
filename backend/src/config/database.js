const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Debug environment variables
console.log('Database config:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ? '***' : 'EMPTY',
    database: process.env.DB_NAME || 'task_manager'
});

// Create the enhanced connection pool for task items database
const taskItemsPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'task_manager',
    waitForConnections: true,
    connectionLimit: 15, // Increased for better performance
    queueLimit: 0,
    charset: 'utf8mb4'
});

// Enhanced database connection testing with retry logic
async function validateDatabaseConnection() {
    let retries = 3;
    while (retries > 0) {
        try {
            const connection = await taskItemsPool.getConnection();
            console.log('✓ Task items database connection established successfully');

            // Test table existence
            const [tables] = await connection.query("SHOW TABLES LIKE 'task_items'");
            if (tables.length > 0) {
                console.log('✓ Task items table verified');
            } else {
                console.warn('⚠ Task items table not found - run init-db.js first');
            }

            connection.release();
            return true;
        } catch (error) {
            retries--;
            console.error(`Database connection attempt failed (${3 - retries}/3):`, error.message);
            if (retries === 0) {
                console.error('✗ All database connection attempts failed');
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        }
    }
    return false;
}

// Graceful shutdown handler
async function closeDatabaseConnections() {
    try {
        await taskItemsPool.end();
        console.log('✓ Database connections closed gracefully');
    } catch (error) {
        console.error('Error closing database connections:', error);
    }
}

module.exports = {
    pool: taskItemsPool,
    testConnection: validateDatabaseConnection,
    closeConnections: closeDatabaseConnections
};
