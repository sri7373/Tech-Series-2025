const express = require('express');
const router = express.Router();
const { User } = require('../db/models');

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
      .select('username email points neighbourhood')
      .sort({ points: -1 });

    const usersWithRank = users.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));
    
    res.json(usersWithRank);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/leaderboard/neighbourhood/:neighbourhood
router.get('/neighbourhood/:neighbourhood', async (req, res) => {
  try {
    const { neighbourhood } = req.params;
    
    const users = await User.find({ neighbourhood })
      .select('username email points neighbourhood')
      .sort({ points: -1 });

    const usersWithRank = users.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));
    
    res.json(usersWithRank);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch neighbourhood leaderboard' });
  }
});

router.get('/ranks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('points neighbourhood');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const nationalRank = await User.countDocuments({
      points: { $gt: user.points }
    }) + 1;

    const neighbourhoodRank = await User.countDocuments({
      neighbourhood: user.neighbourhood,
      points: { $gt: user.points }
    }) + 1;

    res.json({
      nationalRank,
      neighbourhoodRank,
      points: user.points
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate ranks' });
  }
});

module.exports = router;