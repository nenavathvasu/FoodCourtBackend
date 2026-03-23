const crypto   = require("crypto");
const Razorpay = require("razorpay");
const Payment  = require("../models/Payment");
const Order    = require("../models/Order");
const { PAYMENT_STATUS, ORDER_STATUS } = require("../config/constants");

// Lazy-initialize Razorpay (only if keys are present)
let razorpay = null;
const getRazorpay = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured");
    }
    razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// ── CONFIRM COD ───────────────────────────────────────────────────
exports.confirmCOD = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (!order.userId.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    order.paymentMethod = "cod";
    order.paymentStatus = PAYMENT_STATUS.PENDING;
    order.status        = ORDER_STATUS.CONFIRMED;
    await order.save();

    res.status(200).json({ success: true, message: "COD order confirmed", data: order });
  } catch (err) {
    next(err);
  }
};

// ── CREATE RAZORPAY ORDER ─────────────────────────────────────────
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (!order.userId.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const rp = getRazorpay();
    const rpOrder = await rp.orders.create({
      amount:   Math.round(order.finalTotal * 100),  // Razorpay uses paise
      currency: "INR",
      receipt:  `receipt_${orderId}`,
    });

    await Payment.create({
      orderId:         order._id,
      userId:          req.user._id,
      razorpayOrderId: rpOrder.id,
      amount:          order.finalTotal,
    });

    order.razorpayOrderId = rpOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      razorpayOrderId: rpOrder.id,
      amount:          rpOrder.amount,
      currency:        rpOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

// ── VERIFY RAZORPAY PAYMENT ───────────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify signature (HMAC SHA256)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, razorpaySignature, status: PAYMENT_STATUS.PAID },
      { new: true }
    );

    if (!payment) return res.status(404).json({ success: false, message: "Payment record not found" });

    // Update order
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus:     PAYMENT_STATUS.PAID,
      razorpayPaymentId: razorpayPaymentId,
      status:            ORDER_STATUS.CONFIRMED,
    });

    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (err) {
    next(err);
  }
};