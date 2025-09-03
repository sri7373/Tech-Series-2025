const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // multer config
const { extractItems } = require("../services/mindeeService");
const { matchItemsAndCalculatePoints } = require("../services/matchService");
// const { Product } = require("../db/models");

// POST /api/receipts/scan
router.post("/scan", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const ocrItems = await extractItems(req.file.path); // mindeeService
    const { matched, totalPoints } = await matchItemsAndCalculatePoints(ocrItems); // matchService

    res.json({ items: matched, totalPoints });
  } catch (err) {
    console.error("Receipt processing error:", err);
    res.status(500).json({ error: "Failed to process receipt" });
    // next(err);
  }
});

module.exports = router;
