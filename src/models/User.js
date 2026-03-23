const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const { SALT_ROUNDS } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type:      String,
      required:  [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:    false,   // never returned in queries by default
    },
    phone:   { type: String, default: "", trim: true },
    city:    { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    avatar:  { type: String, default: "" },
    role:    { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Hash password before save ─────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// ── Instance method: verify password ─────────────────────────────
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// ── Never return password field ───────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);