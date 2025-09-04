// recommendationService.js
const { Product } = require('../db/models');

// Calculate sustainability score (higher = better)
const calculateSustainabilityScore = (product) => {
  // Simply use the points field as the sustainability score
  return product.points || 0;
};

// Extract product category from name using keywords
const getProductCategory = (productName) => {
  const name = productName.toLowerCase();
  
  const categories = {
    'beverages': ['cola', 'soda', 'juice', 'drink', 'water', 'beer', 'wine', 'beverage'],
    'snacks': ['chips', 'cookie', 'biscuit', 'cracker', 'nuts', 'candy', 'snack'],
    'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy'],
    'personal_care': ['shampoo', 'soap', 'toothpaste', 'deodorant', 'lotion', 'sunscreen', 'sunblock', 'sun protection', 'spf', 'cosmetic', 'skincare', 'body', 'face'],
    'cleaning': ['detergent', 'cleaner', 'soap', 'bleach', 'polish', 'wash'],
    'food': ['bread', 'pasta', 'rice', 'cereal', 'flour', 'sauce', 'food'],
    'frozen': ['pizza', 'ice cream', 'frozen', 'vegetables'],
    'meat': ['chicken', 'beef', 'pork', 'fish', 'turkey', 'meat'],
    'packaging': ['bottle', 'container', 'bag', 'wrapper', 'plate', 'cup'],
    'health': ['vitamin', 'supplement', 'medicine', 'tablet', 'pill'],
    'household': ['paper', 'tissue', 'towel', 'napkin']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category;
    }
  }

  return 'general';
};

