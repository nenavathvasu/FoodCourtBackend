const Order = require("../express-demo/OrderSchema");

/* ── PLACE ORDER ─────────────────────────────────── */
exports.placeOrder = async (req, res) => {
  try {
    // Strip any accidental _id from body to avoid duplicate key errors
    const { _id, ...orderData } = req.body;

    // Normalize email
    if (orderData.customerEmail) {
      orderData.customerEmail = orderData.customerEmail.toLowerCase().trim();
    }

    // Set paymentStatus based on method
    if (orderData.paymentMethod === "cod") {
      orderData.paymentStatus = "pending"; // paid on delivery
    } else if (orderData.paymentId) {
      orderData.paymentStatus = "paid";    // online payment completed
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
// Supports  GET /orders          → all orders
//           GET /orders?email=x  → orders for that user only (used by frontend)
exports.fetchOrders = async (req, res) => {
  try {
    const filter = {};

    // Filter by email if provided — this is the per-user query from the frontend
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

/* ── UPDATE ORDER STATUS (admin use) ─────────────── */
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