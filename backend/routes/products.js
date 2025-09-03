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

// POST /api/products (with image upload)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, carbonEmissions, plasticUsage, points } = req.body;
    const image = req.file
      ? { data: req.file.buffer, contentType: req.file.mimetype }
      : undefined;

    const productData = { name, carbonEmissions, plasticUsage, points, image };
    const product = await productService.createProduct(productData);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product' });
  }
});

module.exports = router;