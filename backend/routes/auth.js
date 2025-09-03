const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { User } = require('../db/models');
const router = express.Router();
const auth = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    // Validate request
    const { error } = validateUser(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Check if user exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) return res.status(400).json({ error: 'Invalid email or password.' });

    // Validate password
    const validPassword = await bcrypt.compare(req.body.password, existingUser.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    // Generate JWT token using schema method
    const token = existingUser.generateAuthToken();

    return res.status(200).json({ 
      message: 'Login successful',
      token
    });

  } catch (err) {
    res.status(400).json({ error: 'Login failed', details: err.message });
  }
});

function validateUser(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  });

  return schema.validate(req);
}

module.exports = router;