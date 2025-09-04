 const { User, validateUser } = require('../db/models');
 const bcrypt = require('bcrypt');

async function getAllUsers() {
  return await User.find();
}

async function createUser(userData) {
  // generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  // create new user with hashed password
const user = new User({
  username: userData.username,
  email: userData.email,
  password: hashedPassword,
  isAdmin: userData.isAdmin || false,
  points: userData.points ?? 0,
});
  // Save and return the user
  return await user.save();
}


async function getTopUsers(limit = 10) {
  return await User.find().sort({ points: -1 }).limit(limit);
}


module.exports = { getAllUsers, createUser, getTopUsers };
