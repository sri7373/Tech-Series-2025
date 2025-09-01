 
// backend/routes/auth.js
const express = require('express');
const router = express.Router();

// In-memory users (same as in server.js)
const users = [
  { id: 1, username: 'john', email: 'john@test.com', password: 'password123' },
  { id: 2, username: 'jane', email: 'jane@test.com', password: 'password123' }
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validation
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password required' 
    });
  }

  // Find user
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }

  // Return user data (without password)
  res.json({ 
    success: true, 
    data: { 
      id: user.id, 
      username: user.username, 
      email: user.email 
    },
    message: 'Login successful'
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields required' 
    });
  }

  // Check if user exists
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(409).json({ 
      success: false, 
      message: 'User already exists' 
    });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password // In real app, hash this!
  };

  users.push(newUser);

  res.status(201).json({ 
    success: true, 
    data: { 
      id: newUser.id, 
      username: newUser.username, 
      email: newUser.email 
    },
    message: 'User created successfully'
  });
});

// POST /api/auth/logout (simple response)
router.post('/logout', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

module.exports = router;