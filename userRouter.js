const express = require("express");
const router = express.Router();

// Middleware
const auth = require("./authMiddleWare");

// Controllers
const {
  register,
  login,
  updateProfile,
  changePassword
} = require("./Authcontroller");

// Model
const User = require("./User");


// ================= PUBLIC ROUTES =================

// Register new user
router.post("/register", register);

// Login user
router.post("/login", login);


// Check if email already exists
router.post("/check-email", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const exists = await User.findOne({ email });

    res.json({ exists: !!exists });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= PROTECTED ROUTES =================

// Update profile
router.patch("/profile", auth, updateProfile);

// Change password
router.patch("/change-password", auth, changePassword);


// Get logged in user profile
router.get("/me", auth, async (req, res) => {
  try {

    const user = await User
      .findById(req.user.id)
      .select("-password -token");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;