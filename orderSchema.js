const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerEmail:   { type: String, required: true, trim: true, lowercase: true },
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

    // Payment info
    paymentMethod: {
      type:    String,
      enum:    ["upi", "card", "netbanking", "wallet", "cod", "online"],
      default: "cod",
    },
    paymentStatus: {
      type:    String,
      enum:    ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentId:      { type: String, default: null }, // Razorpay payment_id
    razorpayOrderId:{ type: String, default: null }, // Razorpay order_id

    // Order status
    status: {
      type:    String,
      enum:    ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
    },

    // Delivery address snapshot
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

// Index for fast per-user queries
orderSchema.index({ customerEmail: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);