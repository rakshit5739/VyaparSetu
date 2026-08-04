const express = require("express");
const {
  createQuotation,
  // getQuotationsForRequirement,
  // getMyQuotations,
  // acceptQuotation,
} = require("../controllers/quotationController");
const {protect, authorize} = require("../middleware/authMiddleware");
// const upload = require("../utils/fileUpload");

const router = express.Router();

router.use(protect);

router.post("/", protect, authorize("shopkeeper"), createQuotation);
// router.get("/requirement/:requestId", protect.authorizeRoles("customer", "admin"), getQuotationsForRequirement);
// router.get("/my", protect.authorizeRoles("shopkeeper"), getMyQuotations);
// router.put("/:id/accept", protect.authorizeRoles("customer"), acceptQuotation);

module.exports = router;
