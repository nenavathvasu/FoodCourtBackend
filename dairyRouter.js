const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Dairy = require("./Dairy");

/* ================== CREATE ================== */
router.post("/add", async (req, res) => {
  try {
    const { name, category, price, rating, image } = req.body;

    const newItem = new Dairy({ name, category, price, rating, image });
    const savedItem = await newItem.save();

    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ================== READ ================== */
router.get("/", async (req, res) => {
  try {
    const items = await Dairy.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================== GET ONE ================== */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // ✅ Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Dairy ID" });
  }

  try {
    const item = await Dairy.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================== UPDATE ================== */
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Dairy ID" });
  }

  try {
    const updatedItem = await Dairy.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem)
      return res.status(404).json({ message: "Item not found" });

    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ================== DELETE ================== */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Dairy ID" });
  }

  try {
    const deletedItem = await Dairy.findByIdAndDelete(id);

    if (!deletedItem)
      return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
