const express = require("express");
const {
  createRequirement,
  getMyRequirements,
  getIncomingRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
} = require("../controllers/requirementController");
const protect = require("../middleware/authMiddleware");
const upload = require("../utils/fileUpload");

const router = express.Router();

// Apply protect middleware to all routes below
router.use(protect);

router.post("/upload", protect.authorizeRoles("customer"), upload.single("requirementFile"), createRequirement);
router.get("/my", protect.authorizeRoles("customer"), getMyRequirements);
router.get("/incoming", protect.authorizeRoles("shopkeeper"), getIncomingRequirements);
router.get("/:id", getRequirementById);
router.put("/:id", protect.authorizeRoles("customer"), upload.single("requirementFile"), updateRequirement);
router.delete("/:id", protect.authorizeRoles("customer", "admin"), deleteRequirement);

module.exports = router;
