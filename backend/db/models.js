// models.js
const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

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
  points: { 
    type: Number, 
    default: 0 
  },
  receipts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Receipt' }]
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
  return token;
}

const User = mongoose.model('User', userSchema, 'Users');

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  });

  return schema.validate(user);
}

module.exports = { Product, User, validateUser };
