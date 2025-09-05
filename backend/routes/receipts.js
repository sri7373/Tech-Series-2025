const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // multer config
const { extractItems } = require("../services/mindeeService");
const { matchItemsAndCalculatePoints } = require("../services/matchService");
// const { Product } = require("../db/models");

// POST /api/receipts/scan

const fs = require('fs');
const path = require('path');
const os = require('os');

router.post("/scan", async (req, res, next) => {
  try {
    let imagePath;
    let tempPath;
    let cleanup = false;

    if (req.body.image && req.body.image.startsWith('data:image')) {
      // Handle base64 upload (web)
      const matches = req.body.image.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Invalid base64 string' });
      }
      const base64Data = matches[2];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      tempPath = path.join(os.tmpdir(), `receipt_${Date.now()}.jpg`);
      fs.writeFileSync(tempPath, imageBuffer);
      imagePath = tempPath;
      cleanup = true;
    } else if (req.file && req.file.path) {
      imagePath = req.file.path;
    } else {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const ocrItems = await extractItems(imagePath); // mindeeService
    if (cleanup && tempPath) {
      fs.unlinkSync(tempPath);
    }

    const { matched, totalPoints, totalCarbonEmissions, totalPlasticUsage } = await matchItemsAndCalculatePoints(ocrItems); // matchService
    console.log(matched)
    console.log(totalPoints)

    // Filter items: only those with defined matchedProduct and productPoints
    const filteredItems = Array.isArray(matched)
      ? matched.filter(item => item && item.matchedProduct && item.productPoints !== undefined && item.productPoints !== null)
      : [];

    // Map to frontend format, include imageUrl, carbonEmissions, plasticUsage, productId
    const itemsForFrontend = filteredItems.map(item => ({
      name: item.matchedProduct,
      points: item.productPoints,
      qty: item.qty,
      description: item.description,
      pointsEarned: item.pointsEarned,
      carbonEmissions: item.carbonEmissions,
      plasticUsage: item.plasticUsage,
      productId: item.productId,
      imageUrl: item.product && item.product.imageUrl ? item.product.imageUrl : null
    }));

    res.json({
      items: itemsForFrontend,
      totalPoints,
      carbonEmissions: totalCarbonEmissions,
      plasticUsage: totalPlasticUsage
    });
  } catch (err) {
    console.error("Receipt processing error:", err);
    res.status(500).json({ error: "Failed to process receipt" });
    // next(err);
  }
});

const { Receipt } = require('../db/models');

// POST /api/receipts
router.post('/', async (req, res) => {
  console.log('Receipt payload:', req.body);

  try {
    const { userId, items, points, carbonEmissions, plasticUsage, uploadedAt } = req.body;
    // Defensive: products should be array of ObjectIds, fallback to empty array if not present
    const products = Array.isArray(items)
      ? items.map(item => item.productId).filter(id => !!id)
      : [];
    // Log for debugging
    console.log('products:', products);

    const receipt = new Receipt({
      user: userId,
      products,
      points,
      carbonEmissions,
      plasticUsage,
      uploadedAt: uploadedAt || new Date()
    });
    await receipt.save();
    res.status(201).json(receipt);
  } catch (err) {
    console.error('Error saving receipt:', err); // log error details
    res.status(500).json({ error: 'Failed to save receipt', details: err.message });
  }
});

// GET /api/receipts/history/:userId
router.get('/history/:userId', async (req, res) => {
  const receipts = await Receipt.find({ user: req.params.userId }).sort({ uploadedAt: 1 });
  res.send(receipts);
});

module.exports = router;
