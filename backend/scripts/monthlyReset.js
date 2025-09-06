const mongoose = require('mongoose');
const { User } = require('../db/models');
require('dotenv').config();

// Reset monthly points at the start of each month
const resetMonthlyPoints = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database');
    
    await User.updateMany({}, {
      $set: {
        points: 0,
        lastMonthlyReset: new Date()
      }
    });
    console.log('Monthly points reset completed');
    
    // Close connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Monthly reset error:', err);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  resetMonthlyPoints();
}

module.exports = resetMonthlyPoints;