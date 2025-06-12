const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeTaskItemsDatabase() {
    let connection;
    try {
        console.log('Initializing enhanced task items database...');

        // First connect without database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        // Create database
        console.log('Creating task items database...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'task_manager'}`);
        console.log('Database created successfully');

        // Use the database
        await connection.query(`USE ${process.env.DB_NAME || 'task_manager'}`);

        // Drop old table if exists to ensure clean migration
        console.log('Preparing database schema...');
        await connection.query(`DROP TABLE IF EXISTS tasks`);

        // Create enhanced task_items table with performance indexes
        console.log('Creating optimized task_items table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS task_items (
                id VARCHAR(36) PRIMARY KEY,
                item_title TEXT NOT NULL,
                assigned_to VARCHAR(255) NOT NULL,
                deadline_text TEXT NOT NULL,
                urgency_level ENUM('P1', 'P2', 'P3', 'P4') NOT NULL DEFAULT 'P3',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_urgency_level (urgency_level),
                INDEX idx_assigned_to (assigned_to),
                INDEX idx_created_at (created_at),
                INDEX idx_updated_at (updated_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Enhanced task_items table created with performance indexes');

        console.log('\nDatabase initialization completed successfully!');
        console.log('✓ Table: task_items (renamed from tasks)');
        console.log('✓ Columns: item_title, assigned_to, deadline_text, urgency_level');
        console.log('✓ Performance indexes added for optimal query speed');
    } catch (error) {
        console.error('\nDatabase initialization failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeTaskItemsDatabase();