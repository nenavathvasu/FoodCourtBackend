const express = require("express");
const router = express.Router();

const { register } = require("./registerController");
const { login } = require("./loginController");
const User = require("./userSchema");

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Check if email exists
router.post("/check-email", async (req, res) => {
  try {
    const exists = !!(await User.findOne({ email: req.body.email }));
    res.json({ exists });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;