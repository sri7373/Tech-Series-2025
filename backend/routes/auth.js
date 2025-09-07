const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { User, BlacklistedToken } = require('../db/models');
const router = express.Router();
const auth = require('../middleware/auth');

// POST /api/auth/login
// User login
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

    // Send more user information in response
    return res.status(200)
      .header('x-auth-token', token)
      .json({
        message: 'Login successful',
        token,
        user: {
          _id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
          points: existingUser.points,
          neighbourhood: existingUser.neighbourhood
        }
      });

  } catch (err) {
    console.error('Login error details:', {
      message: err.message,
      stack: err.stack,
      body: req.body
    });

    res.status(400).json({ error: 'Login failed', details: err.message });
  }
});

// POST /api/auth/logout
// User logout
router.post('/logout', auth, async (req, res) => {
  try {
    // Token blacklisting
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    // Check if token is already blacklisted
    const existingToken = await BlacklistedToken.findOne({ token });
    if (existingToken) {
      return res.status(200).json({ message: 'Already logged out' });
    }

    // Add token to blacklist
    await BlacklistedToken.create({ token });
    
    return res.status(200).json({ 
      message: 'Logged out successfully' 
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ 
      error: 'Logout failed', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

router.get('/verify-token', auth, async (req, res) => {
  try {
    // If we reach here, the auth middleware has validated the token
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      valid: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

module.exports = router;