const express = require('express');
const { User, validateUser } = require('../db/models');
const router = express.Router();
const userService = require('../services/userService');

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users
router.post('/createUser', async (req, res) => {
  try {
    // Validate request
    const { error } = validateUser(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Check if user exists
    let existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ error: 'User already registered.' });

    // Create user through service
    const user = await userService.createUser(req.body);

    // Generate JWT token using schema method
    const token = user.generateAuthToken();

    // Set the headers
    res.set({
      'Access-Control-Expose-Headers': 'x-auth-token, X-Auth-Token',
      'x-auth-token': token,
    });
    
    return res.status(201).json({ 
      message: 'User created successfully', 
      user,
      token
    });

  } catch (err) {
    return res.status(400).json({ error: 'Failed to create user', details: err.message });
  }
});

module.exports = router;