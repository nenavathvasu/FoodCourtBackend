const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerEmail:    { type: String, required: true, trim: true, lowercase: true },
    items: [
      {
        id:    Number,
        name:  String,
        price: Number,
        qty:   Number,
        total: Number,
      },
    ],
    subtotal:         { type: Number, required: true },
    discountPercent:  { type: Number, default: 0 },
    discountedAmount: { type: Number, default: 0 },
    gst:              { type: Number, required: true },
    finalTotal:       { type: Number, required: true },

    // Payment — COD only
    paymentMethod:  { type: String, enum: ["cod"], default: "cod" },
    paymentStatus:  { type: String, enum: ["pending", "paid"], default: "pending" },

    // Order status
    status: {
      type:    String,
      enum:    ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
    },

    // Delivery address
    deliveryAddress: {
      name:    { type: String, default: "" },
      phone:   { type: String, default: "" },
      address: { type: String, default: "" },
      city:    { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Fast per-user queries
orderSchema.index({ customerEmail: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);