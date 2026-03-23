const MenuItem = require("../models/MenuItem");

// ── GET ALL (with category filter) ───────────────────────────────
exports.getMenu = async (req, res, next) => {
  try {
    const filter = { isAvailable: true };
    if (req.query.category) filter.category = req.query.category;

    const items = await MenuItem.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
};

// ── GET SINGLE ────────────────────────────────────────────────────
exports.getMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// ── CREATE (admin only) ───────────────────────────────────────────
exports.createMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, message: "Menu item created", data: item });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE (admin only) ───────────────────────────────────────────
exports.updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.status(200).json({ success: true, message: "Menu item updated", data: item });
  } catch (err) {
    next(err);
  }
};

// ── DELETE (admin only) ───────────────────────────────────────────
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.status(200).json({ success: true, message: "Menu item deleted" });
  } catch (err) {
    next(err);
  }
};