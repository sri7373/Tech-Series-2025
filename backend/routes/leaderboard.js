const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { User } = require('../db/models');




// FETCH LEADERBOARD /api/leaderboard
// router.get('/', async (req, res) => {
//   try {
//     const users = await userService.getTopUsers(10);
//     res.json(users);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch leaderboard' });
//   }
// });
// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
      .select('username email points neighbourhood')
      .sort({ points: -1 }); // Sort by points descending
    
    // Add rank to each user object
    const usersWithRank = users.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));
    
    res.json(usersWithRank);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;