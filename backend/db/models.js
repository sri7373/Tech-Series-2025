// models.js
const mongoose = require('mongoose');

// Product collection
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    carbonEmissions: { type: Number, required: true },
    plasticUsage: { type: Number, required: true },
    points: { type: Number, default: 0 },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    sustainabilityScore: { type: Number, required: true }, // 0-100
    barcode: { type: String, unique: true }, 
    imageUrl: { type: String } // store S3 URL here
    
});
  
const Product = mongoose.model('Product', productSchema);

// User collection
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  points: { type: Number, default: 0 },
  monthlyRank: { type: Number, default: 0 },
  neighbourhoodRank: { type: Number, default: 0 },
  neighbourhood: { type: String },

});

const User = mongoose.model('User', userSchema);

module.exports = { Product, User };

