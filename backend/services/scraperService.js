const axios = require('axios');
const cheerio = require('cheerio');
const { uploadToS3 } = require('./s3Service');
const { Product } = require('../db/models');

async function scrapeFairPriceBestSellers() {
  try {
    console.log('Starting FairPrice scraping...');

    // page to scrape here
    const url = 'https://www.fairprice.com.sg/category/beauty--personal-care';
    
    // Fetch the page
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.fairprice.com.sg/'
      }
    });
    
    const $ = cheerio.load(response.data);
    const products = [];
    
    console.log('Page loaded successfully. Looking for products...');
    
    // Extract product information
    // adjust slice range to set range of products to scrape, e.g. first 20 on page
        // also change MAX_PRODUCTS below
    $('div.product-container').slice(0, 20).each((index, element) => {
      try {
        const $container = $(element);
        
        // Get the product link to find the name
        const productLink = $container.find('a[href^="/product/"]');
        const href = productLink.attr('href');
        

        let name = $container.find('[class*="sc-ab6170a9-1 efyPMT"]').text().trim();

        // If not found with that class, try fallback methods
        if (!name) {
            // Try other selectors or URL extraction as fallback
            if (href) {
                const urlParts = href.split('/');
                if (urlParts.length >= 3) {
                    name = urlParts[2].split('-').slice(0, -1).join(' ');
                    name = name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                }
            }
            // Additional fallback if still not found
            if (!name) {
                name = $container.find('[class*="name"], [data-testid*="name"]').text().trim();
            }
        }
        
        // Extract price
        let priceText = $container.find('[class*="sc-ab6170a9-1 iNLBGt"]').text().trim();
        if (!priceText) {
          // Try to find price in the container text
          const containerText = $container.text();
          const priceMatch = containerText.match(/\$\d+\.?\d*/);
          priceText = priceMatch ? priceMatch[0] : '';
        }
        
        // Extract image URL - handle different image patterns
        let imageUrl = '';
        
        // Method 1: Look for img tags with src
        const imgElements = $container.find('img');
        imgElements.each((i, img) => {
          const src = $(img).attr('src');
          const dataSrc = $(img).attr('data-src');
          
          if (src && src.includes('media.nedigital.sg') && src.includes('_XL')) {
            imageUrl = src;
            return false;
          } else if (dataSrc && dataSrc.includes('media.nedigital.sg') && dataSrc.includes('_XL')) {
            imageUrl = dataSrc;
            return false;
          }
        });
        
        // Method 2: If no good image found, try to construct from product ID
        if (!imageUrl && href) {
          const productId = href.split('-').pop(); // Get the ID from URL
          imageUrl = `https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/${productId}_XL1.jpg`;
        }
        
        // Only process if we have all required data
        if (name && priceText && imageUrl) {
          // Extract numeric price
          const priceMatch = priceText.match(/\d+\.?\d*/);
          const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
          
          if (price > 0) {
            // Generate random environmental data for now
            const carbonEmissions = Math.floor(Math.random() * 500);
            const plasticUsage = Math.floor(Math.random() * 500);
            const sustainabilityScore = calculateSustainabilityScore(carbonEmissions, plasticUsage);
            const points = calculatePoints(sustainabilityScore);
            
            products.push({
              name: name.trim(),
              price,
              carbonEmissions,
              plasticUsage,
              sustainabilityScore,
              points,
              category: 'Groceries',
            //   barcode: 0,
              originalImageUrl: imageUrl
            });
            
            console.log(`Found product: ${name} - $${price} - ${imageUrl}`);
          }
        }
      } catch (error) {
        console.error('Error processing product container:', error);
      }
    });
    
    console.log(`Successfully parsed ${products.length} products`);
    
    let successCount = 0;
    const MAX_PRODUCTS = 20;

    for (const product of products) {
      try {
        if (successCount >= MAX_PRODUCTS) {
            console.log('Reached maximum limit of 20 products. Stopping.');
            break;
        }
        console.log(`Processing: ${product.name}`);
        
        const imageBuffer = await downloadImageWithRetry(product.originalImageUrl, 3);
        
        if (imageBuffer && !isWhiteImage(imageBuffer)) {
          const s3ImageUrl = await uploadToS3(
            imageBuffer, 
            `fairprice-${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.jpg`,
            'image/jpeg'
          );
          
          if (s3ImageUrl) {
            // Check if product already exists
            const existingProduct = await Product.findOne({
              $or: [
                { name: product.name }
              ]
            });
            
            if (!existingProduct) {
              const newProduct = new Product({
                name: product.name,
                price: product.price,
                carbonEmissions: product.carbonEmissions,
                plasticUsage: product.plasticUsage,
                sustainabilityScore: product.sustainabilityScore,
                points: product.points,
                category: product.category,
                barcode: product.barcode,
                imageUrl: s3ImageUrl
              });
              
              await newProduct.save();
              successCount++;
              console.log(`✓ Saved: ${product.name}`);
            } else {
              console.log(`⏩ Skipped (already exists): ${product.name}`);
            }
          } else {
            console.log(`⚠️  Failed to upload image for: ${product.name}`);
          }
        } else {
          console.log(`⚠️  Invalid or white image for: ${product.name}`);
          
          // Try alternative image URL pattern
          const alternativeImageUrl = await findAlternativeImageUrl(product.originalImageUrl);
          if (alternativeImageUrl) {
            console.log(`Trying alternative image URL: ${alternativeImageUrl}`);
            const altImageBuffer = await downloadImageWithRetry(alternativeImageUrl, 2);
            
            if (altImageBuffer && !isWhiteImage(altImageBuffer)) {
              const s3ImageUrl = await uploadToS3(
                altImageBuffer, 
                `fairprice-${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-alt-${Date.now()}.jpg`,
                'image/jpeg'
              );
              
              if (s3ImageUrl) {
                const newProduct = new Product({
                  name: product.name,
                  price: product.price,
                  carbonEmissions: product.carbonEmissions,
                  plasticUsage: product.plasticUsage,
                  sustainabilityScore: product.sustainabilityScore,
                  points: product.points,
                  category: product.category,
                  barcode: product.barcode,
                  imageUrl: s3ImageUrl
                });
                
                await newProduct.save();
                successCount++;
                console.log(`✓ Saved with alternative image: ${product.name}`);
              }
            }
          }
        }
        
        // Add delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`Error processing product ${product.name}:`, error.message);
      }
    }
    
    console.log(`Scraping completed! Successfully processed ${successCount}/${products.length} products`);
    return { success: true, processed: successCount, total: products.length };
    
  } catch (error) {
    console.error('Scraping error:', error.message);
    return { success: false, error: error.message };
  }
}

