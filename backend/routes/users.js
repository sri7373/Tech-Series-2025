const express = require('express');
const { User, validateUser, validateUserUpdate } = require('../db/models');
const router = express.Router();
const userService = require('../services/userService');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET /api/users 
// Get all users (admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id
// Get profile information by ID (self or admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const authenticatedUserId = req.user._id.toString();
    
    // Allow access if: requesting own data OR user is admin
    if (requestedUserId !== authenticatedUserId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(requestedUserId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  } 
});

// POST /api/users
// Register a new user
router.post('/', async (req, res) => {
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
      token: token
    });

  } catch (err) {
    return res.status(400).json({ error: 'Failed to create user', details: err.message });
  }
});

// PUT /api/users/:id
// Update username and email (self or admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const authenticatedUserId = req.user._id.toString();
    
    // Allow access if: requesting own data OR user is admin
    if (requestedUserId !== authenticatedUserId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = validateUserUpdate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updatedUser = await User.findByIdAndUpdate(
      requestedUserId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id
// Delete a user (admin only, cannot delete self)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(403).json({ error: 'Cannot delete your own admin account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// PUT /api/users/:id/points
router.put('/:id/points', auth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const authenticatedUserId = req.user._id.toString();
    // Only allow updating own points or admin
    if (requestedUserId !== authenticatedUserId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { points } = req.body;
    if (typeof points !== 'number' || points < 0) {
      return res.status(400).json({ error: 'Points must be a non-negative number' });
    }
    const user = await User.findByIdAndUpdate(requestedUserId, { points }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Points updated', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update points' });
  }
});

module.exports = router;