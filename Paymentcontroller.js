require("dotenv").config();
const Razorpay = require("razorpay");
const crypto   = require("crypto");
const Payment  = require("./Payment");       // ✅ same folder
const Order    = require("./OrderSchema");   // ✅ same folder, match exact filename

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ─────────────────────────────────────────────────────────
   POST /api/v1/payment/create-order
───────────────────────────────────────────────────────── */
exports.createOrder = async (req, res) => {
  try {
    const { amount, customerEmail } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Valid amount is required" });

    const options = {
      amount:   Math.round(amount * 100),
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
      notes: { email: customerEmail || "" },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    await Payment.create({
      customerEmail:   customerEmail || "",
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: "INR",
      status:   "created",
    });

    res.status(200).json({
      orderId:  razorpayOrder.id,
      amount:   razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ message: err.message || "Failed to create Razorpay order" });
  }
};

/* ─────────────────────────────────────────────────────────
   POST /api/v1/payment/verify
───────────────────────────────────────────────────────── */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: "All payment fields are required for verification" });

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );
      return res.status(400).json({ success: false, message: "Payment verification failed — invalid signature" });
    }

    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status:            "paid",
      }
    );

    await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { paymentStatus: "paid", paymentId: razorpay_payment_id }
    );

    res.status(200).json({
      success:   true,
      paymentId: razorpay_payment_id,
      message:   "Payment verified successfully",
    });
  } catch (err) {
    console.error("Payment verify error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────
   POST /api/v1/payment/webhook
   ✅ FIX: req.body is a Buffer here (raw body from express.raw())
   server.js must mount this route with express.raw() BEFORE express.json()
───────────────────────────────────────────────────────── */
exports.webhook = (req, res) => {
  try {
    const webhookSecret     = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    const receivedSignature = req.headers["x-razorpay-signature"];

    // ✅ req.body is a Buffer when using express.raw() — convert to string for HMAC
    const rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : JSON.stringify(req.body);

    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody) // ✅ must use raw string, not re-serialised object
        .digest("hex");

      if (expectedSignature !== receivedSignature) {
        return res.status(400).json({ message: "Invalid webhook signature" });
      }
    }

    // ✅ Parse body now that signature is verified
    const parsedBody = JSON.parse(rawBody);
    const { event, payload } = parsedBody;

    if (event === "payment.captured") {
      const paymentId = payload.payment.entity.id;
      const orderId   = payload.payment.entity.order_id;
      console.log(`✅ Webhook: payment.captured — paymentId: ${paymentId}`);
      Payment.findOneAndUpdate({ razorpayOrderId: orderId }, { status: "paid", razorpayPaymentId: paymentId }).exec();
      Order.findOneAndUpdate({ razorpayOrderId: orderId },   { paymentStatus: "paid" }).exec();
    }

    if (event === "payment.failed") {
      const orderId = payload.payment.entity.order_id;
      console.log(`❌ Webhook: payment.failed — orderId: ${orderId}`);
      Payment.findOneAndUpdate({ razorpayOrderId: orderId }, { status: "failed" }).exec();
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────
   GET /api/v1/payment/history?email=user@x.com
───────────────────────────────────────────────────────── */
exports.getPaymentHistory = async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase().trim();
    const filter = email ? { customerEmail: email } : {};
    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};