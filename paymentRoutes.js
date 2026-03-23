// routes/paymentRouter.js
const express = require("express");
const router  = express.Router();
const { confirmCOD } = require("./paymentController");

// POST /api/v1/payment/confirm-cod
router.post("/confirm-cod", confirmCOD);

module.exports = router;