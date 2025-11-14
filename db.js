// This imports the "pg" (node-postgres) library
const { Pool } = require('pg');

// from .env file
require('dotenv').config();

// This creates the connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for most cloud DBs
    }
});

module.exports = {
    // We export a "query" function to use in our API
    query: (text, params) => pool.query(text, params),
};

