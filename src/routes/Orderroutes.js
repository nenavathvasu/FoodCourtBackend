const router  = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const ctrl    = require("../controllers/orderController");

const OrderRoutes = [
  body("items").isArray({ min: 1 }).withMessage("Items must be a non-empty array"),
  body("items.*.menuItemId").isNumeric().withMessage("Each item must have a valid menuItemId"),
  body("items.*.qty").isInt({ min: 1 }).withMessage("Each item must have qty >= 1"),
  body("deliveryAddress.name").notEmpty().withMessage("Delivery name is required"),
  body("deliveryAddress.phone").notEmpty().withMessage("Delivery phone is required"),
  body("deliveryAddress.address").notEmpty().withMessage("Delivery address is required"),
  body("deliveryAddress.city").notEmpty().withMessage("City is required"),
  body("deliveryAddress.pincode").notEmpty().withMessage("Pincode is required"),
];

// ── User routes ───────────────────────────────────────────────────
router.post("/",           protect, OrderRoutes, validate, ctrl.placeOrder);
router.get("/my",          protect, ctrl.getMyOrders);
router.get("/:id",         protect, ctrl.getOrder);
router.patch("/:id/cancel",protect, ctrl.cancelOrder);

// ── Admin routes ──────────────────────────────────────────────────
router.get("/",            protect, authorize("admin"), ctrl.getAllOrders);
router.patch("/:id/status",protect, authorize("admin"), ctrl.updateOrderStatus);

module.exports = router;