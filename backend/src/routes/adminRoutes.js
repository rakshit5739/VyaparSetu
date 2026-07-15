const express = require("express");
const {
  getStats,
  getAllUsers,
  getAllShops,
  getAllRequirements,
} = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Restrict all admin endpoints to Admin role only
router.use(protect, protect.authorizeRoles("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.get("/shops", getAllShops);
router.get("/requirements", getAllRequirements);

module.exports = router;
