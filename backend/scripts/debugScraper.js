// scripts/debugScraper.js
require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function debugScraper() {
  try {
    const url = 'https://www.fairprice.com.sg/product-listing?hasStock=1&loadMoreType=SEEALL&tag=best-sellers&title=Best%20Sellers&loc=ProductWidget-BestSellers&pageType=Home';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Save the HTML for inspection
    fs.writeFileSync('debug_page.html', response.data);
    console.log('Saved page HTML to debug_page.html');
    
    // Look for product containers
    const productContainers = $('div.product-container');
    console.log(`Found ${productContainers.length} product-container divs`);
    
    // Look for any elements with product in class or data-testid
    const productElements = $('[class*="product"], [data-testid*="product"]');
    console.log(`Found ${productElements.length} product-related elements`);
    
    // Sample some elements to see their structure
    productElements.slice(0, 5).each((index, element) => {
      console.log(`\n=== Element ${index + 1} ===`);
      console.log('Classes:', $(element).attr('class'));
      console.log('Data-testid:', $(element).attr('data-testid'));
      console.log('HTML snippet:', $(element).html()?.substring(0, 200) + '...');
    });
    
    // Look for images
    const images = $('img');
    console.log(`\nFound ${images.length} images`);
    images.slice(0, 5).each((index, element) => {
      console.log(`Image ${index + 1}:`, $(element).attr('src') || $(element).attr('data-src'));
    });
    
  } catch (error) {
    console.error('Debug error:', error.message);
  }
}

debugScraper();