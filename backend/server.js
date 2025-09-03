require('dotenv').config();
console.log("MINDEE_API_KEY =", process.env.MINDEE_API_KEY);
if (!process.env.MINDEE_API_KEY) {
    throw new Error("MINDEE_API_KEY not defined! Check .env and dotenv config.");
}


const express = require('express');
const connectDB = require('./db/config');   // MongoDB connection
const { Product, User } = require('./db/models'); // Mongoose models
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const axios = require('axios');

const app = express();
app.use(express.json());


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
const receiptRoutes = require("./routes/receipts");

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use("/api/receipts", receiptRoutes);

app.set('view engine', 'pug');
app.set('views', './views');
app.get('/test-scan', (req, res) => res.render('scan-receipt'));


// ================== Start Server ==================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📖 API Docs at http://localhost:${PORT}/docs`);
});