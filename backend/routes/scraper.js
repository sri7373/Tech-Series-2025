const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { scrapeFairPriceBestSellers } = require('../services/scraperService');

// POST /api/scraper/fairprice - Trigger FairPrice scraping (admin only)
router.post('/fairprice', [auth, admin], async (req, res) => {
  try {
    console.log('Admin triggered FairPrice scraping...');
    
    // Run scraping asynchronously (don't block the response)
    scrapeFairPriceBestSellers()
      .then(result => {
        console.log('Scraping completed with result:', result);
      })
      .catch(error => {
        console.error('Scraping failed:', error);
      });
    
    // Respond immediately since scraping takes time
    res.json({ 
      message: 'FairPrice scraping started in background. Check server logs for progress.' 
    });
    
  } catch (error) {
    console.error('Error triggering scraper:', error);
    res.status(500).json({ error: 'Failed to start scraping' });
  }
});

// GET /api/scraper/status - Check scraping status (optional)
router.get('/status', [auth, admin], (req, res) => {
  // You could implement status tracking here
  res.json({ status: 'Scraper is ready to use' });
});

module.exports = router;