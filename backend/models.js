// models.js
const mongoose = require('mongoose');

// Product collection
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    carbonEmissions: { type: Number, required: true },
    plasticUsage: { type: Number, required: true },
    points: { type: Number, default: 0 }
});
  

const Product = mongoose.model('Product', productSchema);

// User collection
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  points: { type: Number, default: 0 },
  receipts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Receipt' }]
});

const User = mongoose.model('User', userSchema);

module.exports = { Product, User };
