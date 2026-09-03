const express = require("express");

const router = express.Router();

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const {
    createQuotation,
} = require("../controllers/quotationController");

router.post(
    "/",
    protect,
    authorize("shopkeeper"),
    createQuotation
);

module.exports = router;