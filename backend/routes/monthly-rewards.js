const express = require('express');
const router = express.Router();
const { User } = require('../db/models');
const auth = require('../middleware/auth');
const crypto = require('crypto');

// Check monthly rewards eligibility
router.get('/check', auth, async (req, res) => {
  try {
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
        
    const currentMonth = new Date().toISOString().slice(0, 7); // "2025-01"
    
    // Check if already claimed this month
    const monthlyReward = user.claimedMonthlyRewards ? 
      user.claimedMonthlyRewards.find(r => r.month === currentMonth) : 
      null;
    
    // Calculate ranks
    const nationalRank = await User.countDocuments({
      points: { $gt: user.points }
    }) + 1;

    const neighbourhoodRank = await User.countDocuments({
      neighbourhood: user.neighbourhood,
      points: { $gt: user.points }
    }) + 1;

    const availableRewards = [];
    
    // Check 500 points reward
    if (user.points >= 500) {
      availableRewards.push({
        type: '500_points',
        amount: 10,
        description: '$10 for reaching 500 points',
        eligible: true,
        claimed: false
      });
    }

    // Check national top 5
    if (nationalRank <= 5) {
      const claimed = monthlyReward?.rewards?.find(r => r.type === 'national_top5')?.claimed || false;
      availableRewards.push({
        type: 'national_top5',
        amount: 15,
        description: `$15 for national rank #${nationalRank}`,
        eligible: true,
        claimed
      });
    }

    // Check neighbourhood top 3
    if (neighbourhoodRank <= 3) {
      const claimed = monthlyReward?.rewards?.find(r => r.type === 'neighbourhood_top3')?.claimed || false;
      availableRewards.push({
        type: 'neighbourhood_top3',
        amount: 15,
        description: `$15 for neighbourhood rank #${neighbourhoodRank}`,
        eligible: true,
        claimed
      });
    }

    const totalAmount = availableRewards
      .filter(r => r.eligible && !r.claimed)
      .reduce((sum, r) => sum + r.amount, 0);


    res.json({
      availableRewards,
      totalAmount,
      nationalRank,
      neighbourhoodRank,
      points: user.points,
      currentMonth
    });

  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to check monthly rewards',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Claim monthly rewards
router.post('/claim', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Get eligibility again
    const nationalRank = await User.countDocuments({
      points: { $gt: user.points }
    }) + 1;

    const neighbourhoodRank = await User.countDocuments({
      neighbourhood: user.neighbourhood,
      points: { $gt: user.points }
    }) + 1;

    let monthlyReward = user.claimedMonthlyRewards.find(r => r.month === currentMonth);
    if (!monthlyReward) {
      monthlyReward = { month: currentMonth, rewards: [] };
      user.claimedMonthlyRewards.push(monthlyReward);
    }

    const claimedVouchers = [];
    let totalAmount = 0;

    // Claim 500 points reward - ALWAYS available if user has 500+ points
    if (user.points >= 500) {
      const voucher = {
        code: crypto.randomBytes(4).toString('hex').toUpperCase(),
        amount: 10,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        used: false,
        type: 'monthly_reward'
      };
      user.vouchers.push(voucher);
      claimedVouchers.push(voucher);
      totalAmount += 10;
    }

    // Claim national top 5 reward - Monthly restriction applies
    if (nationalRank <= 5) {
      const existing = monthlyReward.rewards.find(r => r.type === 'national_top5');
      if (!existing?.claimed) {
        const voucher = {
          code: crypto.randomBytes(4).toString('hex').toUpperCase(),
          amount: 15,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          used: false,
          type: 'monthly_reward'
        };
        user.vouchers.push(voucher);
        claimedVouchers.push(voucher);
        totalAmount += 15;

        if (existing) {
          existing.claimed = true;
        } else {
          monthlyReward.rewards.push({
            type: 'national_top5',
            amount: 15,
            claimed: true
          });
        }
      }
    }

    // Claim neighbourhood top 3 reward - Monthly restriction applies
    if (neighbourhoodRank <= 3) {
      const existing = monthlyReward.rewards.find(r => r.type === 'neighbourhood_top3');
      if (!existing?.claimed) {
        const voucher = {
          code: crypto.randomBytes(4).toString('hex').toUpperCase(),
          amount: 15,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          used: false,
          type: 'monthly_reward'
        };
        user.vouchers.push(voucher);
        claimedVouchers.push(voucher);
        totalAmount += 15;

        if (existing) {
          existing.claimed = true;
        } else {
          monthlyReward.rewards.push({
            type: 'neighbourhood_top3',
            amount: 15,
            claimed: true
          });
        }
      }
    }

    await user.save();

    res.json({
      success: true,
      claimedVouchers,
      totalAmount,
      message: `Successfully claimed $${totalAmount} in rewards!`
    });

  } catch (err) {
    console.error('Reward claim error:', err);
    res.status(500).json({ error: 'Failed to claim rewards' });
  }
});

module.exports = router;