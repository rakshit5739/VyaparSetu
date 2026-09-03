const express = require("express");

const router = express.Router();

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
    createPurchaseRequest,
    getMatchingRequests,
    getMyPurchaseRequests,
} = require("../controllers/purchaseRequestController");

router.post(
    "/",
    protect,
    authorize("customer"),
    upload.single("file"),
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