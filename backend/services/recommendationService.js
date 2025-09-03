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
    'beverages': ['cola', 'soda', 'juice', 'drink', 'water', 'beer', 'wine'],
    'snacks': ['chips', 'cookie', 'biscuit', 'cracker', 'nuts', 'candy'],
    'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
    'personal_care': ['shampoo', 'soap', 'toothpaste', 'deodorant', 'lotion'],
    'cleaning': ['detergent', 'cleaner', 'soap', 'bleach', 'polish'],
    'food': ['bread', 'pasta', 'rice', 'cereal', 'flour', 'sauce'],
    'frozen': ['pizza', 'ice cream', 'frozen', 'vegetables'],
    'meat': ['chicken', 'beef', 'pork', 'fish', 'turkey'],
    'packaging': ['bottle', 'container', 'bag', 'wrapper']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
};

// Get sustainable alternatives for a product
const getSustainableAlternatives = async (productId, limit = 3) => {
  try {
    // Get the original product
    const originalProduct = await Product.findById(productId);
    if (!originalProduct) {
      throw new Error('Product not found');
    }
    
    const originalScore = calculateSustainabilityScore(originalProduct);
    const productCategory = getProductCategory(originalProduct.name);
    
    console.log(`Finding alternatives for "${originalProduct.name}" (category: ${productCategory})`);
    console.log(`Original sustainability score: ${originalScore.toFixed(2)}`);
    
    // Find products in same category with better sustainability scores
    const allProducts = await Product.find({ _id: { $ne: productId } });
    
    const alternatives = allProducts
      .filter(product => {
        // Filter by category
        const candidateCategory = getProductCategory(product.name);
        const sameCategory = candidateCategory === productCategory;
        
        // Calculate sustainability score
        const candidateScore = calculateSustainabilityScore(product);
        const isBetter = candidateScore > originalScore; // Higher score = more sustainable
        
        return sameCategory && isBetter;
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
      .sort((a, b) => b.sustainabilityScore - a.sustainabilityScore) // Best first (highest score)
      .slice(0, limit);
    
    return {
      originalProduct: {
        ...originalProduct.toObject(),
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
