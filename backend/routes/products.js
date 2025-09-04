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




router.post('/scan-barcode', upload.single('image'), async (req, res) => {

    const processedBuffer = await preprocessImage(req.file.buffer);
    const tempPath = path.join(os.tmpdir(), `${Date.now()}-${req.file.originalname}`);
    fs.writeFileSync(tempPath, processedBuffer);

  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    // Use Quagga to decode barcode from image buffer 
    Quagga.decodeSingle({
      src: tempPath,
      numOfWorkers: 0,
      inputStream: {
        size: 800  // restrict input-size for faster processing
      },
      decoder: {
        readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader'] // add more if needed
      }
    }, async (result) => {
      fs.unlinkSync(tempPath); // Clean up temp file

      if (!result || !result.codeResult) {
        return res.status(404).json({ error: 'Barcode not found in image' });
      }
      const barcode = result.codeResult.code;
      console.log('Detected barcode:', barcode); // <-- Add this line      

      // Find product by barcode
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

module.exports = router;

