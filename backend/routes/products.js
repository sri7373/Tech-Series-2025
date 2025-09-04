const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToS3 } = require('../services/s3Service');
const productService = require('../services/productService');
const Quagga = require('@ericblade/quagga2');
const sharp = require('sharp');

const fs = require('fs');
const path = require('path');
const os = require('os');

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


//create product
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


const preprocessImage = async (imageBuffer) => {
  return await sharp(imageBuffer)
    .greyscale()
    .normalize()
    .sharpen()
    .toBuffer();
};


// ...existing code...

// Add Multer middleware to scan-barcode route
router.post('/scan-barcode', upload.single('image'), async (req, res) => {
  let imageBuffer;
  let tempPath; 
  let filename = `barcode_${Date.now()}.jpg`;

  // Check if Multer file upload (mobile)
  if (req.file && req.file.buffer) {
    imageBuffer = await preprocessImage(req.file.buffer);
    tempPath = path.join(os.tmpdir(), `${Date.now()}-${req.file.originalname}`);
    fs.writeFileSync(tempPath, imageBuffer);
  } else if (req.body.image && req.body.image.startsWith('data:image')) {
    // Handle base64 upload (web)
    const matches = req.body.image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid base64 string' });
    }
    const base64Data = matches[2];
    imageBuffer = Buffer.from(base64Data, 'base64');
    imageBuffer = await preprocessImage(imageBuffer);
    tempPath = path.join(os.tmpdir(), filename);
    fs.writeFileSync(tempPath, imageBuffer);
  } else {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    Quagga.decodeSingle({
      src: tempPath,
      numOfWorkers: 0,
      inputStream: { size: 800 },
      decoder: {
        readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader']
      }
    }, async (result) => {
      fs.unlinkSync(tempPath); // Clean up temp file

      if (!result || !result.codeResult) {
        return res.status(404).json({ error: 'Barcode not found in image' });
      }
      const barcode = result.codeResult.code;
      console.log('Detected barcode:', barcode);

      const product = await productService.findOne({ barcode });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        barcode,
        product: {
          name: product.name,
          carbonEmissions: product.carbonEmissions,
          plasticUsage: product.plasticUsage,
          points: product.points,
          price: product.price,
          category: product.category,
          sustainabilityScore: product.sustainabilityScore,
          barcode: product.barcode,
          imageUrl: product.imageUrl
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// ...existing code...
module.exports = router;

