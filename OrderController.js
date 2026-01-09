const Order = require("./OrderSchema");

// PLACE ORDER
exports.placeOrder = async (req, res) => {
  try {
    // Safety checks
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.body._id) delete req.body._id;

    const newOrder = new Order({
      ...req.body,
      user: req.user.id, // attach logged-in user
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      result: savedOrder,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: err.message });
  }
};

// FETCH ORDERS
exports.fetchOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: err.message });
  }
};
