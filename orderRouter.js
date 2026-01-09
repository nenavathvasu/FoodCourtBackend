const express = require("express");
const router = express.Router();

const { placeOrder, fetchOrders } = require("./OrderController");
const authMiddleware = require("./authMiddleware");

// PLACE ORDER (protected)
router.post("/placeorder", authMiddleware, placeOrder);

// FETCH ALL ORDERS (protected)
router.get("/", authMiddleware, fetchOrders);

module.exports = router;
