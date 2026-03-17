// ✅ FIX: Linux is case-sensitive — must match the actual filename exactly
// If your file is named "orderSchema.js" use that exact casing
const Order = require("./OrderSchema"); // ✅ lowercase 'o' and 's'

/* ── PLACE ORDER ─────────────────────────────────── */
exports.placeOrder = async (req, res) => {
  try {
    const { _id, ...orderData } = req.body;

    if (orderData.customerEmail) {
      orderData.customerEmail = orderData.customerEmail.toLowerCase().trim();
    }

    if (orderData.paymentMethod === "cod") {
      orderData.paymentStatus = "pending";
    } else if (orderData.paymentId) {
      orderData.paymentStatus = "paid";
    }

    const savedOrder = await Order.create(orderData);

    res.status(201).json({
      message: "Order placed successfully",
      result:  savedOrder,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ── FETCH ORDERS ────────────────────────────────── */
exports.fetchOrders = async (req, res) => {
  try {
    const filter = {};

    if (req.query.email) {
      filter.customerEmail = req.query.email.toLowerCase().trim();
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ── GET SINGLE ORDER ────────────────────────────── */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ── UPDATE ORDER STATUS ─────────────────────────── */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status)        update.status        = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const updated = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order updated", order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};