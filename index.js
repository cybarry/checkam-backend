require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import our db.js file

const app = express();
const PORT = process.env.PORT || 3001; // Use 3001 for local

// --- Middleware ---
app.use(cors()); 
app.use(express.json()); 

// --- API Endpoints ---

/**
 * API ENDPOINT 1: THE "BRAIN"
 */
app.post('/api/verify', async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ status: "error", message: "No code provided." });
    }
    try {
        const productResult = await db.query("SELECT * FROM products WHERE code = $1", [code]);
        
        // 1. "Dumb Fake"
        if (productResult.rows.length === 0) {
            return res.json({ status: "not_found", message: "Warning: Batch code not found!" });
        }
        
        const item = productResult.rows[0];
        
        // 2. "Smarter Faker"
        if (item.report_count > 2) {
            return res.json({ 
                status: "reported", 
                product_name: item.product_name,
                message: `CRITICAL: This batch was reported ${item.report_count} times!` 
            });
        }
        
        // 3. "Smart Fake" (Replay Attack)
        if (item.status === 'USED') {
            return res.json({ 
                status: "replay_attack", 
                product_name: item.product_name,
                message: "Warning: This PIN was already used!" 
            });
        }
        
        // 4. "Genuine"
        if (item.status === 'UNUSED') {
            await db.query("UPDATE products SET status = 'USED', last_scanned = NOW() WHERE code = $1", [code]);
            return res.json({ 
                status: "verified", 
                product_name: item.product_name,
                points: 10 
            });
        }
    } catch (err) {
        console.error("🔥 AN ERROR OCCURRED:", err); 
        res.status(500).json({ status: "error", message: "Server error." });
    }
});

/**
 * API ENDPOINT 2: THE "CROWDSOURCED HUNTER"
 */
app.post('/api/report', async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ status: "error", message: "No code provided." });
    }
    try {
        await db.query("UPDATE products SET report_count = report_count + 1 WHERE code = $1", [code]);
        res.json({ success: true, message: "Report received." });
    } catch (err) {
        console.error("🔥 AN ERROR OCCURRED:", err); 
        res.status(500).json({ status: "error", message: "Server error." });
    }
});


// --- THIS IS THE PART YOU ARE MISSING ---
// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`✅ CheckAm API is live and listening on port ${PORT}`);
});