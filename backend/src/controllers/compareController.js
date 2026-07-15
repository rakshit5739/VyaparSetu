const Product = require("../models/Product");

/**
 * @desc    Compare prices for a product across all shops
 * @route   GET /api/compare?productName=xxx
 * @access  Public
 */
const compareProductPrices = async (req, res) => {
  try {
    const { productName } = req.query;

    // Validate that productName query param is provided
    if (!productName) {
      return res.status(400).json({
        success: false,
        message: "Please provide a productName query parameter",
      });
    }

    // Find all products matching the name (case-insensitive)
    const products = await Product.find({
      productName: { $regex: productName, $options: "i" },
    })
      .populate("shopId", "shopName ownerName address city phone")
      .sort({ price: 1 }); // Sort ascending by price (cheapest first)

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found matching "${productName}"`,
      });
    }

    // Map results to the required format and mark the cheapest
    const results = products.map((product, index) => ({
      productName: product.productName,
      brand: product.brand,
      price: product.price,
      shop: {
        shopName: product.shopId ? product.shopId.shopName : null,
        address: product.shopId ? product.shopId.address : null,
        city: product.shopId ? product.shopId.city : null,
        phone: product.shopId ? product.shopId.phone : null,
        shopId: product.shopId ? product.shopId._id : null,
      },
      isCheapest: index === 0, // First item is cheapest (sorted asc)
    }));

    res.status(200).json({
      success: true,
      count: results.length,
      productName,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { compareProductPrices };
