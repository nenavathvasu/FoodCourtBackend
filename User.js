const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // Optional profile fields (updated via PATCH /user/profile)
    phone:   { type: String, default: "" },
    city:    { type: String, default: "" },
    address: { type: String, default: "" },
    avatar:  { type: String, default: "" },

    // JWT storage (optional — can be handled stateless)
    token:          { type: String,  default: null },
    tokenExpiresAt: { type: Number,  default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);