const Fuse = require("fuse.js");
const { Product } = require("../db/models");

/**
 * Normalize text for matching.
 * Uppercases, removes extra spaces, strips sizes (e.g. "6X250ML"), and removes symbols.
 */
function normalize(text = "") {
  return text
    .toUpperCase()
    .replace(/\s+/g, " ")       // collapse whitespace
    .replace(/\d+X\d+\w*/g, "") // remove "6X250ML"
    .replace(/[^A-Z0-9 ]/g, "") // remove punctuation/symbols
    .trim();
}

/**
 * Match OCR items against products in the DB and calculate points.
 * @param {Array} ocrItems - Array of { description: string, quantity: number }
 * @returns {Object} { matched: Array, totalPoints: number }
 */
async function matchItemsAndCalculatePoints(ocrItems) {
  // Load all products from DB
  const products = await Product.find({});

  const normalizedProducts = products.map(p => ({
    ...p.toObject(),
    normalizedName: normalize(p.name)
  }));

  const fuse = new Fuse(normalizedProducts, {
    keys: ["normalizedName"],
    threshold: 0.4, // fuzziness
    distance: 100,
    isCaseSensitive: false,
    ignoreLocation: true,
  });

  let matched = [];
  let totalPoints = 0;

  for (const item of ocrItems) {
    const query = normalize(item.description || "");
    const result = fuse.search(query);

    if (result.length > 0) {
      const bestMatch = result[0].item;
      const qty = item.quantity || 1;
      const pointsEarned = bestMatch.points * qty;
      totalPoints += pointsEarned;

      matched.push({
        description: item.description,   // keep raw OCR description
        qty,
        matchedProduct: bestMatch.name,  // return original DB product name
        productPoints: bestMatch.points,
        pointsEarned,
      });
    } else {
      matched.push({
        description: item.description,
        qty: item.quantity || 1,
        matchedProduct: null,
        pointsEarned: 0,
      });
    }
  }

  return { matched, totalPoints };
}

module.exports = { matchItemsAndCalculatePoints };
