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
    console.log('the items are ' + ocrItems);

    const { matched, totalPoints } = await matchItemsAndCalculatePoints(ocrItems); // matchService
    console.log(matched)
    console.log(totalPoints)

    // Filter items: only those with defined matchedProduct and productPoints
    const filteredItems = Array.isArray(matched)
      ? matched.filter(item => item && item.matchedProduct && item.productPoints !== undefined && item.productPoints !== null)
      : [];

        // Map to frontend format, include imageUrl
        const itemsForFrontend = filteredItems.map(item => ({
          name: item.matchedProduct,
          points: item.productPoints,
          qty: item.qty,
          description: item.description,
          pointsEarned: item.pointsEarned,
          imageUrl: item.product && item.product.imageUrl ? item.product.imageUrl : null
        }));

        res.json({ items: itemsForFrontend, totalPoints });
  } catch (err) {
    console.error("Receipt processing error:", err);
    res.status(500).json({ error: "Failed to process receipt" });
    // next(err);
  }
});

module.exports = router;
