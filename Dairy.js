const mongoose = require("mongoose");

const dairySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // milk, curd, eggs, butter
  price: { type: Number, required: true },
  rating: { type: Number, default: 4.2 },
  image: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Dairy", dairySchema);
