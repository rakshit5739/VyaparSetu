const Product = require("../models/Product");
const Shop = require("../models/Shop");

/**
 * @desc    Create a new product (must own the shop)
 * @route   POST /api/products
 * @access  Private
 */
const createProduct = async (req, res) => {
  try {
    const { productName, brand, category, price, stock, image, shopId } = req.body;

    // Verify the shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Verify the authenticated user owns this shop
    if (shop.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized, you do not own this shop",
      });
    }

    const product = await Product.create({
      productName,
      brand,
      category,
      price,
      stock,
      image,
      shopId,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all products with search, filter, sort & pagination
 * @route   GET /api/products?search=xxx&category=xxx&brand=xxx&minPrice=10&maxPrice=100&sort=price_asc&page=1&limit=10
 * @access  Public
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
      shopId,
    } = req.query;

    // Build filter object
    const filter = {};

    if (shopId) {
      filter.shopId = shopId;
    }

    // Search by productName (case-insensitive regex)
    if (search) {
      filter.productName = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category) {
      filter.category = category.toLowerCase();
    }

    // Filter by brand
    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Determine sort order
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitNum);

    const products = await Product.find(filter)
      .populate("shopId", "shopName city")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      totalPages,
      currentPage: pageNum,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get a single product by ID (populates full shop details)
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "shopId",
      "shopName ownerName address city phone email"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update a product (only by shop owner)
 * @route   PUT /api/products/:id
 * @access  Private
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Verify the shop owner matches the authenticated user
    const shop = await Shop.findById(product.shopId);
    if (!shop || shop.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized, you do not own this shop",
      });
    }

    const { productName, brand, category, price, stock, image } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { productName, brand, category, price, stock, image },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete a product (only by shop owner)
 * @route   DELETE /api/products/:id
 * @access  Private
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Verify the shop owner matches the authenticated user
    const shop = await Shop.findById(product.shopId);
    if (!shop || shop.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized, you do not own this shop",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
