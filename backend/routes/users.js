const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// GET /api/users

//will define what the router is and the logic.
router.get('/', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


// POST /api/users/createUser
router.post('/createUser', async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create user' });
  }
});

module.exports = router;