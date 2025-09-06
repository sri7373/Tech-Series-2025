const mongoose = require('mongoose');
const { Product } = require('../db/models');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/techseries2025', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const checkExistingProducts = async () => {
  try {
    console.log('Checking existing products in database...\n');
    
    const products = await Product.find({});
    
    if (products.length === 0) {
      console.log('❌ No products found in database!');
      console.log('You need to create some products first using your upload system or the test script.');
      return;
    }

    console.log(`📦 Found ${products.length} products:`);
    console.log('=====================================\n');
    
    products.forEach((product, index) => {
      // Calculate sustainability score for display
      const carbonScore = Math.max(0, 100 - (product.carbonEmissions || 0) * 0.5);
      const plasticScore = Math.max(0, 100 - (product.plasticUsage || 0) * 2);
      const sustainabilityScore = Math.round(carbonScore * 0.6 + plasticScore * 0.4);
      
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Carbon: ${product.carbonEmissions || 0} kg CO2`);
      console.log(`   Plastic: ${product.plasticUsage || 0} g`);
      console.log(`   Sustainability Score: ${sustainabilityScore}/100`);
      console.log(`   Category: ${getCategory(product.name)}`);
      console.log('');
    });

    // Group by category and find potential alternatives
    const categories = {};
    products.forEach(product => {
      const category = getCategory(product.name);
      if (!categories[category]) categories[category] = [];
      
      const carbonScore = Math.max(0, 100 - (product.carbonEmissions || 0) * 0.5);
      const plasticScore = Math.max(0, 100 - (product.plasticUsage || 0) * 2);
      const sustainabilityScore = Math.round(carbonScore * 0.6 + plasticScore * 0.4);
      
      categories[category].push({
        ...product.toObject(),
        sustainabilityScore
      });
    });

    console.log('🎯 PRODUCTS WITH GUARANTEED ALTERNATIVES:');
    console.log('==========================================\n');

    let foundAlternatives = false;

    Object.keys(categories).forEach(category => {
      const categoryProducts = categories[category];
      if (categoryProducts.length > 1) {
        // Sort by sustainability score (lowest first - these need alternatives)
        categoryProducts.sort((a, b) => a.sustainabilityScore - b.sustainabilityScore);
        
        const worstProduct = categoryProducts[0];
        const alternatives = categoryProducts.slice(1).filter(p => 
          p.sustainabilityScore > worstProduct.sustainabilityScore
        );

        if (alternatives.length > 0) {
          foundAlternatives = true;
          console.log(`📱 Category: ${category.toUpperCase()}`);
          console.log(`   Worst Product: ${worstProduct.name}`);
          console.log(`   ID: ${worstProduct._id} ⭐ USE THIS ID FOR TESTING`);
          console.log(`   Score: ${worstProduct.sustainabilityScore}/100`);
          console.log(`   Will find ${alternatives.length} alternative(s):`);
          alternatives.forEach(alt => {
            console.log(`     - ${alt.name} (Score: ${alt.sustainabilityScore}/100)`);
          });
          console.log('');
        }
      }
    });

    if (!foundAlternatives) {
      console.log('❌ No products with alternatives found!');
      console.log('All products are in different categories or have similar scores.');
      console.log('Run the test script to create products with guaranteed alternatives.');
    }

  } catch (error) {
    console.error('Error checking products:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Simple category detection (same as in recommendationService)
function getCategory(productName) {
  const name = productName.toLowerCase();
  if (name.includes('cola') || name.includes('pepsi') || name.includes('juice') || 
      name.includes('tea') || name.includes('coffee') || name.includes('water') ||
      name.includes('drink') || name.includes('soda')) {
    return 'beverages';
  }
  if (name.includes('chips') || name.includes('nuts') || name.includes('bar') ||
      name.includes('snack') || name.includes('cookie') || name.includes('cracker')) {
    return 'snacks';
  }
  if (name.includes('shampoo') || name.includes('soap') || name.includes('cream') ||
      name.includes('lotion') || name.includes('toothpaste')) {
    return 'personal care';
  }
  return 'other';
}

checkExistingProducts();
