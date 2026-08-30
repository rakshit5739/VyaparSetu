const express = require("express");
const {
  createQuotation,
  getQuotationsForPurchaseRequest,
  // getMyQuotations,
  acceptQuotation
} = require("../controllers/quotationController");
const {protect, authorize} = require("../middleware/authMiddleware");
// const upload = require("../utils/fileUpload");

const router = express.Router();

router.use(protect);

router.post("/", protect, authorize("shopkeeper"), createQuotation);
router.get(
    "/:purchaseRequestId",
    protect,
    authorize("customer"),
    getQuotationsForPurchaseRequest
);
router.put(
    "/:id/accept",
    protect,
    authorize("customer"),
    acceptQuotation
);


module.exports = router;
