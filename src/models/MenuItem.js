const mongoose = require("mongoose");

/**
 * DESIGN FIX: Merged Veg + NonVeg into one MenuItem model.
 *
 * Why? Having two identical schemas is duplicate code.
 * Use the `category` field to distinguish:  "Veg" | "Non-Veg" | "Beverages" etc.
 * Filter queries:  MenuItem.find({ category: "Veg" })
 */
const menuItemSchema = new mongoose.Schema(
  {
    itemId: {
      type:     Number,
      required: [true, "Item ID is required"],
      unique:   true,
    },
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
    },
    description: {
      type:     String,
      required: [true, "Description is required"],
      trim:     true,
    },
    price: {
      type:     Number,
      required: [true, "Price is required"],
      min:      [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min:  [0, "Original price cannot be negative"],
    },
    image: {
      type:     String,
      required: [true, "Image URL is required"],
    },
    category: {
      type:    String,
      enum:    ["Veg", "Non-Veg", "Beverages", "Desserts", "Starters"],
      default: "Veg",
    },
    rating:     { type: Number, default: 4.0, min: 0, max: 5 },
    reviews:    { type: Number, default: 0, min: 0 },
    bestseller: { type: Boolean, default: false },
    spicy:      { type: Boolean, default: false },
    discount:   { type: Number, default: 0, min: 0, max: 100 },
    stock:      { type: Number, default: 100, min: 0 },
    isAvailable:{ type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Indexes for common query patterns ─────────────────────────────
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ bestseller: 1 });

module.exports = mongoose.model("MenuItem", menuItemSchema);