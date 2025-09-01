const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');

// Connect to DB
const db = new Database('mydb.sqlite');

// POST /api/auth/register
router.post('/register', (req, res) => {
    const { name, email } = req.body;

    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Insert new user
    const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    const result = stmt.run(name, email);

    res.json({ success: true, message: 'User registered', user: { id: result.lastInsertRowid, name, email } });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (user) {
        res.json({ success: true, message: 'Login successful', user });
    } else {
        res.status(401).json({ success: false, message: 'User not found' });
    }
});

module.exports = router;
