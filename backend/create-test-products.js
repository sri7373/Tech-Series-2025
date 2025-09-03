const mongoose = require('mongoose');
const { Product } = require('./db/models');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/techseries2025', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createTestProducts = async () => {
  try {
    console.log('Creating test products for recommendation testing...');

    // Clear existing products (optional - comment out if you want to keep existing ones)
    // await Product.deleteMany({});
    // console.log('Cleared existing products');

    const testProducts = [
      // Beverages - High carbon, different plastic usage
      {
        name: 'Coca Cola 500ml',
        carbonEmissions: 150, // High carbon
        plasticUsage: 25,     // Medium plastic
        points: 10,
        category: 'beverages'
      },
      {
        name: 'Pepsi 500ml', 
        carbonEmissions: 145, // High carbon
        plasticUsage: 24,     // Medium plastic
        points: 12,
        category: 'beverages'
      },
      {
        name: 'Organic Green Tea',
        carbonEmissions: 30,  // Low carbon - BETTER ALTERNATIVE
        plasticUsage: 5,      // Low plastic
        points: 50,
        category: 'beverages'
      },
      {
        name: 'Fresh Orange Juice',
        carbonEmissions: 45,  // Low carbon - BETTER ALTERNATIVE
        plasticUsage: 8,      // Low plastic
        points: 40,
        category: 'beverages'
      },

      // Snacks - Various sustainability levels
      {
        name: 'Potato Chips 200g',
        carbonEmissions: 280, // Very high carbon
        plasticUsage: 15,     // Medium plastic
        points: 5,
        category: 'snacks'
      },
      {
        name: 'Organic Nuts Mix',
        carbonEmissions: 80,  // Low carbon - BETTER ALTERNATIVE
        plasticUsage: 3,      // Very low plastic
        points: 60,
        category: 'snacks'
      },
      {
        name: 'Granola Bar',
        carbonEmissions: 95,  // Low carbon - BETTER ALTERNATIVE
        plasticUsage: 4,      // Low plastic
        points: 45,
        category: 'snacks'
      },

      // Personal Care - Different sustainability scores
      {
        name: 'Regular Shampoo 400ml',
        carbonEmissions: 120, // High carbon
        plasticUsage: 35,     // High plastic
        points: 15,
        category: 'personal care'
      },
      {
        name: 'Eco Shampoo Bar',
        carbonEmissions: 25,  // Very low carbon - BETTER ALTERNATIVE
        plasticUsage: 2,      // Very low plastic (minimal packaging)
        points: 80,
        category: 'personal care'
      }
    ];

    const savedProducts = [];
    
    for (const productData of testProducts) {
      const product = new Product(productData);
      const saved = await product.save();
      savedProducts.push(saved);
      console.log(`✅ Created: ${saved.name} (ID: ${saved._id})`);
    }

    console.log('\n🎯 TEST PRODUCT IDs FOR RECOMMENDATIONS:');
    console.log('==========================================');
    
    // Find products that should have alternatives
    const cokeProduct = savedProducts.find(p => p.name.includes('Coca Cola'));
    const chipsProduct = savedProducts.find(p => p.name.includes('Potato Chips'));
    const shampooProduct = savedProducts.find(p => p.name.includes('Regular Shampoo'));

    if (cokeProduct) {
      console.log(`🥤 Coca Cola ID: ${cokeProduct._id}`);
      console.log('   Should find alternatives: Green Tea, Orange Juice');
    }
    
    if (chipsProduct) {
      console.log(`🍟 Potato Chips ID: ${chipsProduct._id}`);
      console.log('   Should find alternatives: Organic Nuts, Granola Bar');
    }
    
    if (shampooProduct) {
      console.log(`🧴 Regular Shampoo ID: ${shampooProduct._id}`);
      console.log('   Should find alternative: Eco Shampoo Bar');
    }

    console.log('\n📋 COPY THESE IDs FOR TESTING:');
    console.log('===============================');
    console.log(`Coca Cola: ${cokeProduct?._id || 'Not found'}`);
    console.log(`Potato Chips: ${chipsProduct?._id || 'Not found'}`);
    console.log(`Regular Shampoo: ${shampooProduct?._id || 'Not found'}`);

    console.log('\n✨ Test products created successfully!');
    console.log('You can now use these IDs in your recommendation testing.');

  } catch (error) {
    console.error('Error creating test products:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestProducts();
