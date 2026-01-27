const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  token: { type: String, default: null },
  tokenExpiresAt: { type: Number, default: null }
});

module.exports = mongoose.model("User", userSchema);