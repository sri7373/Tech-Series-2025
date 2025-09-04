// services/matchService.js
const Fuse = require("fuse.js");
const { Product } = require("../db/models");

/**
 * Match OCR items against products in the DB and calculate points.
 * @param {Array} ocrItems - Array of { description: string, quantity: number }
 * @returns {Object} { matched: Array, totalPoints: number }
 */
async function matchItemsAndCalculatePoints(ocrItems) {
  // Load all products from DB
  const products = await Product.find({});
  
  // Fuse.js config: fuzzy match on product "name"
  const fuse = new Fuse(products, {
    keys: ["name"],
    threshold: 0.3, // adjust fuzziness
  });

  let matched = [];
  let totalPoints = 0;

  for (const item of ocrItems) {
    const query = item.description; // Always use description from OCR
    const result = fuse.search(query);

    if (result.length > 0) {
      const bestMatch = result[0].item;
      const qty = item.quantity || 1;
      const pointsEarned = bestMatch.points * qty;
      totalPoints += pointsEarned;

      matched.push({
        description: query,
        qty,
        matchedProduct: bestMatch.name,
        productPoints: bestMatch.points,
        pointsEarned,
      });
    } else {
      matched.push({
        description: query,
        qty: item.quantity || 1,
        matchedProduct: null,
        pointsEarned: 0,
      });
    }
  }

  return { matched, totalPoints };
}

module.exports = { matchItemsAndCalculatePoints };
