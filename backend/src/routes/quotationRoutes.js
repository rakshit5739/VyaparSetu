const express = require("express");

const router = express.Router();

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const {
    createQuotation,
    getMyQuotations,
    getQuotationsByRequest,
    acceptQuotation,
} = require("../controllers/quotationController");

router.post(
    "/",
    protect,
    authorize("shopkeeper"),
    createQuotation
);

router.get(
    "/my",
    protect,
    authorize("customer"),
    getMyQuotations
);

router.get(
    "/request/:purchaseRequestId",
    protect,
    authorize("customer"),
    getQuotationsByRequest
);

router.put(
    "/:quotationId/accept",
    protect,
    authorize("customer"),
    acceptQuotation
);

module.exports = router;