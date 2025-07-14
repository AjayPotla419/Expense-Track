const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config({ path: __dirname + "/.env" }); // ✅ Explicit path to .env inside backend

// Debug logs
console.log("DEBUG: MONGO_URI =", process.env.MONGO_URI);
console.log("DEBUG: __dirname =", __dirname);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/expenses", require("./routes/expenses")); // ✅ Include expenses route

// Serve index.html on root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Show loaded environment
console.log("✅ Loaded MONGO_URI:", process.env.MONGO_URI);

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI is missing from .env file.");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
