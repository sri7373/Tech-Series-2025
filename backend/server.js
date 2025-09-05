require('dotenv').config();
console.log("MINDEE_API_KEY =", process.env.MINDEE_API_KEY);
if (!process.env.MINDEE_API_KEY) {
    throw new Error("MINDEE_API_KEY not defined! Check .env and dotenv config.");
}


const express = require('express');
const cors = require('cors');
const connectDB = require('./db/config');   // MongoDB connection
const config = require('config');   // Environmnent variables
// const cors = require('cors');
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: true,
  exposedHeaders: ['x-auth-token'],
  credentials: true
}));

// JWT Private Key Check
if (!process.env.JWT_PRIVATE_KEY) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}

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
const receiptRoutes = require('./routes/receipts');
const uploadRouter = require('./routes/upload');
const authRoutes = require('./routes/auth'); 
const leaderboardRoutes = require('./routes/leaderboard');
const scraperRoutes = require('./routes/scraper');
const voucherRoutes = require('./routes/vouchers');
const monthlyRewardsRoutes = require('./routes/monthly-rewards');


app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRouter);
app.use('/uploads', express.static('uploads'));
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/monthly-rewards', monthlyRewardsRoutes);



// ================== Setup Pug ==================
app.set('view engine', 'pug');
app.set('views', './views');

app.get('/scan-receipt', (req, res) => {
  res.render('scan-receipt');
});

// ================== Start Server ==================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📖 API Docs at http://localhost:${PORT}/docs`);
});