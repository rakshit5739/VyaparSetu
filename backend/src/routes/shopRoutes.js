const express = require("express");
const { 
        createShop,
        getAllShops, 
        getShopById, 
        updateShop, 
        deleteShop 
    } = require("../controllers/shopController");
const { 
        protect, 
        authorize 
    } = require("../middleware/authMiddleware");
const { 
        validateShop 
    } = require("../middleware/validators");

const router = express.Router();

router.post("/", protect, authorize("shopkeeper"), validateShop, createShop);
router.get("/", getAllShops);
router.get("/:id", getShopById);
router.put("/:id", protect, authorize("shopkeeper"), validateShop, updateShop);
router.delete("/:id", protect, authorize("shopkeeper"), deleteShop);

module.exports = router;
