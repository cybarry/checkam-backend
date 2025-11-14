// setup.js
const { Pool } = require('pg');
require('dotenv').config();

// We create a *new* pool here just for the setup script
// (or you could export the pool from db.js)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// This is the SQL script from before, now as a string
const setupQuery = `
    -- This "resets" your database. Safe to run multiple times.
    DROP TABLE IF EXISTS products;
    DROP TYPE IF EXISTS verification_status;

    -- 1. Create the "status" type
    CREATE TYPE verification_status AS ENUM ('UNUSED', 'USED');

    -- 2. Create the "products" table (Your "Model")
    CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL, 
        product_name TEXT NOT NULL,
        manufacturer TEXT,
        status verification_status DEFAULT 'UNUSED',
        report_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        last_scanned TIMESTAMP
    );

    -- 3. Populate the "Trap" (The Mock Data)
    INSERT INTO products (code, product_name, manufacturer, status, report_count)
    VALUES
        ('BN-REAL-123', 'Indomie Chicken', 'Indofood', 'UNUSED', 0),
        ('PIN-REPLAY-456', 'Coartem Anti-Malarial', 'Pfizer', 'USED', 0),
        ('BATCH-REPORT-789', 'Peak Milk', 'Friesland', 'UNUSED', 3),
        ('FAKE-CODE-000', 'Fake Product', 'Unknown', 'UNUSED', 1),
        ('BN-REAL-ABC', 'Dangote Sugar', 'Dangote', 'UNUSED', 0),
        ('BN-REAL-DEF', 'Coca-Cola', 'Coca-Cola', 'UNUSED', 0),
        ('NEW-REAL-PIN-777', 'Paracetamol', 'GSK', 'UNUSED', 0),
        ('NEW-REPORTED-PIN-888', 'Fanta', 'Coca-Cola', 'UNUSED', 0);
`;

// This async function will run the query
async function setupDatabase() {
    console.log("Connecting to database...");
    const client = await pool.connect();
    try {
        console.log("Running setup script...");
        await client.query(setupQuery);
        console.log("✅ Database setup complete! Your 'Trap' is set.");
    } catch (err) {
        console.error("❌ Error running setup script:", err.message);
    } finally {
        // This is a "best practice" to make sure you close the connection
        client.release();
        console.log("Database connection closed.");
        pool.end(); // Close the pool
    }
}

// Run the function
setupDatabase();