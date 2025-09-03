const express = require('express');
const router = express.Router();
const multer = require('multer');
const productService = require('../services/productService');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});


// POST /api/products
router.post('/', async (req, res) => {
  try {
    const productData = { ...req.body };

    // Define the keys that should be parsed as numbers.
    const numericFields = ['carbonEmissions', 'plasticUsage', 'points', 'price', 'sustainabilityScore', 'barcode'];

    // Loop through the fields and convert their values from strings to numbers.
    // This is more efficient than listing each field individually.
    for (const key of numericFields) {
      if (productData[key] !== undefined && productData[key] !== null) {
        const parsedValue = Number(productData[key]);
        if (isNaN(parsedValue)) {
          // Send a specific error if any numeric field is not a valid number
          return res.status(400).json({ error: `Invalid data for field: ${key}. Expected a number.` });
        }
        productData[key] = parsedValue;
      }
    }

    // The imageUrl from the request body will be captured by the spread operator.
    // No specific handling for an image file is needed.
    // const image = req.file
    //   ? { data: req.file.buffer, contentType: req.file.mimetype }
    //   : undefined;

    const product = await productService.createProduct(productData);
    res.json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ error: 'Failed to create product' });
  }
});

module.exports = router;