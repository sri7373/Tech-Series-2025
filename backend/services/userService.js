 const { User } = require('../db/models');

async function getAllUsers() {
  return await User.find();
}

async function createUser(userData) {
  const user = new User(userData);
  return await user.save();
}

module.exports = { getAllUsers, createUser };
