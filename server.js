require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ✅ CORS — MUST be before routes */
app.use(
  cors({
    origin: [
      "https://food-court-git-main-nenavath-vasus-projects.vercel.app",
       "http://localhost:5173", "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* ✅ Raw body for Razorpay webhook signature verification */
app.use("/api/v1/payment/webhook", express.raw({ type: "application/json" }));

/* JSON body parser for all other routes */
app.use(express.json());

/* Import Routers */
const userRoutes    = require("./userRouter");
const menuRoutes    = require("./menuRouter");
const orderRoutes   = require("./orderRouter");
const paymentRoutes = require("./paymentrouter"); // ✅ was missing

/* Routes */
app.use("/api/v1/user",    userRoutes);
app.use("/api/v1/menu",    menuRoutes);
app.use("/api/v1/orders",  orderRoutes);
app.use("/api/v1/payment", paymentRoutes); // ✅ was missing

/* Default route */
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Backend running successfully" });
});

/* MongoDB */
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

/* Server */
const PORT = process.env.PORT;
if (!PORT) {
  console.error("Error: PORT not defined in .env");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});