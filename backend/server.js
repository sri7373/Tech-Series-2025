// server.js
const express = require('express');
const connectDB = require('./config');   // <-- your MongoDB connection
const { Product, User } = require('./models'); // <-- your Mongoose models
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

// ================== MongoDB Connection ==================
connectDB();

// ================== Swagger Setup ==================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gamified Catalogue API",
      version: "1.0.0",
      description: "API docs for products and users",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./server.js"], // 👈 very important
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: List of products
 */
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               carbonEmissions:
 *                 type: number
 *               plasticUsage:
 *                 type: string
 *               points:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product created
 */
app.post('/api/products', async (req, res) => {
  const { name, carbonEmissions, plasticUsage, points } = req.body;
  const product = new Product({ name, carbonEmissions, plasticUsage, points });
  await product.save();
  res.json(product);
});

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               carbonEmissions:
 *                 type: number
 *               plasticUsage:
 *                 type: number
 *               points:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product created
 */

app.post('/api/users', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, passwordHash: password, points: 0 });
  await user.save();
  res.json(user);
});

// ================== Start Server ==================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📖 API Docs at http://localhost:${PORT}/docs`);
});
