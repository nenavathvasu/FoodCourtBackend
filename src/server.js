require("dotenv").config();
const express    = require("express");
const helmet     = require("helmet");
const morgan     = require("morgan");
const cors       = require("cors");
const rateLimit  = require("express-rate-limit");
const connectDB  = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// ── Security headers ──────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  methods:        ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials:    true,
}));
app.options("*", cors());

// ── Rate limiting ─────────────────────────────────────────────────
app.use("/api/v1/auth", rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,
  message: { success: false, message: "Too many requests, please try again later" },
}));

// ── Body parser + logging ─────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Routes ────────────────────────────────────────────────────────
app.use("/api/v1/auth",    require("./routes/authRoutes"));
app.use("/api/v1/menu",    require("./routes/menuRoutes"));
app.use("/api/v1/orders",  require("./routes/orderRoutes"));
app.use("/api/v1/payment", require("./routes/paymentRoutes"));

app.get("/", (req, res) =>
  res.json({ success: true, message: "FoodCourt API running ✅", version: "1.0.0" })
);

// ── Error handling ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV || "development"}]`)
  );
});

module.exports = app;