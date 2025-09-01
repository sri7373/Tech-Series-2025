 
// backend/routes/users.js
const express = require('express');
const router = express.Router();

// In-memory users (same as in server.js)
const users = [
  { id: 1, username: 'john', email: 'john@test.com', password: 'password123' },
  { id: 2, username: 'jane', email: 'jane@test.com', password: 'password123' }
];

// GET /api/users - Get all users
router.get('/', (req, res) => {
  // Return users without passwords
  const safeUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email
  }));
  
  res.json({ 
    success: true, 
    data: safeUsers 
  });
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  // Return user without password
  res.json({ 
    success: true, 
    data: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});

// PUT /api/users/:id - Update user profile
router.put('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { username, email } = req.body;
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  // Check if username/email already taken by another user
  const existingUser = users.find(u => 
    u.id !== userId && (u.username === username || u.email === email)
  );
  
  if (existingUser) {
    return res.status(409).json({ 
      success: false, 
      message: 'Username or email already taken' 
    });
  }

  // Update user
  if (username) users[userIndex].username = username;
  if (email) users[userIndex].email = email;

  res.json({ 
    success: true, 
    data: {
      id: users[userIndex].id,
      username: users[userIndex].username,
      email: users[userIndex].email
    },
    message: 'Profile updated successfully'
  });
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  // Remove user
  users.splice(userIndex, 1);

  res.json({ 
    success: true, 
    message: 'User deleted successfully' 
  });
});

// GET /api/users/:id/posts - Get posts by specific user
router.get('/:id/posts', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  // This would filter posts by user in a real app
  // For now, just return success (you'd need access to posts array)
  res.json({ 
    success: true, 
    data: [],
    message: `Posts for ${user.username}` 
  });
});

module.exports = router;