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

router.post(
    "/create",
    protect,
    authorize("shopkeeper"),
    createQuotation
);

router.get(
    "/my",
    protect,
    getMyQuotations
);

router.get(
    "/request/:purchaseRequestId",
    protect,
    getQuotationsByRequest
);

router.get(
    "/requirement/:purchaseRequestId",
    protect,
    getQuotationsByRequest
);

router.put(
    "/:quotationId/accept",
    protect,
    authorize("customer"),
    acceptQuotation
);

module.exports = router;