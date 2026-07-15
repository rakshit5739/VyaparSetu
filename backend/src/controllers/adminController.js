const User = require("../models/User");
const Shop = require("../models/Shop");
const Requirement = require("../models/Requirement");
const Quotation = require("../models/Quotation");
const Order = require("../models/Order");

/**
 * @desc    Get dashboard analytics / stats (Admin only)
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalShopkeepers = await User.countDocuments({ role: "shopkeeper" });
    const totalShops = await Shop.countDocuments();
    const totalRequirements = await Requirement.countDocuments();
    const totalQuotations = await Quotation.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Grouping status breakdowns
    const requirementsStatus = await Requirement.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const ordersStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalShopkeepers,
        totalShops,
        totalRequirements,
        totalQuotations,
        totalOrders,
        requirementsStatus,
        ordersStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all users list (Admin only)
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all shops list (Admin only)
 * @route   GET /api/admin/shops
 * @access  Private (Admin only)
 */
const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate("userId", "name email").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
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
 * @desc    Get all requirements list (Admin only)
 * @route   GET /api/admin/requirements
 * @access  Private (Admin only)
 */
const getAllRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find()
      .populate("customerId", "name email city")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      requirements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  getAllShops,
  getAllRequirements,
};
