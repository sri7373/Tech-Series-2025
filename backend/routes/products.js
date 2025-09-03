const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToS3 } = require('../services/s3Service');
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



router.post('/', upload.single('image'), async (req, res) => {
  try {

    let imageUrl;
    if (req.file) {
      imageUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    } 
    const productData = { ...req.body, imageUrl: imageUrl };
    const product = await productService.createProduct(productData);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create product' });
  }
});

module.exports = router;

