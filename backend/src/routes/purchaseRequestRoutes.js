const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const { createPurchaseRequest, } = require("../controllers/purchaseRequestController");

router.post(
    "/",
    protect,
    createPurchaseRequest
);

module.exports = router;