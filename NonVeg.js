const mongoose = require("mongoose");

const NonVegSchema = new mongoose.Schema(
  {
    id:          { type: Number, required: true, unique: true },
    name:        { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price:       { type: Number, required: true },
    originalPrice: { type: Number },
    image:       { type: String, required: true },
    category:    { type: String, default: "Non-Veg" },
    rating:      { type: Number, default: 4.0 },
    reviews:     { type: Number, default: 0 },
    bestseller:  { type: Boolean, default: false },
    spicy:       { type: Boolean, default: false },
    discount:    { type: Number, default: 0 },
    stock:       { type: Number, default: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NonVeg", NonVegSchema);