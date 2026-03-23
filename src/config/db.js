const mongoose = require("mongoose");

/**
 * Connects to MongoDB with retry on failure.
 * Call once at app startup — never call per-request.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URL;

  if (!uri) {
    console.error("❌ MONGO_URL is not set in environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected");
  });
};

module.exports = connectDB;