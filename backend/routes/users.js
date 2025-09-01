const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');

const db = new Database('mydb.sqlite');

// GET /api/users → get all users
router.get('/', (req, res) => {
    const users = db.prepare('SELECT * FROM users').all();
    res.json(users);
});

// GET /api/users/:id → get a single user
router.get('/:id', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json(user);
});

// PUT /api/users/:id → update user info
router.put('/:id', (req, res) => {
    const { name, email } = req.body;
    const stmt = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
    const result = stmt.run(name, email, req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({ success: false, message: 'User not found or no changes made' });
    }

    res.json({ success: true, message: 'User updated', user: { id: req.params.id, name, email } });
});

// DELETE /api/users/:id → delete a user
router.delete('/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted' });
});

module.exports = router;
