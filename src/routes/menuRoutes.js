const router    = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const ctrl      = require("../controllers/menuController");

// ── Public ────────────────────────────────────────────────────────
// GET /api/v1/menu                  — all available items
// GET /api/v1/menu?category=Veg     — filter by category
// GET /api/v1/menu/:id              — single item
router.get("/",    ctrl.getMenu);
router.get("/:id", ctrl.getMenuItem);

// ── Admin only ────────────────────────────────────────────────────
router.use(protect, authorize("admin"));
router.post("/",    ctrl.createMenuItem);
router.put("/:id",  ctrl.updateMenuItem);
router.delete("/:id", ctrl.deleteMenuItem);

module.exports = router;