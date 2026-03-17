const express = require("express");
const router  = express.Router();
const auth    = require("./authMiddleWare"); // ✅ same folder
const {
  register,
  login,
  updateProfile,
  changePassword,
} = require("./AuthController");             // ✅ same folder
const User = require("./User");              // ✅ same folder

// ── PUBLIC ──────────────────────────────────────────
router.post("/register", register);
router.post("/login",    login);

router.post("/check-email", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });
    const exists = await User.findOne({ email });
    res.json({ exists: !!exists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PROTECTED ────────────────────────────────────────
router.patch("/profile",         auth, updateProfile);
router.patch("/change-password", auth, changePassword);

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -token");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;