async function downloadImageWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.fairprice.com.sg/'
        },
        timeout: 10000
      });
      
      const buffer = Buffer.from(response.data);
      
      // Check if image is valid (not white square)
      if (!isWhiteImage(buffer)) {
        return buffer;
      }
      
      console.log(`Attempt ${attempt}: Image appears to be white/empty`);
      
    } catch (error) {
      console.log(`Attempt ${attempt}: Failed to download image: ${error.message}`);
    }
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return null;
}

function isWhiteImage(buffer) {
  // Simple check: if file size is very small, it's probably a white/empty image
  return buffer.length < 5000; // Adjust threshold as needed
}

async function findAlternativeImageUrl(originalUrl) {
  try {
    // Try different image variations
    if (originalUrl.includes('?w=')) {
      // Remove size parameters for higher quality
      return originalUrl.split('?')[0];
    } else if (originalUrl.includes('_XL')) {
      // Try different image sizes
      return originalUrl.replace('_XL', '_L').replace('_XL1', '_L1');
    }
  } catch (error) {
    console.log('Error finding alternative image URL:', error.message);
  }
  return null;
}

function calculateSustainabilityScore(carbonEmissions, plasticUsage) {
  const totalImpact = carbonEmissions + plasticUsage;
  
  // Wide distribution with clear separation between categories
  if (totalImpact < 150) return Math.floor(90 + (Math.random() * 10)); // 90-100
  else if (totalImpact < 300) return Math.floor(75 + (Math.random() * 15)); // 75-89
  else if (totalImpact < 500) return Math.floor(60 + (Math.random() * 15)); // 60-74
  else if (totalImpact < 700) return Math.floor(45 + (Math.random() * 15)); // 45-59
  else if (totalImpact < 900) return Math.floor(30 + (Math.random() * 15)); // 30-44
  else if (totalImpact < 1100) return Math.floor(15 + (Math.random() * 15)); // 15-29
  else return Math.floor(Math.random() * 15); // 0-14
}
function calculatePoints(sustainabilityScore) {
  // Only award points for scores above 50
  return sustainabilityScore > 50 ? sustainabilityScore - 50 : 0;
}

module.exports = { scrapeFairPriceBestSellers };