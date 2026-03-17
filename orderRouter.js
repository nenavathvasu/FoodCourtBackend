const express = require("express");
const router  = express.Router();
const {
  placeOrder,
  fetchOrders,
  getOrder,
  updateOrderStatus,
} = require("./OrderController");

// Public — frontend uses email param for per-user filtering
router.post("/placeorder", placeOrder);
router.get("/",            fetchOrders);       // GET /orders?email=x@y.com
router.get("/:id",         getOrder);

// Admin / internal
router.patch("/:id/status", updateOrderStatus);

module.exports = router;