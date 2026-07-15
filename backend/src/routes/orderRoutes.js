const express = require("express");
const {
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/my", protect.authorizeRoles("customer", "shopkeeper"), getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", protect.authorizeRoles("customer", "shopkeeper", "admin"), updateOrderStatus);

module.exports = router;
