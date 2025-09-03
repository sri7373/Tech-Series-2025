const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // multer config
const { extractItems } = require("../services/mindeeService");
const { matchItemsAndCalculatePoints } = require("../services/matchService");
// const { Product } = require("../db/models");

// POST /api/receipts/scan
router.post("/scan", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const ocrItems = await extractItems(req.file.path); // mindeeService
    console.log('the items are ' + ocrItems);

    const { matched, totalPoints } = await matchItemsAndCalculatePoints(ocrItems); // matchService
    console.log(matched)
    console.log(totalPoints)

    res.json({ items: matched, totalPoints });
  } catch (err) {
    console.error("Receipt processing error:", err);
    res.status(500).json({ error: "Failed to process receipt" });
    // next(err);
  }
});

module.exports = router;
