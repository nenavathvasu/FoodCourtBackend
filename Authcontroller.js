require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const User   = require("./User");


/* ── REGISTER ──────────────────────────────────────── */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── LOGIN ─────────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Store token on user doc (optional — useful for single-session enforcement)
    user.token          = token;
    user.tokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        phone:   user.phone,
        city:    user.city,
        address: user.address,
        avatar:  user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── UPDATE PROFILE ────────────────────────────────── */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, city, address } = req.body;
    const userId = req.user.id; // set by authMiddleware

    const updates = {};
    if (name)    updates.name    = name.trim();
    if (email)   updates.email   = email.toLowerCase().trim();
    if (phone)   updates.phone   = phone.trim();
    if (city)    updates.city    = city.trim();
    if (address) updates.address = address.trim();

    // Check new email not taken by another user
    if (email) {
      const taken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (taken) return res.status(400).json({ message: "Email already in use" });
    }

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true })
      .select("-password -token");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── CHANGE PASSWORD ───────────────────────────────── */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};