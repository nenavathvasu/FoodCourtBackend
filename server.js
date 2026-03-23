require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const app = express();

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://food-court-teal.vercel.app",
  "https://food-court-git-main-nenavath-vasus-projects.vercel.app",
  "https://food-court-exqa47iiu-nenavath-vasus-projects.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    methods:        ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials:    true,
  })
);

// ✅ FIX: "*" works on Express 4 + 5 and all Node versions
app.options(/.*/, cors());

app.use(express.json());

/* ── Routes ── */
const userRoutes    = require("./userRouter");
const menuRoutes    = require("./menuRouter");
const orderRoutes   = require("./orderRouter");
const paymentRoutes = require("./paymentRoutes"); // ✅ filename must be paymentRoutes.js

app.use("/api/v1/user",    userRoutes);
app.use("/api/v1/menu",    menuRoutes);
app.use("/api/v1/orders",  orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "FoodCourt backend running ✅" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error" });
});

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server → http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB failed:", err.message);
    process.exit(1);
  });