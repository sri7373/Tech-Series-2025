const express = require('express');
const router = express.Router();
const { User } = require('../db/models');
const auth = require('../middleware/auth');
const crypto = require('crypto');

// Points needed for a voucher
const POINTS_REQUIRED = 100;

// Check if user can claim a voucher
router.get('/check', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      canClaim: user.points >= POINTS_REQUIRED,
      currentPoints: user.points,
      requiredPoints: POINTS_REQUIRED
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check voucher eligibility' });
  }
});

// Claim a voucher
router.post('/claim', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.points < POINTS_REQUIRED) {
      return res.status(400).json({ 
        error: `Not enough points. You have ${user.points}, need ${POINTS_REQUIRED}` 
      });
    }

    // Generate voucher code
    const voucherCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const newVoucher = {
      code: voucherCode,
      discount: 10, // 10% discount
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      used: false
    };

    // Add voucher to user and deduct points
    user.vouchers.push(newVoucher);
    user.points -= POINTS_REQUIRED;
    await user.save();

    res.json({
      success: true,
      voucher: newVoucher,
      remainingPoints: user.points,
      message: 'Voucher claimed successfully!'
    });
  } catch (err) {
    console.error('Voucher claim error:', err);
    res.status(500).json({ error: 'Failed to claim voucher' });
  }
});

// Get user's vouchers
router.get('/my-vouchers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('vouchers');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user.vouchers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vouchers' });
  }
});

module.exports = router;