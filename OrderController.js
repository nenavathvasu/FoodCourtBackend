const Order = require("./OrderSchema");

// Place order
exports.placeOrder = async (req, res) => {
  try {
    // Prevent accidental _id duplication
    if (req.body._id) delete req.body._id;

    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(200).json({ message: "Order saved successfully", result: savedOrder });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: err.message });
  }
};

// Fetch all orders
exports.fetchOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: err.message });
  }
};
