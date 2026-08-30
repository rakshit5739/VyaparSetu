const express = require("express");

const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

const { createPurchaseRequest,
        getMatchingRequests,
        getMyPurchaseRequests} = require("../controllers/purchaseRequestController");

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

router.get(
    "/my",
    protect,
    authorize("customer"),
    getMyPurchaseRequests
);

module.exports = router;