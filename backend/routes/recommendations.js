// routes/recommendations.js
const express = require('express');
const { 
  getSustainableAlternatives, 
  getPersonalizedRecommendations,
  calculateSustainabilityScore 
} = require('../services/recommendationService');
const { Product } = require('../db/models');

const router = express.Router();

// GET /api/recommendations/alternatives/:productId
router.get('/alternatives/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 3;
    
    const alternatives = await getSustainableAlternatives(productId, limit);
    
    res.json({
      success: true,
      original: alternatives.originalProduct,
      alternatives: alternatives.alternatives,
      category: alternatives.category,
      totalAlternatives: alternatives.totalAlternatives
    });
    
  } catch (error) {
    console.error('Error getting alternatives:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/recommendations/personalized
router.get('/personalized', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const userId = req.query.userId; // Optional for future user-specific recommendations
    
    const recommendations = await getPersonalizedRecommendations(userId, limit);
    
    res.json({
      success: true,
      recommendations: recommendations.recommendations, // Frontend expects direct access
      total: recommendations.totalProducts
    });
    
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/recommendations/sustainability-scores
router.get('/sustainability-scores', async (req, res) => {
  try {
    const products = await Product.find({});
    
    const productsWithScores = products.map(product => ({
      id: product._id,
      _id: product._id, // Frontend expects _id
      name: product.name,
      carbonEmissions: product.carbonEmissions,
      plasticUsage: product.plasticUsage,
      points: product.points,
      sustainabilityScore: calculateSustainabilityScore(product),
      imageUrl: product.image && product.image.data 
        ? `http://localhost:3000/api/upload/product/${product._id}/image`
        : null
    })).sort((a, b) => b.sustainabilityScore - a.sustainabilityScore); // Sort highest first
    
    res.json({
      success: true,
      products: productsWithScores, // Frontend expects 'products' directly
      total: productsWithScores.length
    });
    
  } catch (error) {
    console.error('Error getting sustainability scores:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/recommendations/compare
router.post('/compare', async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least 2 product IDs to compare'
      });
    }
    
    const products = await Product.find({ _id: { $in: productIds } });
    
    const comparison = products.map(product => ({
      id: product._id,
      _id: product._id, // Frontend expects _id
      name: product.name,
      carbonEmissions: product.carbonEmissions,
      plasticUsage: product.plasticUsage,
      points: product.points,
      sustainabilityScore: calculateSustainabilityScore(product),
      imageUrl: product.image && product.image.data 
        ? `http://localhost:3000/api/upload/product/${product._id}/image`
        : null
    })).sort((a, b) => b.sustainabilityScore - a.sustainabilityScore); // Sort highest first
    
    // Add rankings
    const rankedComparison = comparison.map((product, index) => ({
      ...product,
      sustainabilityRank: index + 1,
      isRecommended: index === 0 // Best sustainability score
    }));
    
    res.json({
      success: true,
      comparison: rankedComparison, // Frontend expects direct access
      mostSustainable: rankedComparison[0],
      totalCompared: rankedComparison.length
    });
    
  } catch (error) {
    console.error('Error comparing products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
