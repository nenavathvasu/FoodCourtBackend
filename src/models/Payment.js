const mongoose = require("mongoose");
const { PAYMENT_STATUS } = require("../config/constants");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Order",
      required: true,
    },
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    razorpayOrderId:   { type: String, required: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    amount:   { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type:    String,
      enum:    Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.CREATED,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ razorpayOrderId: 1 }, { unique: true });
paymentSchema.index({ orderId: 1 });

module.exports = mongoose.model("Payment", paymentSchema);