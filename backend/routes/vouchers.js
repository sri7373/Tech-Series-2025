const express = require('express');
const router = express.Router();
const { User } = require('../db/models');
const auth = require('../middleware/auth');

// Points needed for a voucher
const POINTS_REQUIRED = 100;

// Check if user can claim a voucher
router.get('/check', auth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const authenticatedUserId = req.user._id.toString();
    
    // Allow access if: requesting own data OR user is admin
    if (requestedUserId !== authenticatedUserId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.requestedUserId._id);
    const canClaim = user.points >= POINTS_REQUIRED;
    
    res.json({
      canClaim,
      currentPoints: user.points,
      requiredPoints: POINTS_REQUIRED
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Claim a voucher
router.post('/claim', auth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const authenticatedUserId = req.user._id.toString();
    
    // Allow access if: requesting own data OR user is admin
    if (requestedUserId !== authenticatedUserId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.user._id);
    
    if (user.points < POINTS_REQUIRED) {
      return res.status(400).json({ error: 'Not enough points' });
    }
    
    // Generate a simple voucher code
    const voucherCode = 'VOUCHER-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    
    // Create voucher (10% discount, expires in 30 days)
    const newVoucher = {
      code: voucherCode,
      discount: 10,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      used: false
    };
    
    // Add voucher to user and deduct points
    user.vouchers.push(newVoucher);
    user.points -= POINTS_REQUIRED;
    
    await user.save();
    
    res.json({
      success: true,
      voucher: newVoucher,
      remainingPoints: user.points
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's vouchers
router.get('/my-vouchers', auth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const authenticatedUserId = req.user._id.toString();
    
    // Allow access if: requesting own data OR user is admin
    if (requestedUserId !== authenticatedUserId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.user._id);
    res.json(user.vouchers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;