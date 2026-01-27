const express = require("express");
const router = express.Router();

const {
  getVeg,
  saveVeg,
  deleteVeg,
  getNonVeg,
  saveNonVeg,
  deleteNonVeg
} = require("./menuController"); // renamed from service for clarity

// VEG routes
router.get("/veg", getVeg);
router.post("/veg", saveVeg);
router.delete("/veg/:id", deleteVeg);

// NON-VEG routes
router.get("/nonveg", getNonVeg);
router.post("/nonveg", saveNonVeg);
router.delete("/nonveg/:id", deleteNonVeg);

module.exports = router;