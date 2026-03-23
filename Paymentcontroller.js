// paymentController.js  ← file MUST be named exactly this
// ✅ FIX: import matches your actual filename "orderSchema.js" not "Order.js"
const Order = require("./Order");

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