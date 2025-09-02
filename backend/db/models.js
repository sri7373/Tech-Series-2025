// models.js
const mongoose = require('mongoose');

// Product collection
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    carbonEmissions: { type: Number, required: true },
    plasticUsage: { type: Number, required: true },
    points: { type: Number, default: 0 },
    image: { 
        data: Buffer,   // actual binary data
        contentType: String // e.g. 'image/png', 'image/jpeg'
    }
});
  
const Product = mongoose.model('Product', productSchema, 'SuperMarket');

// User collection
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  points: { type: Number, default: 0 },
  receipts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Receipt' }]
});

const User = mongoose.model('User', userSchema);

module.exports = { Product, User };
