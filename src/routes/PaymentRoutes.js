const router  = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const ctrl    = require("../controllers/paymentController");

router.post("/confirm-cod",
  protect,
  body("orderId").notEmpty().withMessage("orderId is required"),
  validate,
  ctrl.confirmCOD
);

router.post("/create-razorpay-order",
  protect,
  body("orderId").notEmpty().withMessage("orderId is required"),
  validate,
  ctrl.createRazorpayOrder
);

router.post("/verify",
  protect,
  [
    body("razorpayOrderId").notEmpty(),
    body("razorpayPaymentId").notEmpty(),
    body("razorpaySignature").notEmpty(),
  ],
  validate,
  ctrl.verifyPayment
);

module.exports = router;