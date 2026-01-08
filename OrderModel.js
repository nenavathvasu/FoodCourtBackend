const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerEmail: { type: String, required: true },
  items: { type: Array, required: true },
  subtotal: Number,
  discountPercent: Number,
  discountedAmount: Number,
  gst: Number,
  finalTotal: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
