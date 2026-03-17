const express = require("express");
const router  = express.Router();
const auth    = require("./authMiddleWare");
const {
  createOrder,
  verifyPayment,
  webhook,
  getPaymentHistory,
} = require("./Paymentcontroller");

/*
  POST /api/v1/payment/create-order   → create Razorpay order (protected)
  POST /api/v1/payment/verify         → verify payment signature (protected)
  POST /api/v1/payment/webhook        → Razorpay async webhook (public, verified by signature)
  GET  /api/v1/payment/history        → user payment history (protected)
*/

router.post("/create-order", auth, createOrder);
router.post("/verify",       auth, verifyPayment);
router.post("/webhook",           webhook);          // public — Razorpay calls this
router.get("/history",       auth, getPaymentHistory);

module.exports = router;