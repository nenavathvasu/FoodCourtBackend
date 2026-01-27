const {
  saveVegItem,
  getVegItems,
  saveNonVegItem,
  getNonVegItems,
  deleteVegItem,
  deleteNonVegItem
} = require("./menuService");

// VEG
exports.saveVeg = async (req, res) => {
  try {
    const result = await saveVegItem(req.body);
    res.status(201).json({ message: "Veg item saved", result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getVeg = async (req, res) => {
  try {
    const list = await getVegItems();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteVeg = async (req, res) => {
  try {
    const result = await deleteVegItem(req.params.id);
    res.json({ message: "Veg item deleted", result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NON-VEG
exports.saveNonVeg = async (req, res) => {
  try {
    const result = await saveNonVegItem(req.body);
    res.status(201).json({ message: "Non-Veg item saved", result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNonVeg = async (req, res) => {
  try {
    const list = await getNonVegItems();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteNonVeg = async (req, res) => {
  try {
    const result = await deleteNonVegItem(req.params.id);
    res.json({ message: "Non-Veg item deleted", result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};