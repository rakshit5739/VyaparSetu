const express = require("express");

const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const {
    validateProduct,
} = require("../middleware/validators");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("shopkeeper"),
    validateProduct,
    createProduct
);

router.get("/", getAllProducts);

router.get("/:id", getProductById);

router.put(
    "/:id",
    protect,
    authorize("shopkeeper"),
    validateProduct,
    updateProduct
);

router.delete(
    "/:id",
    protect,
    authorize("shopkeeper"),
    deleteProduct
);

module.exports = router;