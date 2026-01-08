const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customerEmail: { type: String, required: true, trim: true },
    items: [
      {
        id: Number,
        name: String,
        price: Number,
        qty: Number,
        total: Number
      }
    ],
    subtotal: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountedAmount: { type: Number, default: 0 },
    gst: { type: Number, required: true },
    finalTotal: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
