const express = require("express");
const router  = express.Router();
const {
  getVeg, saveVeg, deleteVeg,
  getNonVeg, saveNonVeg, deleteNonVeg,
} = require("./menuController");

// VEG
router.get("/veg",        getVeg);
router.post("/veg",       saveVeg);
router.delete("/veg/:id", deleteVeg);

// NON-VEG
router.get("/nonveg",        getNonVeg);
router.post("/nonveg",       saveNonVeg);
router.delete("/nonveg/:id", deleteNonVeg);

module.exports = router;