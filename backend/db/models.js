// models.js
const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

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
  
const Product = mongoose.model('Product', productSchema, 'SuperMarket');


// User collection
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    minlength: 5,
    maxlength: 50, 
    unique: true 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 255
  },
  password: { 
    type: String, 
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  isAdmin: { type: Boolean, default: false },
  points: { type: Number, default: 0 },
  monthlyRank: { type: Number, default: 0 },
  neighbourhood: { type: String, default: '' },
  neighbourhoodRank: { type: Number, default: 0 },
  lastMonthlyReset: { type: Date, default: Date.now },
  claimedMonthlyReward: [{
    month: { type: String },
    rewards: [{
      type: { type: String, enum: ['500 points', 'national_top5', 'neighbourhood_top3']},
      amount: { type: Number },
      claimed: { type: Boolean, default: false}
    }]
  }],
  vouchers: [{
    code: String,
    discount: Number, // percentage discount
    amount: Number, // fixed amount discount
    expires: Date,
    used: { type: Boolean, default: false },
    type: { type: String, enum: ['regular', 'monthly_reward'], default: 'regular' }
  }]

});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, process.env.JWT_PRIVATE_KEY);
  return token;
} 

const User = mongoose.model('User', userSchema, 'Users');

const blacklistedTokenSchema = new mongoose.Schema({
  token: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 86400 // Automatically remove after 24h
  }});

const BlacklistedToken = mongoose.model('BlacklistedToken', blacklistedTokenSchema, 'BlacklistedTokens');

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    points: Joi.number().default(0),
    neighbourhood: Joi.string().allow('').optional()
  });

  return schema.validate(user);
}

function validateUserUpdate(user) {
  const schema = Joi.object({
    username: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email()
  });
  return schema.validate(user);
}

// ...existing code...

const receiptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  points: { type: Number, required: true },
  carbonEmissions: { type: Number, required: true },
  plasticUsage: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const Receipt = mongoose.model('Receipt', receiptSchema, 'Receipts');

// ...existing code...

module.exports = { Product, User, BlacklistedToken, Receipt, validateUser, validateUserUpdate };

