// server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/config');   // MongoDB connection
const config = require('config');   // Environmnent variables
const { Product, User } = require('./db/models'); // Mongoose models
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const axios = require('axios');

const dotenv = require('dotenv');

dotenv.config() 

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;


const app = express();

// Enable CORS for all routes
app.use(cors());

const uploadRouter = require('./routes/upload');
app.use('/api/upload', uploadRouter);
app.use('/uploads', express.static('uploads'));

app.use(express.json());
app.use(cors({
  origin: true,
  exposedHeaders: ['x-auth-token'],
  credentials: true
}));

// JWT Private Key Check
if (!config.get('jwtPrivateKey')) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}

require('dotenv').config();

// ================== MongoDB Connection ==================
connectDB();


// ================== Routes ==================

/**
 * @openapi
 * /:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: API is running
 */
app.get('/', (req, res) => {
  res.send("✅ API is running");
});


//List of routes to be routed 
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const recommendationRoutes = require('./routes/recommendations');

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recommendations', recommendationRoutes);




// ================== Start Server ==================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📖 API Docs at http://localhost:${PORT}/docs`);
});