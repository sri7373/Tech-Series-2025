 
const { Product } = require('../db/models');

async function getAllProducts() {
  return await Product.find();
}

async function createProduct(productData) {
  const product = new Product(productData);
  return await product.save();
}

module.exports = { getAllProducts, createProduct };