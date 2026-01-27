const express = require("express");
const router = express.Router();
const { placeOrder, fetchOrders } = require("./orderController");

// Place a new order
router.post("/placeorder", placeOrder);

// Fetch all orders
router.get("/", fetchOrders);

module.exports = router;