// Enhanced function to check if two products are similar/related
const areProductsSimilar = (product1Name, product2Name) => {
  const name1 = product1Name.toLowerCase();
  const name2 = product2Name.toLowerCase();
  
  // Define product-specific keywords that make products truly similar
  const productKeywords = {
    'sunscreen': ['sunscreen', 'sunblock', 'sun protection', 'spf', 'sun lotion', 'uv protection'],
    'toothpaste': ['toothpaste', 'dental paste', 'tooth gel', 'dental gel', 'teeth cleaning'],
    'shampoo': ['shampoo', 'hair wash', 'scalp cleanser', 'hair cleanser'],
    'soap': ['soap', 'body wash', 'shower gel', 'body cleanser', 'bar soap'],
    'lotion': ['lotion', 'moisturizer', 'body cream', 'skin cream', 'hydrating cream'],
    'deodorant': ['deodorant', 'antiperspirant', 'body spray', 'deo'],
    'detergent': ['detergent', 'laundry soap', 'washing powder', 'fabric cleaner'],
    'milk': ['milk', 'dairy milk', 'whole milk', 'skim milk', 'low-fat milk'],
    'juice': ['juice', 'fruit juice', 'drink', 'beverage'],
    'chips': ['chips', 'crisps', 'potato chips', 'snack'],
    'bread': ['bread', 'loaf', 'baguette', 'roll'],
    'pasta': ['pasta', 'spaghetti', 'noodles', 'macaroni'],
    'cereal': ['cereal', 'breakfast cereal', 'muesli', 'granola'],
    'yogurt': ['yogurt', 'yoghurt', 'greek yogurt', 'probiotic'],
    'cheese': ['cheese', 'cheddar', 'mozzarella', 'dairy cheese'],
    'butter': ['butter', 'margarine', 'spread']
  };
  
  // Find which product category the first product belongs to
  let category1 = null;
  for (const [category, keywords] of Object.entries(productKeywords)) {
    if (keywords.some(keyword => name1.includes(keyword))) {
      category1 = category;
      break;
    }
  }
  
  // If we found a category, check if the second product belongs to the same category
  if (category1 && productKeywords[category1]) {
    return productKeywords[category1].some(keyword => name2.includes(keyword));
  }
  
  // Fallback: check for common significant words (but more restrictive)
  const words1 = name1.split(/\s+/).filter(word => word.length > 3);
  const words2 = name2.split(/\s+/).filter(word => word.length > 3);
  
  // Need at least 2 common words for generic matching
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length >= 2;
};// Get sustainable alternatives for a product (overloaded for both ID and product object)
const getSustainableAlternatives = async (productIdOrObject, limit = 5) => {
  try {
    let originalProduct;
    
    // Handle both product ID and product object
    if (typeof productIdOrObject === 'string' || productIdOrObject._id) {
      // If it's an ID or has an _id, fetch from database
      const id = typeof productIdOrObject === 'string' ? productIdOrObject : productIdOrObject._id;
      originalProduct = await Product.findById(id);
      if (!originalProduct) {
        throw new Error('Product not found');
      }
    } else {
      // It's already a product object from barcode scanning
      originalProduct = productIdOrObject;
    }
    
    const originalScore = calculateSustainabilityScore(originalProduct);
    const productCategory = getProductCategory(originalProduct.name);
    
    console.log(`Finding alternatives for "${originalProduct.name}" (category: ${productCategory})`);
    console.log(`Original sustainability score: ${originalScore}`);
    
    // Get ALL products for comprehensive matching
    const excludeId = originalProduct._id ? originalProduct._id.toString() : null;
    const allProducts = await Product.find(excludeId ? { _id: { $ne: excludeId } } : {});
    console.log(`Total products in database: ${allProducts.length}`);
    
    const alternatives = allProducts
      .filter(product => {
        // Skip if it's the same product
        if (excludeId && product._id.toString() === excludeId) {
          return false;
        }
        if (product.name.toLowerCase() === originalProduct.name.toLowerCase()) {
          return false;
        }
        
        // Must have better sustainability score
        const candidateScore = calculateSustainabilityScore(product);
        const isBetter = candidateScore > originalScore;
        
        if (!isBetter) {
          console.log(`Skipping ${product.name}: score ${candidateScore} not > ${originalScore}`);
          return false;
        }
        
        // STRICT SIMILARITY CHECK - must be actually related products
        const isSimilar = areProductsSimilar(originalProduct.name, product.name);
        
        if (!isSimilar) {
          console.log(`Skipping ${product.name}: not similar to ${originalProduct.name}`);
          return false;
        }
        
        console.log(`✅ Found similar alternative: "${product.name}" (score: ${candidateScore} > ${originalScore})`);
        return true;
      })
      .map(product => ({
        ...product.toObject(),
        sustainabilityScore: calculateSustainabilityScore(product),
        improvement: {
          carbonReduction: originalProduct.carbonEmissions - product.carbonEmissions,
          plasticReduction: originalProduct.plasticUsage - product.plasticUsage,
          scoreImprovement: calculateSustainabilityScore(product) - originalScore
        }
      }))
      .sort((a, b) => {
        // Sort by sustainability score (highest first) - since we already filtered for similar products
        return b.sustainabilityScore - a.sustainabilityScore;
      })
      .slice(0, limit);
    
    console.log(`Found ${alternatives.length} truly similar sustainable alternatives:`);
    alternatives.forEach((alt, index) => {
      console.log(`${index + 1}. "${alt.name}" (score: ${alt.sustainabilityScore}, improvement: +${alt.improvement.scoreImprovement})`);
    });
    
    if (alternatives.length === 0) {
      console.log(`⚠️  No similar sustainable alternatives found for "${originalProduct.name}". This could mean:`);
      console.log(`   - No products in database are similar to this product type`);
      console.log(`   - No similar products have higher sustainability scores`);
      console.log(`   - The product might need more similar products added to database`);
    }
    
    return {
      originalProduct: {
        ...originalProduct.toObject ? originalProduct.toObject() : originalProduct,
        sustainabilityScore: originalScore
      },
      alternatives: alternatives,
      category: productCategory,
      totalAlternatives: alternatives.length
    };
    
  } catch (error) {
    console.error('Error getting sustainable alternatives:', error);
    throw error;
  }
};

// Get recommendations based on user's recent purchases/interests
const getPersonalizedRecommendations = async (userId, limit = 5) => {
  try {
    // This could be enhanced with user purchase history
    // For now, we'll recommend the most sustainable products overall
    
    const allProducts = await Product.find({});
    
    const recommendations = allProducts
      .map(product => ({
        ...product.toObject(),
        sustainabilityScore: calculateSustainabilityScore(product),
        category: getProductCategory(product.name)
      }))
      .sort((a, b) => b.sustainabilityScore - a.sustainabilityScore) // Best first (highest score)
      .slice(0, limit);
    
    return {
      recommendations: recommendations,
      totalProducts: allProducts.length
    };
    
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    throw error;
  }
};

module.exports = {
  getSustainableAlternatives,
  getPersonalizedRecommendations,
  calculateSustainabilityScore,
  getProductCategory
};
