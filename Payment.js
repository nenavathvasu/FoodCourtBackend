const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    customerEmail:     { type: String, required: true, trim: true, lowercase: true },
    razorpayOrderId:   { type: String, required: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    amount:            { type: Number, required: true },
    currency:          { type: String, default: "INR" },
    status: {
      type:    String,
      enum:    ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);