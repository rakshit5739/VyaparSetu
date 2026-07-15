const express = require("express");
const { createShop, getAllShops, getShopById, updateShop, deleteShop } = require("../controllers/shopController");
const protect = require("../middleware/authMiddleware");
const { validateShop } = require("../middleware/validators");

const router = express.Router();

router.post("/", protect, validateShop, createShop);
router.get("/", getAllShops);
router.get("/:id", getShopById);
router.put("/:id", protect, validateShop, updateShop);
router.delete("/:id", protect, deleteShop);

module.exports = router;
