const Order = require("../models/Order");

/**
 * @desc    Get orders related to logged-in user (Customer or Shopkeeper)
 * @route   GET /api/orders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "customer") {
      filter.customerId = req.user._id;
    } else if (req.user.role === "shopkeeper") {
      filter.shopkeeperId = req.user._id;
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access orders",
      });
    }

    const orders = await Order.find(filter)
      .populate("customerId", "name email phone city address")
      .populate("shopkeeperId", "name email phone city address")
      .populate("quotationId", "estimatedPrice remarks deliveryTime quotationFile")
      .populate("requirementId", "title category uploadedFile city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customerId", "name email phone city address")
      .populate("shopkeeperId", "name email phone city address")
      .populate("quotationId", "estimatedPrice remarks deliveryTime quotationFile")
      .populate("requirementId", "title category uploadedFile city");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Access control
    if (
      order.customerId._id.toString() !== req.user._id.toString() &&
      order.shopkeeperId._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update order status (Confirm, Deliver, Cancel)
 * @route   PUT /api/orders/:id/status
 * @access  Private
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Please provide a status value",
      });
    }

    const allowedStatuses = ["Pending", "Confirmed", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Access control
    if (
      order.customerId.toString() !== req.user._id.toString() &&
      order.shopkeeperId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order's status",
      });
    }

    // Verify appropriate state transitions
    if (req.user.role === "shopkeeper" && status === "Confirmed" && order.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Can only confirm pending orders",
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status} successfully`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
