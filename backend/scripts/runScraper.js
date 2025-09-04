// scripts/runScraper.js
require('dotenv').config();
const mongoose = require('mongoose');
const { scrapeFairPriceBestSellers } = require('../services/scraperService');

async function runScraper() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Run the scraper
    const result = await scrapeFairPriceBestSellers();
    console.log('Scraping result:', result);
    
  } catch (error) {
    console.error('Error running scraper:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  runScraper();
}

module.exports = runScraper;