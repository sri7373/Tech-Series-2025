const express = require('express');
const router = express.Router();
const userService = require('../services/userService');



// FETCH LEADERBOARD /api/leaderboard
router.get('/', async (req, res) => {
  try {
    const users = await userService.getTopUsers(10);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;