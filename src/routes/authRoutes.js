const router   = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const ctrl     = require("../controllers/authController");

// ── Validation rules ──────────────────────────────────────────────
const registerRules = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const changePasswordRules = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
];

// ── Public routes ─────────────────────────────────────────────────
router.post("/register", registerRules, validate, ctrl.register);
router.post("/login",    loginRules,    validate, ctrl.login);

// ── Protected routes ──────────────────────────────────────────────
router.get("/me", protect, ctrl.getMe);
router.patch("/profile",         protect, ctrl.updateProfile);
router.patch("/change-password", protect, changePasswordRules, validate, ctrl.changePassword);

module.exports = router;