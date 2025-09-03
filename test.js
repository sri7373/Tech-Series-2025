// server.js
const express = require('express');
const connectDB = require('./db/config');   // <-- correct path
const { Product, User } = require('./db/models'); // <-- correct path
// ...existing code...
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


//add all your api stuff here
app.get('/', (req, res) => {
  res.send("✅ API is running");
});

//api/createUser


const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// ================== Start Server ==================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📖 API Docs at http://localhost:${PORT}/docs`);
});
