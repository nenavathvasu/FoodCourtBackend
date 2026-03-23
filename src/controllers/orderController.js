const Order    = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, GST_RATE } = require("../config/constants");

// ── PLACE ORDER ───────────────────────────────────────────────────
exports.placeOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod = PAYMENT_METHOD.COD, discountPercent = 0 } = req.body;

    // Validate & price items from DB (never trust client-sent prices)
    const pricedItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findOne({ itemId: item.menuItemId, isAvailable: true });
      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: `Item with ID ${item.menuItemId} is not available`,
        });
      }
      if (menuItem.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${menuItem.name}" (available: ${menuItem.stock})`,
        });
      }
      pricedItems.push({
        menuItemId: menuItem.itemId,
        name:       menuItem.name,
        price:      menuItem.price,
        qty:        item.qty,
        total:      menuItem.price * item.qty,
      });
    }

    // Compute totals server-side
    const subtotal        = pricedItems.reduce((sum, i) => sum + i.total, 0);
    const discountedAmount = (subtotal * discountPercent) / 100;
    const afterDiscount   = subtotal - discountedAmount;
    const gst             = afterDiscount * GST_RATE;
    const finalTotal      = afterDiscount + gst;

    const order = await Order.create({
      userId:        req.user._id,
      customerEmail: req.user.email,
      items:         pricedItems,
      subtotal,
      discountPercent,
      discountedAmount,
      gst,
      finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === PAYMENT_METHOD.COD
        ? PAYMENT_STATUS.PENDING
        : PAYMENT_STATUS.CREATED,
      deliveryAddress,
    });

    // Reduce stock
    for (const item of pricedItems) {
      await MenuItem.updateOne({ itemId: item.menuItemId }, { $inc: { stock: -item.qty } });
    }

    res.status(201).json({ success: true, message: "Order placed successfully", data: order });
  } catch (err) {
    next(err);
  }
};

// ── GET MY ORDERS ─────────────────────────────────────────────────
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// ── GET ALL ORDERS (admin) ────────────────────────────────────────
exports.getAllOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// ── GET SINGLE ORDER ──────────────────────────────────────────────
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Users can only see their own orders
    if (req.user.role !== "admin" && !order.userId.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE ORDER STATUS (admin) ───────────────────────────────────
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status)        update.status        = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, message: "Order updated", data: order });
  } catch (err) {
    next(err);
  }
};

// ── CANCEL ORDER (user) ───────────────────────────────────────────
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (!order.userId.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const cancellable = [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED];
    if (!cancellable.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status '${order.status}'`,
      });
    }

    // Restore stock
    for (const item of order.items) {
      await MenuItem.updateOne({ itemId: item.menuItemId }, { $inc: { stock: item.qty } });
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save();

    res.status(200).json({ success: true, message: "Order cancelled", data: order });
  } catch (err) {
    next(err);
  }
};