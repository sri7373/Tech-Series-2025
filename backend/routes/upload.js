const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { Product } = require('../db/models');

const router = express.Router();


// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Helper function to search and download image from Open Food Facts
const fetchProductImageFromAPI = async (productName) => {
  try {
    console.log('Searching Open Food Facts for:', productName);
    
    // Search for product in Open Food Facts API
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&search_simple=1&action=process&json=1`;
    console.log('Search URL:', searchUrl);
    
    const searchResponse = await axios.get(searchUrl);
    console.log('Search response status:', searchResponse.status);

    const products = searchResponse.data.products;
    console.log('Found products count:', products ? products.length : 0);
    
    if (products && products.length > 0) {
      // Get the first product that has an image
      const productWithImage = products.find(p => p.image_url || p.image_front_url);
      
      if (productWithImage) {
        const imageUrl = productWithImage.image_url || productWithImage.image_front_url;
        console.log('Found image URL:', imageUrl);
        
        // Download the image
        const imageResponse = await axios.get(imageUrl, { 
          responseType: 'arraybuffer',
          timeout: 10000 
        });
        
        console.log('Image download status:', imageResponse.status);
        console.log('Image size:', imageResponse.data.length, 'bytes');
        
        return {
          data: Buffer.from(imageResponse.data),
          contentType: imageResponse.headers['content-type'] || 'image/jpeg'
        };
      } else {
        console.log('No products found with images');
      }
    } else {
      console.log('No products found in search results');
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching image from Open Food Facts:', error.message);
    if (error.response) {
      console.error('API Response status:', error.response.status);
      console.error('API Response data:', error.response.data);
    }
    return null;
  }
};

// POST /api/upload/product-simple - Create product without image (for testing)
router.post('/product-simple', auth, async (req, res) => {
  try {
    const { name, carbonEmissions, plasticUsage, points } = req.body;
    
    console.log('Creating simple product (no image):', { name, carbonEmissions, plasticUsage, points });
    
    // Validate required fields
    if (!name || !carbonEmissions || !plasticUsage) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields: name, carbonEmissions, plasticUsage' 
      });
    }

    // Create new product without image
    const newProduct = new Product({
      name: name,
      carbonEmissions: parseFloat(carbonEmissions),
      plasticUsage: parseFloat(plasticUsage),
      points: points ? parseInt(points) : 0
      // No image field
    });

    console.log('Saving simple product to database...');
    
    // Save to database
    const savedProduct = await newProduct.save();
    
    console.log('Simple product saved successfully:', savedProduct._id);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: savedProduct._id,
        name: savedProduct.name,
        carbonEmissions: savedProduct.carbonEmissions,
        plasticUsage: savedProduct.plasticUsage,
        points: savedProduct.points,
        hasImage: false
      }
    });

  } catch (error) {
    console.error('Simple product creation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create simple product',
      details: error.message 
    });
  }
});

// POST /api/upload/product-auto - Create product with auto-fetched image
router.post('/product-auto', auth, async (req, res) => {
  try {
    const { name, carbonEmissions, plasticUsage, points } = req.body;
    
    console.log('Received product data:', { name, carbonEmissions, plasticUsage, points });
    
    // Validate required fields
    if (!name || !carbonEmissions || !plasticUsage) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields: name, carbonEmissions, plasticUsage' 
      });
    }

    console.log('Fetching image for product:', name);
    
    // Try to fetch image from Open Food Facts API
    const imageData = await fetchProductImageFromAPI(name);
    
    console.log('Image fetch result:', imageData ? 'Image found' : 'No image found');
    
    // Create new product
    const newProduct = new Product({
      name: name,
      carbonEmissions: parseFloat(carbonEmissions),
      plasticUsage: parseFloat(plasticUsage),
      points: points ? parseInt(points) : 0,
      image: imageData || undefined // Only add image if we found one
    });

    console.log('Saving product to database...');
    
    // Save to database
    const savedProduct = await newProduct.save();
    
    console.log('Product saved successfully:', savedProduct._id);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: savedProduct._id,
        name: savedProduct.name,
        carbonEmissions: savedProduct.carbonEmissions,
        plasticUsage: savedProduct.plasticUsage,
        points: savedProduct.points,
        hasImage: !!imageData
      }
    });

  } catch (error) {
    console.error('Product auto-upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message 
    });
  }
});

// POST /api/upload - Simple image upload
router.post('/', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ filename: req.file.filename, path: `/uploads/${req.file.filename}` });
});

// POST /api/upload/product - Upload product with image
router.post('/product', upload.single('image'), async (req, res) => {
  try {
    const { name, carbonEmissions, plasticUsage, points } = req.body;
    
    // Validate required fields
    if (!name || !carbonEmissions || !plasticUsage) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, carbonEmissions, plasticUsage' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Read the uploaded file
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    
    // Create new product
    const newProduct = new Product({
      name: name,
      carbonEmissions: parseFloat(carbonEmissions),
      plasticUsage: parseFloat(plasticUsage),
      points: points ? parseInt(points) : 0,
      image: {
        data: imageData,
        contentType: req.file.mimetype
      }
    });

    // Save to database
    const savedProduct = await newProduct.save();
    
    // Clean up - delete the uploaded file since we stored it in DB
    fs.unlinkSync(imagePath);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: savedProduct._id,
        name: savedProduct.name,
        carbonEmissions: savedProduct.carbonEmissions,
        plasticUsage: savedProduct.plasticUsage,
        points: savedProduct.points
      }
    });

  } catch (error) {
    console.error('Product upload error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// GET /api/upload/product/:id/image - Get product image
router.get('/product/:id/image', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product || !product.image || !product.image.data) {
      return res.status(404).json({ error: 'Product image not found' });
    }

    res.set('Content-Type', product.image.contentType);
    res.send(product.image.data);
    
  } catch (error) {
    console.error('Image retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve image' });
  }
});

// GET /api/upload/products - Get all products with image URLs
router.get('/products', auth, async (req, res) => {
  try {
    const products = await Product.find({});
    
    const productsWithImageUrls = products.map(product => ({
      id: product._id,
      name: product.name,
      carbonEmissions: product.carbonEmissions,
      plasticUsage: product.plasticUsage,
      points: product.points,
      imageUrl: product.image && product.image.data 
        ? `http://localhost:3000/api/upload/product/${product._id}/image`
        : null
    }));

    res.json({
      products: productsWithImageUrls,
      total: productsWithImageUrls.length
    });
    
  } catch (error) {
    console.error('Products retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

module.exports = router;