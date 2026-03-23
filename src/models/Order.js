const mongoose = require("mongoose");
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } = require("../config/constants");

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: Number, required: true },
    name:       { type: String, required: true },
    price:      { type: Number, required: true },
    qty:        { type: Number, required: true, min: 1 },
    total:      { type: Number, required: true },
  },
  { _id: false }   // no separate _id for sub-documents
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    phone:   { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city:    { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // FIX: store userId (ObjectId ref) instead of plain email —
    // userId never changes, email can. Email kept for quick display.
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    customerEmail: {
      type:      String,
      required:  true,
      lowercase: true,
      trim:      true,
    },

    items: {
      type:     [orderItemSchema],
      validate: [(arr) => arr.length > 0, "Order must have at least one item"],
    },

    subtotal:         { type: Number, required: true, min: 0 },
    discountPercent:  { type: Number, default: 0, min: 0, max: 100 },
    discountedAmount: { type: Number, default: 0, min: 0 },
    gst:              { type: Number, required: true, min: 0 },
    finalTotal:       { type: Number, required: true, min: 0 },

    paymentMethod: {
      type:    String,
      enum:    Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.COD,
    },
    paymentStatus: {
      type:    String,
      enum:    Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    razorpayOrderId:   { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },

    status: {
      type:    String,
      enum:    Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
    },

    deliveryAddress: { type: deliveryAddressSchema, required: true },

    // Optional: estimated delivery time set by admin
    estimatedDelivery: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ razorpayOrderId: 1 }, { sparse: true });

module.exports = mongoose.model("Order", orderSchema);