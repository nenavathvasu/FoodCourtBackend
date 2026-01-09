require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ✅ CORS — MUST be before routes */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://food-court-git-main-nenavath-vasus-projects.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* Middlewares */
app.use(express.json());

/* Import Routers */
const userRoutes = require("./userRouter");
const menuRoutes = require("./menuRouter");
const orderRoutes = require("./orderRouter");
const authMiddleware = require("./authMiddleware");

/* ✅ Routes */
app.use("/api/v1/user", userRoutes);               // 🔓 PUBLIC (login, register)
app.use("/api/v1/menu", menuRoutes);               // 🔓 PUBLIC
app.use("/api/v1/orders", authMiddleware, orderRoutes); // 🔐 PROTECTED

/* Default route */
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Backend running successfully" });
});

/* MongoDB */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

/* Server */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});

module.exports = app;
