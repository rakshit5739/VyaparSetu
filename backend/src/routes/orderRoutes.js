const express = require("express");

const {
    getMyOrders,
    getOrderById,
    updateOrderStatus,
} = require("../controllers/orderController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/my",
    protect,
    authorize("customer", "shopkeeper"),
    getMyOrders
);

router.get(
    "/:id",
    protect,
    getOrderById
);

router.put(
    "/:id/status",
    protect,
    authorize("customer", "shopkeeper", "admin"),
    updateOrderStatus
);

module.exports = router;