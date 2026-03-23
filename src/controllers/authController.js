const jwt  = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_EXPIRES_IN } = require("../config/constants");

/** Generate a signed JWT for a user */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// ── REGISTER ──────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check duplicate (model has unique index, but gives better message here)
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // Password is hashed in the User model pre-save hook
    const user = await User.create({ name, email, password });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registered successfully",
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // select:false on password — must explicitly include it here
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account is deactivated" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,   // toJSON() strips password automatically
    });
  } catch (err) {
    next(err);
  }
};

// ── GET CURRENT USER ──────────────────────────────────────────────
exports.getMe = async (req, res) => {
  // req.user is already attached by protect middleware
  res.status(200).json({ success: true, user: req.user });
};

// ── UPDATE PROFILE ────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, city, address } = req.body;

    // If changing email, check it's not taken by another user
    if (email) {
      const taken = await User.findOne({
        email:  email.toLowerCase(),
        _id:    { $ne: req.user._id },
      });
      if (taken) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }
    }

    const updates = {};
    if (name)    updates.name    = name.trim();
    if (email)   updates.email   = email.toLowerCase().trim();
    if (phone)   updates.phone   = phone.trim();
    if (city)    updates.city    = city.trim();
    if (address) updates.address = address.trim();

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: "Profile updated", user: updated });
  } catch (err) {
    next(err);
  }
};

// ── CHANGE PASSWORD ───────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;   // pre-save hook re-hashes automatically
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};