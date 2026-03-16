const Veg    = require("../express-demo/Veg");
const NonVeg = require("../express-demo/NonVeg");

/* ── VEG ─────────────────────────────────────────── */
exports.getVeg = async (req, res) => {
  try {
    const items = await Veg.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveVeg = async (req, res) => {
  try {
    const result = await Veg.create(req.body);
    res.status(201).json({ message: "Veg item saved", result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteVeg = async (req, res) => {
  try {
    const result = await Veg.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Veg item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── NON-VEG ─────────────────────────────────────── */
exports.getNonVeg = async (req, res) => {
  try {
    const items = await NonVeg.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveNonVeg = async (req, res) => {
  try {
    const result = await NonVeg.create(req.body);
    res.status(201).json({ message: "Non-Veg item saved", result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteNonVeg = async (req, res) => {
  try {
    const result = await NonVeg.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Non-Veg item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};