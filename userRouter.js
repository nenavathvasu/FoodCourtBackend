const express = require("express");
const router  = express.Router();
const auth    = require("../express-demo/authMiddleWare");
const {
  register,
  login,
  updateProfile,
  changePassword,
} = require("../express-demo/Authcontroller");
const User = require("../express-demo/User");

// Public
router.post("/register", register);
router.post("/login",    login);

// Check if email exists (used in registration flow)
router.post("/check-email", async (req, res) => {
  try {
    const exists = !!(await User.findOne({ email: req.body.email?.toLowerCase() }));
    res.json({ exists });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected — requires valid JWT
router.patch("/profile",         auth, updateProfile);
router.patch("/change-password", auth, changePassword);

// GET current user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -token");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;