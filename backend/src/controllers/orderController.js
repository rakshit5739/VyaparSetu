const Order = require("../models/Order");

/**
 * Get orders belonging to the logged-in customer/shopkeeper
 * GET /api/orders/my
 */
const getMyOrders = async (req, res) => {
    try {
        let filter = {};

        if (req.user.roles.includes("customer")) {
            filter.customer = req.user._id;
        } else if (req.user.roles.includes("shopkeeper")) {
            filter.shopkeeper = req.user._id;
        } else {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access orders",
            });
        }

        const orders = await Order.find(filter)
            .populate("customer", "name email")
            .populate("shopkeeper", "name email businessCategories")
            .populate("quotation", "estimatedPrice message status")
            .populate(
                "purchaseRequest",
                "title description categories"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


/**
 * Get a single order
 * GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("customer", "name email")
            .populate("shopkeeper", "name email businessCategories")
            .populate("quotation", "estimatedPrice message status")
            .populate(
                "purchaseRequest",
                "title description categories"
            );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const isCustomer = req.user.roles.includes("customer");
        const isShopkeeper = req.user.roles.includes("shopkeeper");

        if (
            (isCustomer &&
                order.customer._id.toString() !== req.user._id.toString()) ||
            (isShopkeeper &&
                order.shopkeeper._id.toString() !== req.user._id.toString())
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this order",
            });
        }

        return res.status(200).json({
            success: true,
            order,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


/**
 * Update order status
 * PUT /api/orders/:id/status
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

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Delivered",
            "Cancelled",
        ];

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

        const isCustomer = req.user.roles.includes("customer");
        const isShopkeeper = req.user.roles.includes("shopkeeper");

        // Customer can update only their own order
        if (
            isCustomer &&
            order.customer.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this order",
            });
        }

        // Shopkeeper can update only their own order
        if (
            isShopkeeper &&
            order.shopkeeper.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this order",
            });
        }

        // Customer can only cancel
        if (isCustomer && status !== "Cancelled") {
            return res.status(403).json({
                success: false,
                message: "Customer can only cancel an order",
            });
        }

        // Shopkeeper cannot cancel
        if (isShopkeeper && status === "Cancelled") {
            return res.status(403).json({
                success: false,
                message: "Shopkeeper cannot cancel an order",
            });
        }

        // Shopkeeper can confirm pending orders
        if (
            isShopkeeper &&
            status === "Confirmed" &&
            order.status !== "Pending"
        ) {
            return res.status(400).json({
                success: false,
                message: "Only pending orders can be confirmed",
            });
        }

        // Shopkeeper can mark confirmed orders as delivered
        if (
            isShopkeeper &&
            status === "Delivered" &&
            order.status !== "Confirmed"
        ) {
            return res.status(400).json({
                success: false,
                message: "Only confirmed orders can be marked as delivered",
            });
        }

        order.status = status;

        await order.save();

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status} successfully`,
            order,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


module.exports = {
    getMyOrders,
    getOrderById,
    updateOrderStatus,
};
