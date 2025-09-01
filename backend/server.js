const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;


// Connect to database (creates file if not exists)
const db = new Database("mydb.sqlite");

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT
  )
`).run();

// Middleware
app.use(cors());
app.use(express.json()); // let backend read JSON body

// ROUTES (API endpoints)
app.get("/", (req, res) => {
  res.send("Hello from backend!");
});

app.get("/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();  
    res.json(users);
});

// Add a new user
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
  const result = stmt.run(name, email);
  res.json({ id: result.lastInsertRowid, name, email });
});

// Simple login check (fake)
app.post("/login", (req, res) => {
  const { email } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (user) {
    res.json({ success: true, message: "Login successful", user });
  } else {
    res.status(401).json({ success: false, message: "User not found" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
