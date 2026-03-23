// paymentRoutes.js  ← file MUST be named exactly this
const express = require("express");
const router  = express.Router();
const { confirmCOD } = require("./paymentController"); // ✅ matches paymentController.js

router.post("/confirm-cod", confirmCOD);

module.exports = router;