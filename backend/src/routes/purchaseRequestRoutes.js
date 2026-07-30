const express = require("express");

const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

const { createPurchaseRequest, getMatchingRequests} = require("../controllers/purchaseRequestController");

router.post(
    "/",
    protect,
    createPurchaseRequest
);

router.get(
    "/matching",
    protect,
    authorize("shopkeeper"),
    getMatchingRequests
);

module.exports = router;