const Shop = require("../models/Shop");
const Product = require("../models/Product");

/**
 * @desc    Create a new shop
 * @route   POST /api/shops
 * @access  Private
 */
const createShop = async (req, res) => {
  try {
    const { shopName, ownerName, address, city, phone, email, location } = req.body;

    const shop = await Shop.create({
      shopName,
      ownerName,
      address,
      city,
      phone,
      email,
      location,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all shops (public) with city filter & pagination
 * @route   GET /api/shops?city=xxx&page=1&limit=10
 * @access  Public
 */
const getAllShops = async (req, res) => {
  try {
    const { city, page = 1, limit = 10, userId } = req.query;

    // Build filter object
    const filter = {};
    if (city) {
      filter.city = city.toLowerCase();
    }
    if (userId) {
      filter.userId = userId;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalShops = await Shop.countDocuments(filter);
    const totalPages = Math.ceil(totalShops / limitNum);

    const shops = await Shop.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shops.length,
      totalPages,
      currentPage: pageNum,
      shops,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get a single shop by ID (populates userId with name, email)
 * @route   GET /api/shops/:id
 * @access  Public
 */
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate("userId", "name email");

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update a shop (only by owner)
 * @route   PUT /api/shops/:id
 * @access  Private
 */
const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Only the shop owner can update
    if (shop.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized, you are not the owner of this shop",
      });
    }

    const { shopName, ownerName, address, city, phone, email, location } = req.body;

    const updatedShop = await Shop.findByIdAndUpdate(
      req.params.id,
      { shopName, ownerName, address, city, phone, email, location },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      shop: updatedShop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete a shop and all its products (only by owner)
 * @route   DELETE /api/shops/:id
 * @access  Private
 */
const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Only the shop owner can delete
    if (shop.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized, you are not the owner of this shop",
      });
    }

    // Delete all products belonging to this shop
    await Product.deleteMany({ shopId: shop._id });

    // Delete the shop itself
    await Shop.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Shop and all its products deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
};
