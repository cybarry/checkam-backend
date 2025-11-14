// verify.js
const { Pool } = require('pg');
require('dotenv').config();

// Use the same .env variables as db.js
// (We'll use the single DATABASE_URL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false 
    }
});

async function verifyData() {
    console.log("Connecting to Render database to verify data...");
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT * FROM products");
        
        console.log("✅ Data verification complete! Here is your 'Trap' data:");
        
        // This will print a beautiful table in your console
        console.table(res.rows); 
        
    } catch (err) {
        console.error("❌ Error verifying data:", err.message);
    } finally {
        client.release();
        pool.end();
        console.log("Database connection closed.");
    }
}

verifyData();