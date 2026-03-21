// controllers/paymentController.js — Cash on Delivery only
const Order = require("../models/Order");

// POST /api/v1/payment/confirm-cod
// Called by frontend after placing a COD order to mark it confirmed
exports.confirmCOD = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId)
      return res.status(400).json({ message: "orderId is required" });

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentMethod: "cod", paymentStatus: "pending", status: "confirmed" },
      { new: true }
    );

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json({ message: "COD order confirmed", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};