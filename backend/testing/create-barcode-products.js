const mongoose = require('mongoose');
const { Product } = require('../db/models');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/techseries2025', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createBarcodedProducts = async () => {
  try {
    console.log('Creating test products with barcodes...');

    const barcodedProducts = [
      // Real barcode from user's image
      {
        name: 'Sunscreen SPF 30',
        barcode: '42397557',
        carbonEmissions: 800,
        plasticUsage: 45,
        points: 65,
        price: 12.99,
        category: 'personal_care',
        imageUrl: 'https://example.com/sunscreen.jpg'
      },
      // Better sustainable alternatives for sunscreen
      {
        name: 'Eco-Friendly Mineral Sunscreen SPF 50',
        barcode: '98765432',
        carbonEmissions: 25,
        plasticUsage: 0,
        points: 95,
        price: 18.99,
        category: 'personal_care',
        imageUrl: 'https://example.com/eco-sunscreen.jpg'
      },
      {
        name: 'Organic Zinc Sunblock SPF 40',
        barcode: '87654321',
        carbonEmissions: 30,
        plasticUsage: 5,
        points: 90,
        price: 16.99,
        category: 'personal_care',
        imageUrl: 'https://example.com/organic-sunscreen.jpg'
      },
      // Other test products
      {
        name: 'Banana Boat Sunscreen SPF 30',
        barcode: '123456789012',
        carbonEmissions: 1200,
        plasticUsage: 60,
        points: 72,
        price: 15.99,
        category: 'personal_care',
        imageUrl: 'https://example.com/banana-boat.jpg'
      },
      {
        name: 'Coppertone Ultra Guard SPF 50',
        barcode: '234567890123', 
        carbonEmissions: 20,
        plasticUsage: 0,
        points: 99,
        price: 18.99,
        category: 'personal_care',
        imageUrl: 'https://example.com/coppertone.jpg'
      }
    ];

    for (const productData of barcodedProducts) {
      // Check if product already exists
      const existingProduct = await Product.findOne({ barcode: productData.barcode });
      if (existingProduct) {
        console.log(`Product with barcode ${productData.barcode} already exists: ${existingProduct.name}`);
        continue;
      }

      const product = new Product(productData);
      await product.save();
      console.log(`Created product: ${product.name} (Barcode: ${product.barcode})`);
    }

    console.log('Finished creating barcoded products!');
    console.log('\nTest barcodes you can use:');
    console.log('- 42397557 (Your Sunscreen - 65 points) ← YOUR BARCODE');
    console.log('- 98765432 (Eco-Friendly Mineral Sunscreen - 95 points) ← BETTER ALTERNATIVE');
    console.log('- 87654321 (Organic Zinc Sunblock - 90 points) ← BETTER ALTERNATIVE');
    console.log('- 123456789012 (Banana Boat Sunscreen - 72 points)');
    console.log('- 234567890123 (Coppertone SPF 50 - 99 points)');

  } catch (error) {
    console.error('Error creating products:', error);
  } finally {
    mongoose.connection.close();
  }
};

createBarcodedProducts();
